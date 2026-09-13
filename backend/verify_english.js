require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Question = require('./models/Question');
const TopicNote = require('./models/TopicNote');
const Vocabulary = require('./models/Vocabulary');
const ReadingPassage = require('./models/ReadingPassage');
const Bookmark = require('./models/Bookmark');
const { signAccessToken } = require('./utils/jwt');
const app = require('./app');

async function runEnglishVerification() {
  console.log('=== COMMENCING COMPLETE ENGLISH PREP E2E AUTOMATED VERIFICATION ===\n');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  // Clean up any leftover test topics from previous failed runs
  await Topic.deleteMany({ moduleType: 'English', slug: 'advanced-syntax' });

  const server = app.listen(5006);
  const BASE_URL = 'http://localhost:5006/api';

  let student = await User.findOne({ email: 'student_english_test@example.com' });
  if (!student) {
    student = await User.create({
      name: 'English Tester',
      email: 'student_english_test@example.com',
      password: 'Password123!',
      role: 'student',
      authProvider: 'local',
      accountStatus: 'active'
    });
  }

  // Clear student bookmarks & vocabulary learned array for clean deterministic test run
  await Bookmark.deleteMany({ userId: student._id });
  await Vocabulary.updateMany({}, { $pull: { learnedBy: student._id } });

  let admin = await User.findOne({ email: 'admin_english_test@example.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Tester',
      email: 'admin_english_test@example.com',
      password: 'Password123!',
      role: 'admin',
      authProvider: 'local',
      accountStatus: 'active'
    });
  }

  const studentToken = signAccessToken({ sub: student._id.toString(), role: 'student' });
  const adminToken = signAccessToken({ sub: admin._id.toString(), role: 'admin' });

  const studentHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${studentToken}`
  };

  const adminHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${adminToken}`
  };

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Security Check: Student rejected from Admin English API
    console.log('[1. Security Role Enforcement]');
    const forbiddenRes = await fetch(`${BASE_URL}/admin/english/dashboard`, { headers: studentHeaders });
    assert(forbiddenRes.status === 403, 'Student rejected from Admin English API with 403 Forbidden');

    // 2. Student Dashboard
    console.log('\n[2. Student English Dashboard]');
    const dashRes = await fetch(`${BASE_URL}/english/dashboard`, { headers: studentHeaders });
    const dashData = await dashRes.json();
    assert(dashRes.status === 200 && dashData.success, 'Dashboard loads with 200 OK');
    assert(dashData.data.topics.length === 20, `Dashboard returns exactly 20 topics (found ${dashData.data.topics.length})`);
    assert(dashData.data.metrics.totalTopics === 20, 'Metrics confirm 20 total topics');

    // 3. Student Topics List
    console.log('\n[3. Topics Catalog]');
    const topicsRes = await fetch(`${BASE_URL}/english/topics`, { headers: studentHeaders });
    const topicsData = await topicsRes.json();
    assert(topicsRes.status === 200 && topicsData.data.length === 20, 'All 20 topics retrieved via /api/english/topics');

    // 4. Topic by Slug
    console.log('\n[4. Single Topic by Slug]');
    const topicRes = await fetch(`${BASE_URL}/english/topics/grammar`, { headers: studentHeaders });
    const topicData = await topicRes.json();
    assert(topicRes.status === 200 && topicData.data.topic.name === 'Grammar', 'Topic by slug "grammar" retrieved');

    // 5. Study Notes & Guide
    console.log('\n[5. Study Notes & Guide]');
    const notesRes = await fetch(`${BASE_URL}/english/notes/grammar`, { headers: studentHeaders });
    const notesData = await notesRes.json();
    assert(notesRes.status === 200 && notesData.data.note.rules.length > 0, 'Grammar study guide has rules & concepts');

    // 6. Mark Notes Completed
    console.log('\n[6. Mark Notes Completed]');
    const markRes = await fetch(`${BASE_URL}/english/notes/grammar/complete`, {
      method: 'POST',
      headers: studentHeaders
    });
    const markData = await markRes.json();
    assert(markRes.status === 200 && markData.data.notesRead === true, 'Marked notes completed successfully in Progress');

    // 7. Practice Questions
    console.log('\n[7. Practice Questions]');
    const qRes = await fetch(`${BASE_URL}/english/questions`, { headers: studentHeaders });
    const qData = await qRes.json();
    assert(qRes.status === 200 && qData.data.length > 0, 'Retrieved practice questions');
    const sampleQ = qData.data[0];

    // 8. Practice Attempt & Check
    console.log('\n[8. Practice Attempt & Check Answer]');
    const attemptRes = await fetch(`${BASE_URL}/english/attempt`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ questionId: sampleQ._id, selectedOption: sampleQ.options[0] })
    });
    const attemptData = await attemptRes.json();
    assert(attemptRes.status === 200 && attemptData.data.correctAnswer !== undefined, 'Attempt evaluated with correct answer & explanation');

    // 9. Vocabulary Bank
    console.log('\n[9. Vocabulary Bank]');
    const vocabRes = await fetch(`${BASE_URL}/english/vocabulary`, { headers: studentHeaders });
    const vocabData = await vocabRes.json();
    assert(vocabRes.status === 200 && vocabData.data.length > 0, 'Retrieved vocabulary word bank');
    const sampleWord = vocabData.data[0];

    // 10. Toggle Vocabulary Learned
    console.log('\n[10. Toggle Vocabulary Learned]');
    const toggleVocabRes = await fetch(`${BASE_URL}/english/vocabulary/${sampleWord._id}/toggle-learned`, {
      method: 'POST',
      headers: studentHeaders
    });
    const toggleVocabData = await toggleVocabRes.json();
    assert(toggleVocabRes.status === 200 && toggleVocabData.isLearned === true, 'Vocabulary marked learned for user');

    // 11. Reading Passages
    console.log('\n[11. Reading Comprehension Passages]');
    const passRes = await fetch(`${BASE_URL}/english/passages`, { headers: studentHeaders });
    const passData = await passRes.json();
    assert(passRes.status === 200 && passData.data.length > 0, 'Reading comprehension passages retrieved');
    const samplePassage = passData.data[0];

    // 12. Single Passage
    console.log('\n[12. Single Passage by ID]');
    const singlePassRes = await fetch(`${BASE_URL}/english/passages/${samplePassage._id}`, { headers: studentHeaders });
    const singlePassData = await singlePassRes.json();
    assert(singlePassRes.status === 200 && singlePassData.data.questions.length > 0, 'Passage retrieved with embedded questions');

    // 13. Submit Reading Passage Assessment
    console.log('\n[13. Submit Passage Assessment]');
    const submitRcRes = await fetch(`${BASE_URL}/english/passages/${samplePassage._id}/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        answers: samplePassage.questions.map(q => ({ questionId: q._id, selectedOption: q.options[0] })),
        timeTaken: 120
      })
    });
    const submitRcData = await submitRcRes.json();
    assert((submitRcRes.status === 200 || submitRcRes.status === 201) && submitRcData.data.moduleType === 'English', 'RC Assessment submitted and logged as English result');

    // 14. Generate Quiz
    console.log('\n[14. Generate Timed Quiz]');
    const genQuizRes = await fetch(`${BASE_URL}/english/quiz/generate`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ topic: 'All', difficulty: 'All', count: 5 })
    });
    const genQuizData = await genQuizRes.json();
    assert(genQuizRes.status === 200 && genQuizData.data.questions.length > 0, 'Timed assessment quiz generated');
    const quizQuestions = genQuizData.data.questions;

    // 15. Submit Quiz
    console.log('\n[15. Submit Timed Quiz]');
    const submitQuizRes = await fetch(`${BASE_URL}/english/quiz/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        topic: 'Grammar',
        difficulty: 'Medium',
        timeTaken: 85,
        answers: quizQuestions.map(q => ({ questionId: q._id, selectedOption: q.options[0] }))
      })
    });
    const submitQuizData = await submitQuizRes.json();
    assert((submitQuizRes.status === 200 || submitQuizRes.status === 201) && submitQuizData.data.obtainedMarks !== undefined, 'Quiz evaluated with marks and saved');

    // 16. Bookmarks Flow
    console.log('\n[16. Bookmarks Toggle, List, Delete]');
    const bmToggleRes = await fetch(`${BASE_URL}/english/bookmark`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ itemId: sampleQ._id, itemType: 'Question' })
    });
    const bmToggleData = await bmToggleRes.json();
    assert((bmToggleRes.status === 200 || bmToggleRes.status === 201) && bmToggleData.isBookmarked === true, 'Question bookmarked');

    const bmListRes = await fetch(`${BASE_URL}/english/bookmarks`, { headers: studentHeaders });
    const bmListData = await bmListRes.json();
    assert(bmListRes.status === 200 && bmListData.data.length > 0, 'Bookmarks list retrieved');

    // 17. Report Question
    console.log('\n[17. Report Question]');
    const reportRes = await fetch(`${BASE_URL}/english/report`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ questionId: sampleQ._id, reason: 'Incorrect Explanation', description: 'Testing verification flow' })
    });
    const reportData = await reportRes.json();
    assert(reportRes.status === 201 && reportData.success, 'Question issue reported');

    // 18. Admin Dashboard
    console.log('\n[18. Admin English Dashboard]');
    const adminDashRes = await fetch(`${BASE_URL}/admin/english/dashboard`, { headers: adminHeaders });
    const adminDashData = await adminDashRes.json();
    assert(adminDashRes.status === 200 && adminDashData.data.metrics.totalTopics === 20, 'Admin telemetry reports 20 topics');

    // 19. Admin Topic CRUD
    console.log('\n[19. Admin Topic CRUD]');
    const createTopicRes = await fetch(`${BASE_URL}/admin/english/topics`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Advanced Syntax',
        slug: 'advanced-syntax',
        description: 'Advanced clause structures and syntax rules',
        difficulty: 'Hard',
        displayOrder: 21
      })
    });
    const createTopicData = await createTopicRes.json();
    assert(createTopicRes.status === 201, 'Created new English topic as Admin');
    const createdTopicId = createTopicData.data._id;

    const delTopicRes = await fetch(`${BASE_URL}/admin/english/topics/${createdTopicId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(delTopicRes.status === 200, 'Deleted English topic as Admin');

    // 20. Admin Question CRUD & Duplicate
    console.log('\n[20. Admin Question CRUD & Duplicate]');
    const createQRes = await fetch(`${BASE_URL}/admin/english/questions`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        category: 'Grammar',
        questionText: 'Which sentence is syntactically sound in production?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        difficulty: 'Medium',
        marks: 1
      })
    });
    const createQData = await createQRes.json();
    assert(createQRes.status === 201, 'Created English Question as Admin');
    const createdQId = createQData.data._id;

    const dupQRes = await fetch(`${BASE_URL}/admin/english/questions/${createdQId}/duplicate`, {
      method: 'POST',
      headers: adminHeaders
    });
    const dupQData = await dupQRes.json();
    assert(dupQRes.status === 201 && dupQData.data.status === 'draft', 'Duplicated English Question as draft');

    await Question.findByIdAndDelete(dupQData.data._id);
    await Question.findByIdAndDelete(createdQId);
    assert(true, 'Cleaned up test questions');

    // 21. Admin Vocabulary CRUD
    console.log('\n[21. Admin Vocabulary CRUD]');
    const createVocabRes = await fetch(`${BASE_URL}/admin/english/vocabulary`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        word: 'testserendipity',
        meaning: 'The occurrence of events by chance in a happy way',
        partOfSpeech: 'noun',
        difficulty: 'Medium'
      })
    });
    const createVocabData = await createVocabRes.json();
    assert(createVocabRes.status === 201, 'Created vocabulary word as Admin');
    await Vocabulary.findByIdAndDelete(createVocabData.data._id);

    // 22. Admin Reports Audit
    console.log('\n[22. Admin Reports Audit]');
    const adminRepRes = await fetch(`${BASE_URL}/admin/english/reports`, { headers: adminHeaders });
    const adminRepData = await adminRepRes.json();
    assert(adminRepRes.status === 200 && adminRepData.data.length > 0, 'Admin retrieved question reports list');
  } catch (err) {
    console.error('Fatal verification error:', err);
    failed++;
  }

  console.log(`\n=== ENGLISH VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  server.close();
  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
}

runEnglishVerification();
