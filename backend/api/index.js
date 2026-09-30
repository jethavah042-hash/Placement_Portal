require('../config/env');
const connectDB = require('../config/db');
const app = require('../app');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err.message);
  }
  return app(req, res);
};
