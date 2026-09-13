const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (e) {}

require('./config/env');
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placement_portal';
  console.log('Testing MongoDB Connection...');
  console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

  try {
    const isLocal = uri.startsWith('mongodb://127.0.0.1') || uri.startsWith('mongodb://localhost');
    const options = {
      serverSelectionTimeoutMS: 15000,
      ...(isLocal ? { family: 4 } : {}),
    };

    const conn = await mongoose.connect(uri, options);
    console.log('\n✓ Successfully connected to MongoDB Atlas!');
    console.log(`  Host     : ${conn.connection.host}`);
    console.log(`  Database : ${conn.connection.name}`);
    console.log(`  Port     : ${conn.connection.port || 'Atlas Default (27017)'}`);
    console.log(`  State    : Connected (Ready)\n`);

    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Collections found (${collections.length}):`);
    collections.forEach((c) => console.log(`  - ${c.name}`));

    await mongoose.disconnect();
    console.log('\n✓ Connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ MongoDB Connection Failed:');
    console.error(`  Error: ${error.message}\n`);
    process.exit(1);
  }
}

testConnection();
