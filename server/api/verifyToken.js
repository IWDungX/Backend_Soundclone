const { Router } = require('express');
const jwt = require('jsonwebtoken');

const verifyTokenRouter = Router();

verifyTokenRouter.get('/', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Authorization header:', authHeader); 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token không tồn tại' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    console.log('Token hợp lệ, thông tin user:', decoded);

    res.status(200).json({ success: true, user: decoded, message: 'Token hợp lệ' });
  } catch (error) {
    console.error('Lỗi xác thực token:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ success: false, message: 'Token đã hết hạn' });
    }
    return res.status(403).json({ success: false, message: 'Token không hợp lệ' });
  }
});

module.exports = verifyTokenRouter;