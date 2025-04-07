const { Router } = require("express");
const { User, userRole, Role} = require("../models");
const { verifyToken, checkRole, checkPermission} = require("../utils/auth");
const multer = require('multer'); 
const Minio = require('minio');

const usersRouter = Router();


const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'q7sZX6jQCrzTzhFY31Jh',
    secretKey: process.env.MINIO_SECRET_KEY || '2S9AmIDETfRMTvs2zEjdq1XlIIRq9kE1nNmiFtl9',
});

const bucketName = process.env.MINIO_BUCKET || 'songs-bucket';

const upload = multer({ storage: multer.memoryStorage() });

const adminOnly = [verifyToken, checkRole('admin')];

usersRouter.get("/", adminOnly, async(req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["user_id", "user_email", "user_name", "user_avatar_url"],
            include: [
                {
                    model: Role,
                    through: { attributes: [] },
                    attributes: ["role_id", "role_name"],
                },
            ],
        });
        res.status(200).json({ success: true, users});
    } catch(error) {
        console.error('Lỗi khi khi lấy thông tin người dùng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

usersRouter.get("/me", verifyToken, async(req, res) => {
    try {
        const user = await User.findByPk(user_id, {
            attributes: ["user_email", "user_name", "user_avatar_url"],
        });
        if(!user){
            return res.status(404).json({ message: "Không tìm thấy người dùng"});
        }
        
        res.status(200).json({ success: true, user});
    } catch(error){
        console.error('Lỗi khi khi lấy thông tin người dùng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

usersRouter.put("/me", verifyToken, upload.single("user_avatar_url"), async(req, res) => {
    try{
        const user_id = req.user.userId;
        const {user_name, user_avatar_url} = req.body;

        const targetUser = await User.findByPk(user_id);
        if(!targetUser){
            return res.status(404).json({message: "Không tìm thấy người dùng"});
        }

        let imageUrl = targetUser.user_avatar_url;

        if (req.file) {
            const objectName = `images/users/${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, objectName, req.file.buffer);
            imageUrl = `http://${process.env.MINIO_PUBLIC_HOST}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
        }

        await targetUser.update({user_name, user_avatar_url: imageUrl});
        res.status(200).json({ 
            success: true,
            message: "Cập nhập thông tinh thành công",
            data: targetUser
        });
    } catch(error) {
        console.error('Lỗi khi cập nhật:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

usersRouter.put("/:id/role", adminOnly, async (req, res) => {
    try {
        const user_id = req.params.id;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: "Role là bắt buộc" });
        }

        const targetUser = await User.findByPk(user_id);
        if (!targetUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        let foundRole;
        // Nếu role là số, tìm theo id; nếu không, tìm theo role_name
        if (!isNaN(role)) {
            foundRole = await Role.findByPk(Number(role));
        } else {
            foundRole = await Role.findOne({ where: { role_name: role } });
        }

        if (!foundRole) {
            return res.status(400).json({ message: `Role '${role}' không hợp lệ` });
        }

        await targetUser.setRoles([foundRole]);

        res.status(200).json({
            success: true,
            message: "Cập nhật role thành công",
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật role:', error.message, error.stack);
        res.status(500).json({ 
            error: 'Lỗi máy chủ nội bộ', 
            details: error.message 
        });
    }
});

usersRouter.delete("/me", verifyToken, async(req, res) => {
    try {
        const user_id = req.user.userId;
        
        const user = await User.findByPk(user_id);
        if(!user){
            return res.status(401).json({ message: "Không tìm thấy người dùng"});
        }

        if(user.user_avatar_url){
            const imageFilePath = user.user_avatar_url.replace(`http://${process.env.MINIO_PUBLIC_HOST}:${process.env.MINIO_PORT}/${bucketName}/`, '');
            await minioClient.removeObject(bucketName, imageFilePath);
        }

        await user.destroy();
        res.status(200).json({ success: true, message: "Xóa người dùng thành công"});
    } catch(error){
        console.error('Lỗi khi khi lấy thông tin người dùng:', error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = usersRouter;