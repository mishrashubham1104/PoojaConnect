const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pooja_connect');
    console.log('MongoDB Connected Successfully! 🕉️');
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;