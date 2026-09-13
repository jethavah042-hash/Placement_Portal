require('./config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function checkAndSetAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  await mongoose.connect(uri);

  const admins = await User.find({ role: 'admin' });
  console.log('Existing Admins count:', admins.length);
  admins.forEach(a => console.log('Admin found:', a.email, a.name));

  // Ensure default primary admin
  const defaultEmail = 'admin@placementportal.com';
  const defaultPassword = 'Admin@password123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  let defaultAdmin = await User.findOne({ email: defaultEmail });
  if (defaultAdmin) {
    defaultAdmin.password = hashedPassword;
    defaultAdmin.role = 'admin';
    defaultAdmin.accountStatus = 'active';
    defaultAdmin.isBlocked = false;
    defaultAdmin.failedLoginAttempts = 0;
    defaultAdmin.lockUntil = undefined;
    await defaultAdmin.save();
    console.log('Updated password for default admin:', defaultEmail);
  } else {
    defaultAdmin = await User.create({
      name: 'Portal Administrator',
      email: defaultEmail,
      password: hashedPassword,
      role: 'admin',
      authProvider: 'local',
      accountStatus: 'active'
    });
    console.log('Created default admin:', defaultEmail);
  }

  // Also ensure admin@portal.com as alternate
  const altEmail = 'admin@portal.com';
  let altAdmin = await User.findOne({ email: altEmail });
  if (altAdmin) {
    altAdmin.password = hashedPassword;
    altAdmin.role = 'admin';
    altAdmin.accountStatus = 'active';
    altAdmin.isBlocked = false;
    altAdmin.failedLoginAttempts = 0;
    altAdmin.lockUntil = undefined;
    await altAdmin.save();
    console.log('Updated password for alternate admin:', altEmail);
  } else {
    await User.create({
      name: 'Super Admin',
      email: altEmail,
      password: hashedPassword,
      role: 'admin',
      authProvider: 'local',
      accountStatus: 'active'
    });
    console.log('Created alternate admin:', altEmail);
  }

  await mongoose.connection.close();
}

checkAndSetAdmin().catch(console.error);
