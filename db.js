const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/teamcollab';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected:', uri);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
