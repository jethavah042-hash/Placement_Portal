const dns = require('dns');
const mongoose = require('mongoose');

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records across environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {
  // Ignore if unsupported or already configured
}

// Global cached connection for serverless execution (Vercel) & standard server execution
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/placement_portal';

    if (!uri) {
      throw new Error(
        'MongoDB connection URI is missing. Please set MONGODB_URI in your environment variables.'
      );
    }

    const isLocal =
      uri.startsWith('mongodb://127.0.0.1') || uri.startsWith('mongodb://localhost');

    const options = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      ...(isLocal ? { family: 4 } : {}),
    };

    cached.promise = mongoose.connect(uri, options).then((conn) => {
      console.log(
        `✓ MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`
      );
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
