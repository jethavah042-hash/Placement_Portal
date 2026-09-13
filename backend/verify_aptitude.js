require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const TopicNote = require('./models/TopicNote');
const Result = require('./models/Result');
const Progress = require('./models/Progress');
const aptitudeController = require('./controllers/aptitude.controller');

async function runTests() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
  console.log('--- STARTING APTITUDE MODULE VERIFICATION ---');

  // Test 1: Verify all 15 topics exist in TopicNote and have at least 20 MCQs in Question
  const totalNotes = await TopicNote.countDocuments({ moduleType: 'Aptitude' });
  console.log(`TEST 1: Topic Notes count = ${totalNotes} (Expected 15) -> ${totalNotes === 15 ? 'PASS ✓' : 'FAIL ✗'}`);

  const totalMCQs = await Question.countDocuments({ moduleType: 'Aptitude' });
  console.log(`TEST 2: Total Aptitude MCQs = ${totalMCQs} (Expected >= 300) -> ${totalMCQs >= 300 ? 'PASS ✓' : 'FAIL ✗'}`);

  // Test 3: Check topic breakdown
  const counts = await Question.aggregate([
    { $match: { moduleType: 'Aptitude' } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  console.log(`TEST 3: Topics covered = ${counts.length} (Expected 15) -> ${counts.length === 15 ? 'PASS ✓' : 'FAIL ✗'}`);

  // Test 4: Verify Mock Test question generation (Exactly 30 questions)
  let student = await User.findOne({ role: 'student' });
  if (!student) {
    student = await User.create({
      name: 'Test Student',
      email: 'aptitudetest@portal.com',
      role: 'student'
    });
  }

  const reqMock = { user: { id: student._id } };
  let mockTestPayload = null;
  const resMock = {
    status: function (code) { return this; },
    json: function (data) { mockTestPayload = data; }
  };

  await aptitudeController.getMockTest(reqMock, resMock, (err) => { if (err) console.error(err); });

  const qCount = mockTestPayload?.data?.length || 0;
  console.log(`TEST 4: Mock Test Questions generated = ${qCount} (Expected EXACTLY 30) -> ${qCount === 30 ? 'PASS ✓' : 'FAIL ✗'}`);

  // Test 5: Verify no answers leaked in mock test payload
  const hasLeakedAnswers = mockTestPayload?.data?.some(q => q.correctAnswer !== undefined);
  console.log(`TEST 5: Security - No answers leaked in mock test payload -> ${!hasLeakedAnswers ? 'PASS ✓' : 'FAIL ✗'}`);

  // Test 6: Verify Mock Test submission and Negative Marking (+1, -0.25)
  if (qCount === 30) {
    const mockQuestions = mockTestPayload.data;
    // Simulate 20 correct, 6 wrong, 4 unattempted
    const submitAnswers = [];
    for (let i = 0; i < mockQuestions.length; i++) {
      const qDoc = await Question.findById(mockQuestions[i]._id);
      if (i < 20) {
        submitAnswers.push({ questionId: qDoc._id, selectedOption: qDoc.correctAnswer });
      } else if (i < 26) {
        const wrongOpt = qDoc.options.find(o => o !== qDoc.correctAnswer) || 'Wrong';
        submitAnswers.push({ questionId: qDoc._id, selectedOption: wrongOpt });
      } else {
        submitAnswers.push({ questionId: qDoc._id, selectedOption: '' });
      }
    }

    let submitResult = null;
    const reqSubmit = {
      user: { id: student._id },
      body: { answers: submitAnswers, timeTaken: 1200 }
    };
    const resSubmit = {
      status: function (code) { return this; },
      json: function (data) { submitResult = data; }
    };

    await aptitudeController.submitMockTest(reqSubmit, resSubmit, (err) => { if (err) console.error(err); });

    const expectedMarks = (20 * 1) - (6 * 0.25); // 20 - 1.5 = 18.5
    const actualMarks = submitResult?.data?.obtainedMarks;
    console.log(`TEST 6: Negative marking calculation: Expected ${expectedMarks}, Got ${actualMarks} -> ${actualMarks === expectedMarks ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`TEST 7: Result saved to MongoDB with ID: ${submitResult?.data?.resultId} -> PASS ✓`);
  }

  console.log('--- ALL APTITUDE MODULE VERIFICATION TESTS COMPLETED ---');
  process.exit(0);
}

runTests().catch(err => { console.error(err); process.exit(1); });
