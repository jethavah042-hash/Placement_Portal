require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Topic = require('./models/Topic');
const Question = require('./models/Question');
const TopicNote = require('./models/TopicNote');
const Bookmark = require('./models/Bookmark');
const Result = require('./models/Result');
const Progress = require('./models/Progress');
const QuestionReport = require('./models/QuestionReport');
const { signAccessToken } = require('./utils/jwt');

const BASE_URL = 'http://localhost:5000/api';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
};

async function runReasoningTests() {
  console.log('--- STARTING COMPREHENSIVE REASONING PREP VERIFICATION ---');
  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Get or create Admin & Student test users
    let admin = await User.findOne({ email: 'admin@placementportal.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Portal Administrator',
        email: 'admin@placementportal.com',
        role: 'admin',
        accountStatus: 'active'
      });
    }

    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = await User.create({
        name: 'Student Candidate',
        email: 'candidate@example.com',
        role: 'student',
        accountStatus: 'active'
      });
    }

    const adminToken = signAccessToken({ sub: admin._id.toString(), role: 'admin' });
    const studentToken = signAccessToken({ sub: student._id.toString(), role: 'student' });

    const adminHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `accessToken=${adminToken}`
    };

    const studentHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `accessToken=${studentToken}`
    };

    // 2. Security Test: Student rejected from Admin Reasoning API
    const forbiddenRes = await fetch(`${BASE_URL}/admin/reasoning/dashboard`, { headers: studentHeaders });
    assert(forbiddenRes.status === 403, 'Security: Student rejected from Admin Reasoning API with 403 Forbidden');

    // 3. Admin Reasoning Dashboard
    const adminDashRes = await fetch(`${BASE_URL}/admin/reasoning/dashboard`, { headers: adminHeaders });
    const adminDashJson = await adminDashRes.json();
    assert(
      adminDashRes.status === 200 && adminDashJson.data?.metrics?.totalTopics >= 15,
      `Admin Dashboard: Found ${adminDashJson.data?.metrics?.totalTopics} Reasoning Topics and ${adminDashJson.data?.metrics?.totalQuestions} Questions`
    );

    // 4. Admin Topic CRUD
    const createTopicRes = await fetch(`${BASE_URL}/admin/reasoning/topics`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'Verif Reasoning Topic',
        slug: 'verif-reasoning-topic',
        description: 'Automated test topic verification',
        difficulty: 'Easy',
        estimatedStudyTime: '30 mins',
        status: 'active',
        displayOrder: 99
      })
    });
    const createTopicJson = await createTopicRes.json();
    const createdTopicId = createTopicJson.data?._id;
    assert(createTopicRes.status === 201 && createTopicJson.data?.name === 'Verif Reasoning Topic', 'Admin created new Reasoning Topic in MongoDB');

    const updateTopicRes = await fetch(`${BASE_URL}/admin/reasoning/topics/${createdTopicId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ difficulty: 'Hard' })
    });
    const updateTopicJson = await updateTopicRes.json();
    assert(updateTopicJson.data?.difficulty === 'Hard', 'Admin updated Reasoning Topic difficulty in MongoDB');

    const deleteTopicRes = await fetch(`${BASE_URL}/admin/reasoning/topics/${createdTopicId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(deleteTopicRes.status === 200, 'Admin deleted test Reasoning Topic');

    // 5. Admin Question Bank CRUD
    const createQRes = await fetch(`${BASE_URL}/admin/reasoning/questions`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        category: 'Logical Reasoning',
        questionText: 'Test Reasoning Q: 2, 4, 8, 16, ?',
        options: ['24', '30', '32', '36'],
        correctAnswer: '32',
        difficulty: 'Easy',
        marks: 1,
        negativeMarks: 0.25,
        explanation: 'Powers of 2 progression',
        status: 'published'
      })
    });
    const createQJson = await createQRes.json();
    const createdQId = createQJson.data?._id;
    assert(createQRes.status === 201 && createQJson.data?.correctAnswer === '32', 'Admin created Reasoning Question in MongoDB');

    const dupQRes = await fetch(`${BASE_URL}/admin/reasoning/questions/${createdQId}/duplicate`, {
      method: 'POST',
      headers: adminHeaders
    });
    const dupQJson = await dupQRes.json();
    const dupQId = dupQJson.data?._id;
    assert(dupQRes.status === 201 && dupQJson.data?.status === 'draft', 'Admin duplicated question as draft');

    await fetch(`${BASE_URL}/admin/reasoning/questions/${dupQId}`, { method: 'DELETE', headers: adminHeaders });

    // 6. Student Reasoning Dashboard
    const studentDashRes = await fetch(`${BASE_URL}/reasoning/dashboard`, { headers: studentHeaders });
    const studentDashJson = await studentDashRes.json();
    assert(
      studentDashRes.status === 200 && studentDashJson.data?.topics?.length >= 15,
      `Student Dashboard: Loaded ${studentDashJson.data?.topics?.length} topics with dynamic progress calculations`
    );

    // 7. Student Topics List
    const studentTopicsRes = await fetch(`${BASE_URL}/reasoning/topics`, { headers: studentHeaders });
    const studentTopicsJson = await studentTopicsRes.json();
    assert(
      studentTopicsRes.status === 200 && studentTopicsJson.data?.length >= 15,
      'Student fetched active Reasoning topics from MongoDB'
    );

    // 8. Student Notes Reader & Mark Complete
    const notesRes = await fetch(`${BASE_URL}/reasoning/notes/blood-relation`, { headers: studentHeaders });
    const notesJson = await notesRes.json();
    assert(notesRes.status === 200 && notesJson.data?.note?.topic === 'Blood Relation', 'Student retrieved Blood Relation study guide');

    const markReadRes = await fetch(`${BASE_URL}/reasoning/notes/blood-relation/complete`, {
      method: 'POST',
      headers: studentHeaders
    });
    const markReadJson = await markReadRes.json();
    assert(markReadRes.status === 200 && markReadJson.data?.notesRead === true, 'Student marked Blood Relation study guide as read');

    // 9. Student Practice Attempt with Instant Evaluation
    const attemptRes = await fetch(`${BASE_URL}/reasoning/attempt`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        questionId: createdQId,
        selectedOption: '32'
      })
    });
    const attemptJson = await attemptRes.json();
    assert(
      attemptRes.status === 200 && attemptJson.data?.isCorrect === true,
      'Student answered practice question correctly and received step-by-step explanation'
    );

    // 10. Student Timed Quiz Generation & Submission
    const quizGenRes = await fetch(`${BASE_URL}/reasoning/quiz/generate`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ topic: 'All', difficulty: 'All', count: 5 })
    });
    const quizGenJson = await quizGenRes.json();
    const quizQuestions = quizGenJson.data?.questions || [];
    assert(
      quizGenRes.status === 200 && quizQuestions.length > 0,
      `Generated timed reasoning assessment with ${quizQuestions.length} questions`
    );

    const quizAnswers = quizQuestions.map(q => ({
      questionId: q._id,
      selectedOption: q.options[0]
    }));

    const quizSubRes = await fetch(`${BASE_URL}/reasoning/quiz/submit`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        topic: 'All',
        difficulty: 'Medium',
        timeTaken: 120,
        answers: quizAnswers
      })
    });
    const quizSubJson = await quizSubRes.json();
    assert(
      quizSubRes.status === 201 && quizSubJson.data?.totalQuestions === quizQuestions.length,
      'Submitted reasoning quiz and stored Result record in MongoDB'
    );

    // 11. Bookmarking System
    const bookmarkRes = await fetch(`${BASE_URL}/reasoning/bookmark`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({ itemId: createdQId, itemType: 'Question' })
    });
    const bookmarkJson = await bookmarkRes.json();
    assert(bookmarkRes.status === 201 && bookmarkJson.isBookmarked === true, 'Student bookmarked reasoning question in MongoDB');

    const getBookmarksRes = await fetch(`${BASE_URL}/reasoning/bookmarks`, { headers: studentHeaders });
    const getBookmarksJson = await getBookmarksRes.json();
    assert(getBookmarksRes.status === 200 && getBookmarksJson.count > 0, 'Student fetched saved reasoning bookmarks');

    // 12. Question Issue Reporting & Admin Resolution
    const reportRes = await fetch(`${BASE_URL}/reasoning/report`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        questionId: createdQId,
        reason: 'Wrong Answer',
        description: 'Verified option marked correctly in test'
      })
    });
    const reportJson = await reportRes.json();
    const reportId = reportJson.data?._id;
    assert(reportRes.status === 201 && reportJson.data?.reason === 'Wrong Answer', 'Student reported question issue');

    const adminReportsRes = await fetch(`${BASE_URL}/admin/reasoning/reports`, { headers: adminHeaders });
    const adminReportsJson = await adminReportsRes.json();
    assert(adminReportsRes.status === 200 && adminReportsJson.total > 0, 'Admin retrieved reported question issues from MongoDB');

    const resolveRes = await fetch(`${BASE_URL}/admin/reasoning/reports/${reportId}/resolve`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'resolved', adminNotes: 'Verified and resolved' })
    });
    const resolveJson = await resolveRes.json();
    assert(resolveRes.status === 200 && resolveJson.data?.status === 'resolved', 'Admin resolved student issue report');

    // Clean up
    await fetch(`${BASE_URL}/admin/reasoning/questions/${createdQId}`, { method: 'DELETE', headers: adminHeaders });
    await fetch(`${BASE_URL}/admin/reasoning/reports/${reportId}`, { method: 'DELETE', headers: adminHeaders });

  } catch (err) {
    console.error('Verification error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`TOTAL REASONING TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`========================================\n`);

  await mongoose.connection.close();
  process.exit(failed === 0 ? 0 : 1);
}

runReasoningTests();
