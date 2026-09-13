require('./config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const args = process.argv.slice(2);
const email = args[0] || 'newadmin@placementportal.com';
const password = args[1] || 'Admin@12345';
const name = args[2] || 'Administrator';

async function createAdmin() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';
    await mongoose.connect(uri, { family: 4 });
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: email.toLowerCase() });
    const hashedPassword = await bcrypt.hash(password, 12);

    if (user) {
      user.name = name;
      user.role = 'admin';
      user.password = hashedPassword;
      user.authProvider = 'local';
      user.accountStatus = 'active';
      user.isBlocked = false;
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
      console.log(`\n✓ Existing user updated to Administrator!`);
    } else {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        accountStatus: 'active',
        isBlocked: false,
        authProvider: 'local',
        isEmailVerified: true,
      });
      console.log(`\n✓ New Administrator created successfully!`);
    }

    console.log('-------------------------------------------');
    console.log(`Email   : ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Name    : ${user.name}`);
    console.log(`Role    : ${user.role}`);
    console.log('-------------------------------------------');
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();
