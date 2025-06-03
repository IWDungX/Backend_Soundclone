const { Router } = require('express');
const bcrypt = require('../utils/bcrypt');
const { User, UserRole, Role } = require('../models');
const jwt = require('jsonwebtoken');
const loginRouter = Router();

loginRouter.post('/', async (req, res) => {
  const { user_email, user_password, user_google_uid } = req.body;

  try {
    let user;

    // Xử lý đăng nhập email/mật khẩu
    if (user_email && user_password) {
      user = await User.findOne({ where: { user_email } });
      if (!user || !user.user_password) {
        return res.status(401).json({ success: false, errorMessage: 'Thông tin đăng nhập không hợp lệ' });
      }
      if (!await bcrypt.comparePassword(user_password, user.user_password)) {
        return res.status(401).json({ success: false, errorMessage: 'Thông tin đăng nhập không hợp lệ' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ success: false, errorMessage: 'Tài khoản chưa được xác minh' });
      }
    }
    // Xử lý đăng nhập Google
    else if (user_google_uid) {
      user = await User.findOne({ where: { user_google_uid } });
      if (!user) {
        return res.status(401).json({ success: false, errorMessage: 'Thông tin đăng nhập không hợp lệ' });
      }
    }
    // Thiếu thông tin đăng nhập
    else {
      return res.status(400).json({ success: false, errorMessage: 'Thiếu thông tin đăng nhập' });
    }

    // Lấy danh sách vai trò của người dùng
    const userRoles = await UserRole.findAll({
      where: { user_id: user.user_id },
      include: [{ model: Role }]
    });

    const roles = userRoles.map(ur => ur.Role.role_name);

    // Tạo token JWT với ID và vai trò người dùng
    const token = jwt.sign(
      { userId: user.user_id, userName: user.user_name, roles: roles },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      refreshToken,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
  }
});

loginRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    // Xác minh refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, errorMessage: 'Token không hợp lệ' });
    }

    // Lấy danh sách vai trò của người dùng từ bảng UserRole và Role
    const userRoles = await UserRole.findAll({
      where: { user_id: user.user_id },
      include: [{ model: Role }]
    });
    const roles = userRoles.map(ur => ur.Role.role_name);

    // Tạo token mới
    const newToken = jwt.sign(
      { userId: user.user_id, userName: user.user_name, roles: roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ success: false, errorMessage: 'Refresh token không hợp lệ' });
  }
});

// Endpoint đăng xuất
loginRouter.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ success: false, errorMessage: 'Không tìm thấy token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({ success: false, errorMessage: 'Token không hợp lệ' });
      }
    });

    res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = loginRouter;