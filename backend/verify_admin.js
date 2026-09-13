require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const CodingProblem = require('./models/CodingProblem');
const Question = require('./models/Question');
const Company = require('./models/Company');
const Test = require('./models/Test');
const Result = require('./models/Result');
const ResumeScan = require('./models/ResumeScan');
const Notification = require('./models/Notification');
const AdminActivity = require('./models/AdminActivity');
const jwt = require('./utils/jwt');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);
};

async function runAdminTests() {
  console.log('--- STARTING COMPREHENSIVE ADMIN PANEL VERIFICATION ---');
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
    // 1. Ensure Admin and Student test users
    let admin = await User.findOne({ email: 'admin@placementportal.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Master Administrator',
        email: 'admin@placementportal.com',
        password: 'Admin@password123',
        role: 'admin',
        accountStatus: 'active'
      });
    }

    let student = await User.findOne({ email: 'test_candidate_admin@example.com' });
    if (!student) {
      student = await User.create({
        name: 'Test Student Candidate',
        email: 'test_candidate_admin@example.com',
        password: 'password123',
        role: 'student',
        college: 'Marwadi University',
        branch: 'MCA',
        isBlocked: false,
        accountStatus: 'active'
      });
    }

    const adminToken = jwt.signAccessToken({ sub: admin._id.toString(), role: 'admin' });
    const studentToken = jwt.signAccessToken({ sub: student._id.toString(), role: 'student' });

    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
    const studentHeaders = {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    };

    const baseUrl = 'http://localhost:5000/api/admin';

    // 2. Test Admin Authorization Security (Student MUST be rejected with 403)
    const unauthorizedRes = await fetch(`${baseUrl}/dashboard`, { headers: studentHeaders }).then(r => r.json());
    assert(unauthorizedRes.success === false, 'Security: Student rejected from Admin API with 403 Forbidden');

    // 3. Test Dashboard Stats API (Admin access)
    const dashboardRes = await fetch(`${baseUrl}/dashboard`, { headers: adminHeaders }).then(r => r.json());
    assert(dashboardRes.success === true, 'Admin successfully accessed /api/admin/dashboard');
    assert(dashboardRes.data.metrics.totalStudents >= 1, `Dynamic total students: ${dashboardRes.data.metrics.totalStudents}`);
    assert(dashboardRes.data.metrics.totalCodingProblems >= 1, `Dynamic coding problems count: ${dashboardRes.data.metrics.totalCodingProblems}`);
    assert(dashboardRes.data.metrics.totalNotes >= 1, `Dynamic theory notes count: ${dashboardRes.data.metrics.totalNotes}`);

    // 4. Test Student Management (Get Students List)
    const studentsListRes = await fetch(`${baseUrl}/students?page=1&limit=10`, { headers: adminHeaders }).then(r => r.json());
    assert(studentsListRes.success === true && studentsListRes.data.length >= 1, `GET /api/admin/students returned ${studentsListRes.data.length} students`);

    // 5. Test Student Details API
    const studentDetailRes = await fetch(`${baseUrl}/students/${student._id}`, { headers: adminHeaders }).then(r => r.json());
    assert(studentDetailRes.success === true && studentDetailRes.data.student.email === student.email, 'GET /api/admin/students/:id returned full candidate profile');

    // 6. Test Block Student Functionality
    const blockRes = await fetch(`${baseUrl}/students/${student._id}/toggle-block`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ reason: 'Assessment policy violation test' })
    }).then(r => r.json());
    assert(blockRes.success === true && blockRes.data.isBlocked === true, 'POST /api/admin/students/:id/toggle-block successfully BLOCKED student');

    // Unblock Student back
    const unblockRes = await fetch(`${baseUrl}/students/${student._id}/toggle-block`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ reason: 'Reinstated' })
    }).then(r => r.json());
    assert(unblockRes.success === true && unblockRes.data.isBlocked === false, 'POST /api/admin/students/:id/toggle-block successfully UNBLOCKED student');

    // 7. Test Coding Problem CRUD
    const createProblemRes = await fetch(`${baseUrl}/coding/problems`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Admin Verification Matrix Challenge',
        slug: 'admin-verification-matrix-challenge',
        topic: 'Arrays',
        difficulty: 'Medium',
        description: 'Find the maximum path in an NxN matrix.',
        testCases: [{ input: '[[1,2],[3,4]]', expectedOutput: '7', isHidden: false }],
        tags: ['Matrix', 'Arrays'],
        isPublished: true
      })
    }).then(r => r.json());
    assert(createProblemRes.success === true, 'POST /api/admin/coding/problems created new challenge');
    const createdProblemId = createProblemRes.data._id;

    // Update Coding Problem
    const updateProblemRes = await fetch(`${baseUrl}/coding/problems/${createdProblemId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ difficulty: 'Hard' })
    }).then(r => r.json());
    assert(updateProblemRes.success === true && updateProblemRes.data.difficulty === 'Hard', 'PUT /api/admin/coding/problems/:id updated difficulty');

    // Delete Coding Problem
    const deleteProblemRes = await fetch(`${baseUrl}/coding/problems/${createdProblemId}`, {
      method: 'DELETE',
      headers: adminHeaders
    }).then(r => r.json());
    assert(deleteProblemRes.success === true, 'DELETE /api/admin/coding/problems/:id deleted problem');

    // 8. Test Questions Bank CRUD (Aptitude/Reasoning/English)
    const createQuestionRes = await fetch(`${baseUrl}/questions`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        moduleType: 'Aptitude',
        category: 'Percentage',
        topic: 'Percentage',
        difficulty: 'Easy',
        questionText: 'What is 15% of 200?',
        options: ['20', '30', '40', '50'],
        correctAnswer: '30',
        explanation: '15 * 200 / 100 = 30',
        marks: 1,
        negativeMarks: 0.25
      })
    }).then(r => r.json());
    assert(createQuestionRes.success === true, 'POST /api/admin/questions created question in bank');
    const createdQuestionId = createQuestionRes.data._id;

    // Delete Question
    const deleteQuestionRes = await fetch(`${baseUrl}/questions/${createdQuestionId}`, {
      method: 'DELETE',
      headers: adminHeaders
    }).then(r => r.json());
    assert(deleteQuestionRes.success === true, 'DELETE /api/admin/questions/:id deleted question');

    // 9. Test Company Management CRUD
    const createCompanyRes = await fetch(`${baseUrl}/companies`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'AlphaCorp Admin Test',
        industry: 'Cloud Infrastructure',
        avgPackage: '12 LPA',
        eligibility: '70% in Graduation',
        jobRoles: ['DevOps Engineer', 'Cloud Architect'],
        requiredSkills: ['Docker', 'Kubernetes', 'Go']
      })
    }).then(r => r.json());
    assert(createCompanyRes.success === true, 'POST /api/admin/companies created company profile');
    const createdCompanyId = createCompanyRes.data._id;

    // Delete Company
    const deleteCompanyRes = await fetch(`${baseUrl}/companies/${createdCompanyId}`, {
      method: 'DELETE',
      headers: adminHeaders
    }).then(r => r.json());
    assert(deleteCompanyRes.success === true, 'DELETE /api/admin/companies/:id deleted company profile');

    // 10. Test Mock Test Builder CRUD
    const sampleQuestions = await Question.find().limit(3);
    const createTestRes = await fetch(`${baseUrl}/mock-tests`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Admin Automated Assessment Test',
        slug: 'admin-automated-assessment-test',
        category: 'Diagnostic Exam',
        duration: 30,
        passingPercentage: 60,
        negativeMarking: 0.25,
        questions: sampleQuestions.map(q => q._id),
        isPublished: true
      })
    }).then(r => r.json());
    assert(createTestRes.success === true, 'POST /api/admin/mock-tests created new mock test');
    const createdTestId = createTestRes.data._id;

    // Delete Test
    const deleteTestRes = await fetch(`${baseUrl}/mock-tests/${createdTestId}`, {
      method: 'DELETE',
      headers: adminHeaders
    }).then(r => r.json());
    assert(deleteTestRes.success === true, 'DELETE /api/admin/mock-tests/:id deleted test');

    // 11. Test Results & Submissions Retrieval
    const resultsRes = await fetch(`${baseUrl}/results?page=1&limit=5`, { headers: adminHeaders }).then(r => r.json());
    assert(resultsRes.success === true, 'GET /api/admin/results retrieved assessment logs');

    const submissionsRes = await fetch(`${baseUrl}/coding/submissions?page=1&limit=5`, { headers: adminHeaders }).then(r => r.json());
    assert(submissionsRes.success === true, 'GET /api/admin/coding/submissions retrieved coding submissions');

    // 12. Test Resume Scanner Stats API
    const resumeStatsRes = await fetch(`${baseUrl}/resumes/stats`, { headers: adminHeaders }).then(r => r.json());
    assert(resumeStatsRes.success === true && resumeStatsRes.data.totalScans !== undefined, 'GET /api/admin/resumes/stats retrieved ATS metrics');

    // 13. Test Notifications Broadcast API
    const createNotifRes = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'System Maintenance Notice',
        message: 'Portal scheduled update at midnight.',
        type: 'system'
      })
    }).then(r => r.json());
    assert(createNotifRes.success === true, 'POST /api/admin/notifications broadcasted push alert');

    // 14. Test Reports Data API
    const reportsRes = await fetch(`${baseUrl}/reports?module=all&days=30`, { headers: adminHeaders }).then(r => r.json());
    assert(reportsRes.success === true && reportsRes.data.students !== undefined, 'GET /api/admin/reports generated comprehensive audit report');

    // 15. Test Admin Audit Logs API
    const auditLogsRes = await fetch(`${baseUrl}/activity-logs?page=1&limit=10`, { headers: adminHeaders }).then(r => r.json());
    assert(auditLogsRes.success === true && auditLogsRes.data.length >= 1, `GET /api/admin/activity-logs retrieved ${auditLogsRes.data.length} audit trail records`);

    console.log(`\n========================================`);
    console.log(`TOTAL ADMIN TESTS: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
}

runAdminTests();
