// usersRouter.js
const { Router } = require('express');
const { User, Role } = require('../../models');

const usersRouter = Router();

// Lấy danh sách người dùng
usersRouter.get('/', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['user_id', 'user_email', 'user_name', 'user_avatar_url'],
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['role_id', 'role_name'],
                },
            ],
        });
        res.status(200).json({ success: true, data: users }); // Đổi users thành data để nhất quán
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Lấy thông tin người dùng theo ID
usersRouter.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['user_id', 'user_email', 'user_name', 'user_avatar_url'],
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['role_id', 'role_name'],
                },
            ],
        });
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy người dùng' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Cập nhật role
usersRouter.put('/:id/role', async (req, res) => {
    try {
        const user_id = req.params.id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ success: false, errorMessage: 'Role là bắt buộc' });
        }

        const targetUser = await User.findByPk(user_id, {
            include: {
                model: Role,
                through: { attributes: [] },
            },
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy người dùng' });
        }

        const currentRoles = targetUser.Roles.map((r) => r.role_name);

        if (currentRoles.includes('admin')) {
            return res.status(403).json({ success: false, errorMessage: 'Không được thay đổi role của tài khoản admin' });
        }

        let foundRole;
        if (!isNaN(role)) {
            foundRole = await Role.findByPk(Number(role));
        } else {
            foundRole = await Role.findOne({ where: { role_name: role } });
        }

        if (!foundRole) {
            return res.status(400).json({ success: false, errorMessage: `Role '${role}' không hợp lệ` });
        }

        await targetUser.setRoles([foundRole]);

        res.status(200).json({
            success: true,
            message: 'Cập nhật role thành công',
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật role:', error.message, error.stack);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ', details: error.message });
    }
});

// Xóa người dùng
usersRouter.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy người dùng' });
        }

        const currentRoles = (await user.getRoles()).map((r) => r.role_name);
        if (currentRoles.includes('admin')) {
            return res.status(403).json({ success: false, errorMessage: 'Không được xóa tài khoản admin' });
        }

        await user.destroy();
        res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công',
        });
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = usersRouter;