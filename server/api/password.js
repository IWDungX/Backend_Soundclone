const express = require('express');
const crypto = require('crypto');
const bcrypt = require('../utils/bcrypt');
const { User } = require('../models');
const { sendResetPasswordEmail } = require('../utils/email');
const Redis = require('ioredis');

const Passwordrouter = express.Router();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || "redis_password",
});

redis.on('error', (err) => console.error('Redis Error:', err));

// Gửi OTP cho reset password
Passwordrouter.post('/send-otp', async (req, res) => {
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(400).json({ errorMessage: 'Email không được để trống' });
  }

  try {
    // 1. Kiểm tra xem có đang bị rate-limit không
    const rateLimitKey = `otp_limit:${user_email}`;
    const isLimited = await redis.get(rateLimitKey);

    if (isLimited) {
      return res.status(429).json({
        errorMessage: 'Vui lòng đợi trước khi yêu cầu mã OTP mới (tối đa 1 lần/phút)',
      });
    }

    const user = await User.findOne({ where: { user_email } });
    if (!user) {
      return res.status(404).json({ errorMessage: 'Không tìm thấy người dùng' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Lưu OTP (key chính)
    await redis.set(`reset_otp:${user_email}`, otp, 'EX', 300); // 5 phút

    // 3. Lưu khóa hạn chế gửi lại trong 60 giây
    await redis.set(rateLimitKey, '1', 'EX', 60); // 1 phút

    await sendResetPasswordEmail(user_email, otp, true);

    res.json({ success: true, message: 'Đã gửi mã OTP qua email' });
  } catch (error) {
    console.error('Lỗi gửi OTP reset password:', error);
    res.status(500).json({ errorMessage: 'Có lỗi xảy ra' });
  }
});

// Xác nhận OTP cho reset password
Passwordrouter.post('/verify-otp', async (req, res) => {
  const { user_email, otp } = req.body;

  if (!user_email || !otp) {
    return res.status(400).json({ errorMessage: 'Email và OTP không được để trống' });
  }

  if (typeof otp !== 'string' || otp.length !== 6) {
    return res.status(400).json({ errorMessage: 'OTP phải là chuỗi 6 chữ số' });
  }

  try {
    const user = await User.findOne({ where: { user_email } });
    if (!user) {
      return res.status(404).json({ errorMessage: 'Không tìm thấy người dùng' });
    }

    const storedOtp = await redis.get(`reset_otp:${user_email}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ errorMessage: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    await redis.del(`reset_otp:${user_email}`); // Xóa OTP sau khi xác nhận

    const resetToken = crypto.randomBytes(32).toString('hex');
    await User.update(
      { verification_token: resetToken },
      { where: { user_id: user.user_id } }
    );

    res.json({
      success: true,
      message: 'Xác nhận OTP thành công',
      token: resetToken,
    });
  } catch (error) {
    console.error('Lỗi xác nhận OTP reset password:', error);
    res.status(500).json({ errorMessage: 'Có lỗi xảy ra' });
  }
});

// Đặt lại mật khẩu (giữ nguyên)
Passwordrouter.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ errorMessage: 'Token, mật khẩu mới và xác nhận mật khẩu không được để trống' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ errorMessage: 'Mật khẩu xác nhận không khớp' });
  }

  if (newPassword < 6 || confirmPassword < 6) {
    return res.status(400).json({ errorMessage: 'Mật khẩu phải dài ít nhất 6 ký tự' });
  }
  
  try {
    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ errorMessage: 'Token không hợp lệ' });
    }

    const hashedPassword = await bcrypt.hashPassword(newPassword);
    await User.update(
      {
        user_password: hashedPassword,
        verification_token: null,
      },
      { where: { user_id: user.user_id } }
    );

    res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi reset password:', error);
    res.status(500).json({ errorMessage: 'Có lỗi xảy ra' });
  }
});

module.exports = Passwordrouter;