const dns = require('dns');
const mongoose = require('mongoose');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records on all networks/ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {
  // Ignore if already set or unsupported in environment
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_portal';

    if (!uri) {
      throw new Error('MongoDB connection URI is missing. Please set MONGODB_URI in your environment variables.');
    }

    const isLocal = uri.startsWith('mongodb://127.0.0.1') || uri.startsWith('mongodb://localhost');
    const options = {
      serverSelectionTimeoutMS: 15000,
      ...(isLocal ? { family: 4 } : {}),
    };

    const conn = await mongoose.connect(uri, options);
    console.log(`✓ MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
