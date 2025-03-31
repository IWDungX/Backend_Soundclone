const { Router } = require('express');
const { User, Role, UserRole } = require('../../models');
const bcrypt = require('../../utils/bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('../../utils/auth');

const adminRouter = Router();

adminRouter.post('/', async (req, res) => {
  const { user_email, user_password, user_google_uid } = req.body;

  try {
    let user;

    // Xử lý đăng nhập email/mật khẩu
    if (user_email && user_password) {
      user = await User.findOne({ where: { user_email } });
      if (!user || !user.user_password) {
        return res.status(401).json({ errorMessage: 'Thông tin đăng nhập không hợp lệ' });
      }
      if (!await bcrypt.comparePassword(user_password, user.user_password)) {
        return res.status(401).json({ errorMessage: 'Thông tin đăng nhập không hợp lệ' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ errorMessage: 'Tài khoản chưa được xác minh' });
      }
    }
    else {
      return res.status(400).json({ errorMessage: 'Thiếu thông tin đăng nhập' });
    }

    // Lấy danh sách vai trò của người dùng
    const userRoles = await UserRole.findAll({
      where: { user_id: user.user_id },
      include: [{ model: Role }]
    });

    const roles = userRoles.map(ur => ur.Role.role_name);
    if (!roles.includes('admin')) {
    return res.status(403).json({ errorMessage: 'Bạn không có quyền truy cập' });
}
    // Tạo token JWT với ID và vai trò người dùng
    const token = jwt.sign(
      { userId: user.user_id, roles: roles },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
  }
});

adminRouter.post('/logout', verifyToken, async (req, res) =>{
    try {
        res.status(200).json({ success: true, message: 'Đăng xuất thành công'});
    }catch(error) {
        console.error('Lỗi đăng xuất Admin', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ cục bộ'});
    }
});

module.exports = adminRouter;

