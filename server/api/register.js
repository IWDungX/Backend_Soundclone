const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('../utils/bcrypt');
const { User, UserRole, Role, sequelize } = require('../models');
const { sendVerificationEmail } = require('../utils/email');
const crypto = require('crypto');

const registerRouter = Router();

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

registerRouter.post('/', async (req, res) => {
  try {
    await sequelize.transaction(async (t) => {
      const { user_name, user_email, user_password, user_password_confirm, user_google_uid } = req.body;

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ where: { user_email }, transaction: t });
      if (existingUser) {
        if (!existingUser.user_google_uid && user_google_uid) {
          await existingUser.update({ user_google_uid }, { transaction: t });
          return res.status(200).json({ 
            success: true, 
            message: 'Đăng nhập thành công với Google!', 
            user_email: existingUser.user_email, 
            user_id: existingUser.user_id, 
            user_name: existingUser.user_name 
          });
        }
        throw new Error('Email đã được đăng ký');
      }

      let hashedPassword = null;
      let verification_token = null;
      let is_verified = false;

      // Nếu đăng nhập bằng Google
      if (user_google_uid) {
        is_verified = true;
      } 
      // Nếu đăng ký bằng email & password
      else if (user_password) {
        if (!user_name || !user_email || !user_password || !user_password_confirm) {
          throw new Error('Email, mật khẩu và tên người dùng không được để trống');
        }
        if (!isValidEmail(user_email)) {
          throw new Error('Địa chỉ email không hợp lệ');
        }
        if (user_password !== user_password_confirm) {
          throw new Error('Mật khẩu không khớp');
        }
        if (user_password.length < 6) {
          throw new Error('Mật khẩu phải dài ít nhất 6 ký tự');
        }

        // Mã hóa mật khẩu
        hashedPassword = await bcrypt.hashPassword(user_password);
        is_verified = false;
        verification_token = crypto.randomBytes(32).toString('hex');
      } 
      // Trường hợp không hợp lệ
      else {
        throw new Error('Thông tin không hợp lệ');
      }

      // Tạo tài khoản mới
      const user = await User.create({
        user_id: uuidv4(),
        user_name,
        user_email,
        user_password: hashedPassword,
        user_google_uid: user_google_uid || null,
        is_verified: is_verified, 
        verification_token: verification_token,
      }, { transaction: t });

      // Gán vai trò 'user' cho tài khoản mới
      const targetRole = await Role.findOne({ where: { role_name: 'user' }, transaction: t });
      if (!targetRole) {
        throw new Error('Vai trò "user" không tồn tại trong hệ thống');
      }
      await UserRole.create({
        user_role_id: uuidv4(),
        user_id: user.user_id,
        role_id: targetRole.role_id,
      }, { transaction: t });

      // Gửi email xác thực nếu cần
      if (!is_verified) {
        console.log('Sending verification email with token:', verification_token);
        await sendVerificationEmail(user.user_email, verification_token);
      }

      // Trả về phản hồi thành công
      return res.status(201).json({ 
        success: true, 
        message: is_verified ? 'Đăng ký thành công!' : 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực',
        ...(is_verified ? { user_email: user.user_email, user_id: user.user_id, user_name: user.user_name } : {})
      });
    });
  } catch (e) {
    console.error('Registration error:', e.stack);
    if (e.message === 'Email đã được đăng ký') {
      return res.status(409).json({ errorMessage: e.message });
    }
    return res.status(e.message.includes('không hợp lệ') || e.message.includes('không khớp') || e.message.includes('ít nhất 6 ký tự') ? 400 : 500)
      .json({ errorMessage: e.message.includes('hệ thống') ? e.message : 'Không thể đăng ký do lỗi hệ thống, vui lòng thử lại sau' });
  }
});

module.exports = registerRouter;