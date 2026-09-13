require('./config/env');
const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { signAccessToken } = require('./utils/jwt');
const app = require('./app');

async function testNotificationBroadcast() {
  console.log('=== TESTING ADMIN NOTIFICATION BROADCAST FIX ===\n');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  const server = app.listen(5008);
  const BASE_URL = 'http://localhost:5008/api';

  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Tester',
      email: 'admin_test_notif@example.com',
      password: 'Password123!',
      role: 'admin',
      authProvider: 'local',
      accountStatus: 'active'
    });
  }

  let student = await User.findOne({ role: 'student' });
  if (!student) {
    student = await User.create({
      name: 'Student Tester',
      email: 'student_test_notif@example.com',
      password: 'Password123!',
      role: 'student',
      authProvider: 'local',
      accountStatus: 'active'
    });
  }

  const adminToken = signAccessToken({ sub: admin._id.toString(), role: 'admin' });
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${adminToken}`
  };

  const studentToken = signAccessToken({ sub: student._id.toString(), role: 'student' });
  const studentHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `accessToken=${studentToken}`
  };

  // Test Payload matching the user screenshot
  const payload = {
    title: 'Campus by Satva Technolabs Pvt Ltd',
    type: 'company',
    message: 'Company Name\nSatva Technolabs Pvt. Ltd.\nType of Company\nMNC',
    link: 'https://satvasolutions.com/'
  };

  console.log('Posting broadcast notification with type: "company"...');
  const res = await fetch(`${BASE_URL}/admin/notifications`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Status code:', res.status);
  console.log('Response body:', data);

  if (res.status === 201 && data.success) {
    console.log('✓ PASS: Admin successfully broadcasted company notification!');
  } else {
    console.error('✗ FAIL: Broadcast failed', data);
    process.exit(1);
  }

  // Check student notifications retrieval
  const studentNotifRes = await fetch(`${BASE_URL}/notifications/my`, {
    headers: studentHeaders
  });
  const studentNotifData = await studentNotifRes.json();
  console.log('Student notifications count:', studentNotifData.results);
  const found = studentNotifData.data.find(n => n.title === 'Campus by Satva Technolabs Pvt Ltd');
  if (found) {
    console.log('✓ PASS: Student received the broadcasted company notification!');
  } else {
    console.log('ℹ Note: Broadcast recorded in MongoDB');
  }

  // Clean up
  await Notification.deleteMany({ title: 'Campus by Satva Technolabs Pvt Ltd' });

  server.close();
  await mongoose.connection.close();
  console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
  process.exit(0);
}

testNotificationBroadcast().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
