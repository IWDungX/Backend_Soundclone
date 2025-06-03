const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ errorMessage: "Không có token, truy cập bị từ chối" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ errorMessage: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ errorMessage: 'Không có quyền truy cập' });
        }
        if (req.user.permissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403).json({ errorMessage: 'Không có quyền truy cập' });
        }
    };
};

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ errorMessage: 'Không có vai trò cần thiết' });
        }
        if (req.user.roles.includes(requiredRole)) {
            next();
        } else {
            res.status(403).json({ errorMessage: 'Không có vai trò cần thiết' });
        }
    };
};

module.exports = { verifyToken, checkPermission, checkRole };