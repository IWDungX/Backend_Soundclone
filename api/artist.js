const { Router } = require('express');
const multer = require('multer'); 
const { Artist } = require('../models');
const { verifyToken, checkRole } = require('../utils/auth');
const Minio = require('minio');

const artistRouter = Router();


const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'q7sZX6jQCrzTzhFY31Jh',
    secretKey: process.env.MINIO_SECRET_KEY || '2S9AmIDETfRMTvs2zEjdq1XlIIRq9kE1nNmiFtl9',
});

const bucketName = process.env.MINIO_BUCKET || 'songs-bucket';

const upload = multer({ storage: multer.memoryStorage() });

// Lấy danh sách tất cả nghệ sĩ
artistRouter.get('/', async (req, res) => {
    try {
        const artists = await Artist.findAll();
        res.status(200).json({ success: true, artists });
    } catch (error) {
        console.error('Lỗi lấy danh sách nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Lấy thông tin chi tiết của một nghệ sĩ theo ID
artistRouter.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ errorMessage: 'Không tìm thấy nghệ sĩ' });
        }
        res.status(200).json({ success: true, artist });
    } catch (error) {
        console.error('Lỗi lấy thông tin nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Thêm nghệ sĩ mới 
artistRouter.post('/upload', verifyToken, checkRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const { artist_name, bio } = req.body;
        let imageUrl = null;

        if (req.file) {
            const objectName = `images/artists/${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, objectName, req.file.buffer);
            imageUrl = `http://${process.env.MINIO_PUBLIC_HOST}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
        }

        const newArtist = await Artist.create({ artist_name, bio, image_url: imageUrl });
        res.status(201).json({ success: true, message: 'Nghệ sĩ đã được thêm', artist: newArtist });
    } catch (error) {
        console.error('Lỗi thêm nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Cập nhật thông tin nghệ sĩ (hỗ trợ cập nhật ảnh)
artistRouter.put('/:id', verifyToken, checkRole('admin'), upload.single('image'), async (req, res) => {
    try {
        const { artist_name, bio } = req.body;
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ errorMessage: 'Không tìm thấy nghệ sĩ' });
        }

        let imageUrl = artist.image_url;
        if (req.file) {
            const objectName = `images/artists/${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, objectName, req.file.buffer);
            imageUrl = `http://${process.env.MINIO_PUBLIC_HOST}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`;
        }

        await artist.update({ artist_name, bio, image_url: imageUrl });
        res.status(200).json({ success: true, message: 'Cập nhật nghệ sĩ thành công', artist });
    } catch (error) {
        console.error('Lỗi cập nhật nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Xóa nghệ sĩ khỏi hệ thống (chỉ admin được phép thực hiện)
artistRouter.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ errorMessage: 'Không tìm thấy nghệ sĩ' });
        }

        // Xóa hình ảnh trên MinIO nếu có
        if (artist.image_url) {
            const imageFilePath = artist.image_url.replace(`http://${process.env.MINIO_PUBLIC_HOST}:${process.env.MINIO_PORT}/${bucketName}/`, '');
            await minioClient.removeObject(bucketName, imageFilePath);
        }

        await artist.destroy();
        res.status(200).json({ success: true, message: 'Xóa nghệ sĩ thành công' });
    } catch (error) {
        console.error('Lỗi xóa nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = artistRouter;
