import connectDB from '../config/db';
import { User } from '../models/User';
import mongoose from 'mongoose';

async function testConnection() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Test basic operations
    console.log('\n🔍 Testing database operations...');

    // Count users
    const userCount = await User.countDocuments();
    console.log(`📊 Number of users in database: ${userCount}`);

    // Test connection status
    const { readyState } = mongoose.connection;
    console.log('\n📡 Connection Status:', {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    }[readyState]);

    // Database information
    if (mongoose.connection.db) {
      const dbName = mongoose.connection.db.databaseName;
      const collections = await mongoose.connection.db.collections();
      
      console.log('\n📚 Database Information:');
      console.log(`Database Name: ${dbName}`);
      console.log('Collections:', collections.map(c => c.collectionName).join(', '));

      // Test Users collection
      console.log('\n👥 Testing Users Collection:');
      const usersCollection = mongoose.connection.db.collection('Users');
      const usersCount = await usersCollection.countDocuments();
      console.log(`Total Users: ${usersCount}`);
    }

    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Run tests
console.log('🚀 Starting database connection tests...');
testConnection(); 