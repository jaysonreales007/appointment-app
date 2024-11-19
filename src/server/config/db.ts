import mongoose from 'mongoose';
import { serverEnv } from './env';

const connectDB = async () => {
  try {
    await mongoose.connect(serverEnv.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully!');

    // Monitor database connection events
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    console.error('Failed to connect to MongoDB. Please check your connection string and try again.');
  }
};

export default connectDB; 