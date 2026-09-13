require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Test = require('./models/Test');
const Question = require('./models/Question');
const Result = require('./models/Result');
const jwt = require('./utils/jwt');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
};

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE MOCK TEST MODULE VERIFICATION ---');
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
    // 1. Verify 8 Seeded Tests in MongoDB
    const testsCount = await Test.countDocuments({ isPublished: true });
    assert(testsCount >= 8, `Expected >= 8 Mock Tests in MongoDB, found ${testsCount}`);

    // 2. Verify TCS NQT National Mock Test
    const tcsTest = await Test.findOne({ slug: 'tcs-nqt-national-mock-test' }).populate('questions');
    assert(tcsTest !== null, 'Found TCS NQT National Mock Test');
    assert(tcsTest && tcsTest.questions?.length >= 30, `TCS Test has ${tcsTest?.questions?.length} questions`);

    // 3. Create or find test student
    let testUser = await User.findOne({ email: 'teststudent_mock@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Mock Test Student',
        email: 'teststudent_mock@example.com',
        password: 'password123',
        role: 'student',
        college: 'Engineering Institute of Technology',
        branch: 'Computer Science'
      });
    }

    const token = jwt.signAccessToken({ sub: testUser._id.toString(), role: testUser.role });
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 4. Test GET /api/tests API endpoint
    const listRes = await fetch('http://localhost:5000/api/tests', { headers }).then(r => r.json());
    assert(listRes.success === true && listRes.data?.length >= 8, `GET /api/tests returned ${listRes.data?.length} tests`);

    // 5. Test GET /api/tests/:id API endpoint (Sanitization Check)
    const detailRes = await fetch(`http://localhost:5000/api/tests/${tcsTest._id}`, { headers }).then(r => r.json());
    assert(detailRes.success === true, 'GET /api/tests/:id succeeded');
    const firstQ = detailRes.data?.questions?.[0];
    assert(firstQ && firstQ.correctAnswer === undefined, 'Sanitization: correctAnswer is safely omitted for active test takers');

    // 6. Test POST /api/tests/:id/submit with answers (Negative Marking Check)
    // Prepare answers: Answer first 2 questions correctly, 3rd question incorrectly, rest unattempted
    const q1 = tcsTest.questions[0];
    const q2 = tcsTest.questions[1];
    const q3 = tcsTest.questions[2];

    const answersPayload = {
      [q1._id.toString()]: q1.correctAnswer, // Correct (+1)
      [q2._id.toString()]: q2.correctAnswer, // Correct (+1)
      [q3._id.toString()]: 'INCORRECT_DUMMY_OPTION_FOR_TESTING' // Wrong (-0.25)
    };

    const submitRes = await fetch(`http://localhost:5000/api/tests/${tcsTest._id}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        answers: answersPayload,
        timeTaken: 1200 // 20 mins
      })
    }).then(r => r.json());

    assert(submitRes.success === true, 'POST /api/tests/:id/submit succeeded');
    const resData = submitRes.data;
    assert(resData.correctCount === 2, `Correct count is 2 (got ${resData.correctCount})`);
    assert(resData.wrongCount === 1, `Wrong count is 1 (got ${resData.wrongCount})`);
    assert(resData.obtainedMarks === 1.75, `Obtained marks calculated with negative marking: 1.75 (got ${resData.obtainedMarks})`);

    // 7. Test GET /api/tests/:id/leaderboard
    const lbRes = await fetch(`http://localhost:5000/api/tests/${tcsTest._id}/leaderboard`, { headers }).then(r => r.json());
    assert(lbRes.success === true && lbRes.data?.length > 0, `GET /api/tests/:id/leaderboard returned ${lbRes.data?.length} rankers`);
    assert(lbRes.myRank && lbRes.myRank.rank >= 1, `Student ranked: #${lbRes.myRank?.rank} with score ${lbRes.myRank?.score}`);

    // 8. Test GET /api/tests/my/attempts
    const attemptsRes = await fetch('http://localhost:5000/api/tests/my/attempts', { headers }).then(r => r.json());
    assert(attemptsRes.success === true && attemptsRes.data?.length > 0, `GET /api/tests/my/attempts returned ${attemptsRes.data?.length} historical attempts`);

    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification Error:', err);
    process.exit(1);
  }
}

runTests();
