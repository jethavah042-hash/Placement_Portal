require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const { signAccessToken } = require('./utils/jwt');
const app = require('./app');

async function runVerification() {
  console.log('=== COMMENCING ANNOUNCEMENT & DASHBOARD E2E AUTOMATED VERIFICATION ===\n');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  const server = app.listen(5007);
  const BASE_URL = 'http://localhost:5007/api';

  let student = await User.findOne({ email: 'student_ann_test@example.com' });
  if (!student) {
    student = await User.create({
      name: 'Hardik Student Tester',
      email: 'student_ann_test@example.com',
      password: 'Password123!',
      role: 'student',
      college: 'Marwadi University',
      branch: 'MCA',
      graduationYear: '2026',
      targetCompanies: ['TCS', 'Infosys', 'Amazon'],
      authProvider: 'local',
      accountStatus: 'active'
    });
  }

  let admin = await User.findOne({ email: 'admin_ann_test@example.com' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Ann Tester',
      email: 'admin_ann_test@example.com',
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
    // 1. Security check
    console.log('[1. Security Role Enforcement]');
    const forbiddenRes = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        title: 'Unauthorized Announcement',
        companyName: 'Fake Corp',
        jobRole: 'Hacker',
        description: 'Should fail'
      })
    });
    assert(forbiddenRes.status === 403, 'Student rejected from Admin Announcement creation with 403 Forbidden');

    // 2. Student Published Announcements
    console.log('\n[2. Student Published Announcements API]');
    const publishedRes = await fetch(`${BASE_URL}/announcements/published`, { headers: studentHeaders });
    const publishedData = await publishedRes.json();
    assert(publishedRes.status === 200 && publishedData.success, 'Published announcements retrieved for student with 200 OK');
    assert(publishedData.data.length >= 1, `Found ${publishedData.data.length} active announcements`);
    const sampleAnn = publishedData.data[0];
    assert(sampleAnn.companyName && sampleAnn.jobRole && sampleAnn.package, 'Announcement has companyName, jobRole, package');

    // 3. Admin All Announcements
    console.log('\n[3. Admin Announcements List & Filters]');
    const adminListRes = await fetch(`${BASE_URL}/announcements?page=1&limit=10`, { headers: adminHeaders });
    const adminListData = await adminListRes.json();
    assert(adminListRes.status === 200 && adminListData.total >= 1, 'Admin retrieved all announcements with pagination');

    // 4. Admin Create Announcement
    console.log('\n[4. Admin Create Announcement & Student Notification]');
    const createRes = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        title: 'Microsoft Azure Cloud Developer Hiring 2026',
        companyName: 'Microsoft',
        jobRole: 'Software Engineer (Cloud)',
        description: 'Building next generation cloud services on Azure with C#, .NET and React.',
        package: '42.0 LPA CTC',
        eligibility: 'MCA / B.Tech / M.Tech (Min 7.0 CGPA)',
        requiredSkills: ['C#', 'Azure', 'React', 'DSA'],
        location: 'Hyderabad / Bengaluru',
        driveDate: '2026-10-15',
        applicationDeadline: '2026-10-10',
        priority: 'Urgent',
        status: 'Published',
        applicationLink: 'https://careers.microsoft.com'
      })
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.data._id, 'Created new Announcement in MongoDB');
    const createdId = createData.data._id;

    // Verify Notification generated for students
    const notif = await Notification.findOne({ title: { $regex: 'Microsoft' } });
    assert(notif !== null, 'Automatic student notification generated for published announcement');

    // 5. Admin Update Announcement
    console.log('\n[5. Admin Update Announcement]');
    const updateRes = await fetch(`${BASE_URL}/announcements/${createdId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        package: '45.0 LPA CTC (Updated)'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.package === '45.0 LPA CTC (Updated)', 'Updated announcement package in MongoDB');

    // 6. Admin Status Toggle: Publish -> Draft
    console.log('\n[6. Admin Status Toggle: Published -> Draft]');
    const statusRes = await fetch(`${BASE_URL}/announcements/${createdId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'Draft' })
    });
    const statusData = await statusRes.json();
    assert(statusRes.status === 200 && statusData.data.status === 'Draft', 'Marked announcement as Draft');

    // 7. Verify Draft announcement is NOT returned in student published API
    console.log('\n[7. Verify Draft Announcement Hidden from Students]');
    const verifyPubRes = await fetch(`${BASE_URL}/announcements/published`, { headers: studentHeaders });
    const verifyPubData = await verifyPubRes.json();
    const isPresent = verifyPubData.data.some(a => a._id.toString() === createdId);
    assert(!isPresent, 'Draft announcement correctly hidden from Student Published endpoint');

    // 8. Admin Delete Announcement
    console.log('\n[8. Admin Delete Announcement]');
    const delRes = await fetch(`${BASE_URL}/announcements/${createdId}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    assert(delRes.status === 200, 'Deleted announcement as Admin');

    // Clean up test notif
    await Notification.deleteMany({ title: { $regex: 'Microsoft' } });
  } catch (err) {
    console.error('Fatal verification error:', err);
    failed++;
  }

  console.log(`\n=== ANNOUNCEMENT VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  server.close();
  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
}

runVerification();
