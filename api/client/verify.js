const { Router } = require('express');
const { User } = require('../../models');

const verifyRouter = Router();

verifyRouter.get('/', async (req, res) => {
  try {
    const { token } = req.query;
    console.log('Verification token received:', token);

    if (!token || typeof token !== 'string' || token.length < 10) {
      return res.status(400).json({ errorMessage: 'Token không hợp lệ' });
    }

    const user = await User.findOne({ 
      where: { verification_token: token },
      logging: console.log, // Bật logging
    });
    if (!user) {
      return res.status(400).json({ errorMessage: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    await User.update(
      { is_verified: true, verification_token: null },
      { where: { user_id: user.user_id } }
    );
    console.log('🔹 Token từ email:', token);
    console.log('🔹 Token từ DB:', user?.verification_token);

    res.status(200).json({ success: true, message: 'Tài khoản đã được xác minh thành công!' });
  } catch (e) {
    console.error('Verification error:', e.stack);
    res.status(500).json({ errorMessage: 'Lỗi xác minh tài khoản' });
  }
});

module.exports = verifyRouter;