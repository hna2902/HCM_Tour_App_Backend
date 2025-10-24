// file: server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors());
app.use(express.json()); // Để server hiểu được JSON

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Định nghĩa các Routes
app.use('/api/auth', authRoutes); // Các route liên quan đến đăng ký/đăng nhập

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});