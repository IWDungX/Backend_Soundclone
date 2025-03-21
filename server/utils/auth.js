const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ errorMessage: 'Token không được cung cấp' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ errorMessage: 'Token không hợp lệ' });
    }
};

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (req.user.permissions.includes(requiredPermission)) {
            next();
        } else {
            res.status(403).json({ errorMessage: 'Không có quyền truy cập' });
        }
    };
};

const checkRole = (requiredRole) => {
    return (req, res, next) => {
        if (req.user.roles.includes(requiredRole)) {
            next();
        } else {
            res.status(403).json({ errorMessage: 'Không có vai trò cần thiết' });
        }
    };
};

module.exports = { verifyToken, checkPermission, checkRole };