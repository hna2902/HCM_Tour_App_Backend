// file: routes/auth.routes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const router = express.Router();

// ==========================================================
// @route   POST /api/auth/register
// @desc    Đăng ký người dùng mới
// @access  Public
// ==========================================================
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // --- 1. Validation cơ bản ---
    if (!name || !phone || !password) {
      return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    // --- THÊM MỚI: Validation định dạng số điện thoại ---
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ msg: 'Định dạng số điện thoại không hợp lệ.' });
    }
    // --- KẾT THÚC PHẦN THÊM MỚI ---

    // --- 2. Kiểm tra xem SĐT đã tồn tại chưa ---
    const existingUser = await User.findOne({ phone: phone });
    if (existingUser) {
      return res.status(400).json({ msg: 'Số điện thoại này đã được đăng ký.' });
    }

    // --- 3. Mã hóa mật khẩu (rất quan trọng) ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- 4. Tạo người dùng mới và lưu vào database ---
    const newUser = new User({
      name: name,
      phone: phone,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    // --- 5. Trả về thông báo thành công ---
    res.status(201).json({ 
        msg: 'Đăng ký thành công!',
        user: {
            id: savedUser._id,
            name: savedUser.name,
            phone: savedUser.phone,
        }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================================
// @route   POST /api/auth/login
// @desc    Đăng nhập người dùng
// @access  Public
// ==========================================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // --- 1. Validation cơ bản ---
    if (!phone || !password) {
      return res.status(400).json({ msg: 'Vui lòng nhập số điện thoại và mật khẩu.' });
    }

    // --- 2. Tìm người dùng trong database bằng SĐT ---
    const user = await User.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({ msg: 'Số điện thoại hoặc mật khẩu không đúng.' });
    }

    // --- 3. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Số điện thoại hoặc mật khẩu không đúng.' });
    }

    // --- 4. Nếu đăng nhập thành công, tạo JSON Web Token (JWT) ---
    const payload = {
      id: user.id,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // --- 5. Trả về token và thông tin người dùng (không bao gồm mật khẩu) ---
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;