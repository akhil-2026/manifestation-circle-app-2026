const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find().select('name email role isActive');
    console.log('\n📋 Users in database:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}, Active: ${user.isActive}`);
        console.log('');
      });
    }
    
    // Check specifically for Super Admin
    const superAdmin = users.find(u => u.email === 'akhilkrishna2400@gmail.com');
    if (superAdmin) {
      console.log('✅ Super Admin found in database');
    } else {
      console.log('❌ Super Admin not found in database');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();