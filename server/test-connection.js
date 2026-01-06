const mongoose = require('mongoose');
require('dotenv').config();

console.log('🌙 Testing MongoDB Atlas Connection...\n');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Hide credentials in log but show if it's Atlas or local
    const isAtlas = process.env.MONGODB_URI.includes('mongodb+srv://');
    const connectionType = isAtlas ? 'MongoDB Atlas' : 'Local MongoDB';
    const displayUri = isAtlas 
      ? process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')
      : process.env.MONGODB_URI;
    
    console.log(`Connecting to: ${connectionType}`);
    console.log(`URI: ${displayUri}\n`);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ Successfully connected to ${connectionType}!`);
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({ test: String, timestamp: Date });
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    const testDoc = new TestModel({ 
      test: `${connectionType} connection successful!`, 
      timestamp: new Date() 
    });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    console.log(`\n🎉 ${connectionType} is working perfectly!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Make sure the database user exists in Atlas');
      console.log('3. Verify the user has read/write permissions');
    } else if (error.message.includes('IP') || error.message.includes('network')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Add your IP address to Atlas Network Access');
      console.log('2. Or allow access from anywhere (0.0.0.0/0)');
      console.log('3. Check your internet connection');
    } else if (error.message.includes('MONGODB_URI')) {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure .env file exists in server directory');
      console.log('2. Check MONGODB_URI is set correctly in .env');
      console.log('3. Restart the terminal/process');
    } else {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the connection string format');
      console.log('3. Make sure your Atlas cluster is running');
    }
    
    process.exit(1);
  }
};

connectDB();