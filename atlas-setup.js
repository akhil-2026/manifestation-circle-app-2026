#!/usr/bin/env node

/**
 * MongoDB Atlas Quick Setup for Manifestation Circle
 * This script helps you set up MongoDB Atlas connection
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌙 Manifestation Circle - MongoDB Atlas Setup\n');

console.log('📋 Follow these steps to set up MongoDB Atlas:\n');

console.log('1. Go to https://www.mongodb.com/atlas');
console.log('2. Create a free account and verify email');
console.log('3. Create a new cluster (choose FREE tier)');
console.log('4. Create a database user:');
console.log('   - Username: manifestation');
console.log('   - Password: manifestation2024');
console.log('5. Add IP Address: 0.0.0.0/0 (Allow from anywhere)');
console.log('6. Get your connection string\n');

rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string. Please make sure it starts with mongodb+srv://');
    rl.close();
    return;
  }

  // Update the .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the MONGODB_URI line
  envContent = envContent.replace(
    /MONGODB_URI=.*/,
    `MONGODB_URI=${connectionString}`
  );
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ MongoDB Atlas connection string updated!');
  console.log('🚀 You can now start your server with: npm run dev');
  console.log('\n💡 Tip: Make sure to replace <password> in the connection string with your actual password');
  
  rl.close();
});

rl.on('close', () => {
  console.log('\n🌙 Setup complete! Happy manifesting! ✨');
  process.exit(0);
});