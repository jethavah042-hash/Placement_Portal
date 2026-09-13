require('./config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal');
  console.log('Connected to MongoDB for Admin Setup');

  const adminEmail = 'admin@placementportal.com';
  let admin = await User.findOne({ email: adminEmail });

  const hashedPassword = await bcrypt.hash('Admin@12345', 12);

  if (admin) {
    admin.role = 'admin';
    admin.password = hashedPassword;
    admin.accountStatus = 'active';
    admin.isBlocked = false;
    await admin.save();
    console.log('✓ Admin account updated: admin@placementportal.com / Admin@12345');
  } else {
    admin = await User.create({
      name: 'Portal Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      accountStatus: 'active',
      isBlocked: false,
      authProvider: 'local'
    });
    console.log('✓ Admin account created: admin@placementportal.com / Admin@12345');
  }

  await mongoose.connection.close();
  process.exit(0);
};

seedAdmin();
