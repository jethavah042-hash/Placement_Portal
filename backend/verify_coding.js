require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const CodingProblem = require('./models/CodingProblem');
const CodingNote = require('./models/CodingNote');
const InterviewQuestion = require('./models/InterviewQuestion');
const CodingSubmission = require('./models/CodingSubmission');
const { runCodeOnTestCases } = require('./providers/codeExecution.provider');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
};

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE CODING PRACTICE MODULE VERIFICATION ---');
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
    // 1. Verify 11 Core Topics Notes in MongoDB
    const notesCount = await CodingNote.countDocuments();
    assert(notesCount === 11, `Expected 11 Theoretical Notes, found ${notesCount}`);

    const arraysNote = await CodingNote.findOne({ topic: 'Arrays' });
    assert(arraysNote && arraysNote.algorithms?.length > 0, 'Arrays note contains algorithms and complexity summary');

    // 2. Verify Interview Questions
    const interviewCount = await InterviewQuestion.countDocuments();
    assert(interviewCount >= 100, `Expected >= 100 Interview Questions, found ${interviewCount}`);

    // 3. Verify Coding Problems
    const problemsCount = await CodingProblem.countDocuments();
    assert(problemsCount >= 120, `Expected >= 120 Coding Problems, found ${problemsCount}`);

    const easyCount = await CodingProblem.countDocuments({ difficulty: 'Easy' });
    const medCount = await CodingProblem.countDocuments({ difficulty: 'Medium' });
    const hardCount = await CodingProblem.countDocuments({ difficulty: 'Hard' });
    assert(easyCount > 0 && medCount > 0 && hardCount > 0, `Problems distributed: ${easyCount} Easy, ${medCount} Med, ${hardCount} Hard`);

    // 4. Test Sandboxed Code Execution Provider (JavaScript)
    const testCases = [
      { input: '[2, 7, 11, 15], 9', output: '[0, 1]' },
      { input: '[3, 2, 4], 6', output: '[1, 2]' }
    ];

    const validCode = `
      function solution(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const comp = target - nums[i];
          if (map.has(comp)) return [map.get(comp), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;

    const validRun = await runCodeOnTestCases(validCode, 'javascript', testCases, true);
    assert(validRun.status === 'Accepted' && validRun.passedTests === 2, `Valid code runner status: ${validRun.status} (${validRun.passedTests}/${validRun.totalTests} passed)`);

    // 5. Test Invalid Code Handling
    const wrongCode = `function solution(nums, target) { return [99, 99]; }`;
    const wrongRun = await runCodeOnTestCases(wrongCode, 'javascript', testCases, true);
    assert(wrongRun.status === 'Wrong Answer', `Wrong code correctly flagged: ${wrongRun.status}`);

    // 6. Test Syntax / Runtime Error Sandbox Protection
    const runtimeErrorCode = `function solution(nums, target) { throw new Error("Custom test error"); }`;
    const errorRun = await runCodeOnTestCases(runtimeErrorCode, 'javascript', testCases, true);
    assert(errorRun.status === 'Runtime Error', `Runtime error isolated and caught: ${errorRun.status}`);

    // 7. Verify Submissions & Analytics Calculations
    let testUser = await User.findOne({ email: 'teststudent_coding@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Coding Test Student',
        email: 'teststudent_coding@example.com',
        password: 'password123',
        role: 'student'
      });
    }

    const twoSumProblem = await CodingProblem.findOne({ slug: 'two-sum' });
    assert(twoSumProblem !== null, 'Found Two Sum problem in MongoDB');

    // Create a verified submission
    const sub = await CodingSubmission.create({
      student: testUser._id,
      problem: twoSumProblem._id,
      topic: 'Arrays',
      language: 'javascript',
      code: validCode,
      status: 'Accepted',
      passedTests: 2,
      totalTests: 2,
      executionTime: 5,
      memory: 14.2
    });

    assert(sub && sub.status === 'Accepted', 'Recorded Accepted CodingSubmission in MongoDB');

    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification Exception:', err);
    process.exit(1);
  }
}

runTests();
