const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeAllUsersAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users to admin role
    const result = await User.updateMany(
      { isActive: true },
      { $set: { role: 'admin' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to admin role`);

    // Show all users
    const users = await User.find({ isActive: true }, 'name email role');
    console.log('\n📋 Current users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

makeAllUsersAdmin();