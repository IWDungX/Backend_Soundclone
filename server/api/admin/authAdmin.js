const { Router } = require('express');
const { User, Role, UserRole } = require('../../models');
const bcrypt = require('../../utils/bcrypt');
const jwt = require('jsonwebtoken');

const adminRouter = Router();

adminRouter.post('/', async (req, res) => {
  const { user_email, user_password, user_google_uid } = req.body;

  try {
    let user;
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
    else {
      return res.status(400).json({ success: false, errorMessage: 'Thiếu thông tin đăng nhập' });
    }

    // Lấy danh sách vai trò của người dùng
    const userRoles = await UserRole.findAll({
      where: { user_id: user.user_id },
      include: [{ model: Role }]
    });

    const roles = userRoles.map(ur => ur.Role.role_name);
    if (!roles.includes('admin')) {
    return res.status(403).json({ success: false, errorMessage: 'Bạn không có quyền truy cập' });
}
    // Tạo token JWT với ID và vai trò người dùng
    const token = jwt.sign(
      { userId: user.user_id, roles: roles },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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
    next(error);
  }
});

adminRouter.post('/logout', async (req, res) =>{
    try {
        res.status(200).json({ success: true, message: 'Đăng xuất thành công'});
    }catch(error) {
        console.error('Lỗi đăng xuất Admin', error);
        next(error);
    }
});

module.exports = adminRouter;

