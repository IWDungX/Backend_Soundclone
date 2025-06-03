const { Router } = require('express');
const multer = require('multer');
const { Artist } = require('../../models');
const { minioClient, bucketName } = require('../../config/minio');

const ArtistRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Lấy danh sách tất cả nghệ sĩ
ArtistRouter.get('/', async (req, res) => {
    try {
        const artists = await Artist.findAll();
        res.status(200).json({ success: true, data: artists || [] }); // Đảm bảo data là mảng
    } catch (error) {
        console.error('Lỗi lấy danh sách nghệ sĩ:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Lấy thông tin chi tiết của một nghệ sĩ theo ID
ArtistRouter.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy nghệ sĩ' });
        }
        res.status(200).json({ success: true, data: artist });
    } catch (error) {
        console.error('Lỗi lấy thông tin nghệ sĩ:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Thêm nghệ sĩ mới
ArtistRouter.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { artist_name, bio } = req.body;
        let imageUrl = null;

        if (req.file) {
            const objectName = `images/artists/${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, objectName, req.file.buffer);
            imageUrl = `/${bucketName}/${objectName}`;
        }

        const newArtist = await Artist.create({ artist_name, bio, image_url: imageUrl });

        res.status(201).json({
            success: true,
            message: 'Nghệ sĩ đã được thêm',
            data: newArtist
        });
    } catch (error) {
        console.error('Lỗi thêm nghệ sĩ:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Cập nhật thông tin nghệ sĩ
ArtistRouter.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { artist_name, bio } = req.body;
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy nghệ sĩ' });
        }

        let imageUrl = artist.image_url;
        if (req.file) {
            const objectName = `images/artists/${Date.now()}-${req.file.originalname}`;
            await minioClient.putObject(bucketName, objectName, req.file.buffer);
            imageUrl = `/${bucketName}/${objectName}`;
        }

        await artist.update({ artist_name, bio, image_url: imageUrl });

        res.status(200).json({
            success: true,
            message: 'Cập nhật nghệ sĩ thành công',
            data: artist
        });
    } catch (error) {
        console.error('Lỗi cập nhật nghệ sĩ:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

// Xóa nghệ sĩ
ArtistRouter.delete('/:id', async (req, res) => {
    try {
        const artist = await Artist.findByPk(req.params.id);
        if (!artist) {
            return res.status(404).json({ success: false, errorMessage: 'Không tìm thấy nghệ sĩ' });
        }

        if (artist.image_url) {
            const imageFilePath = artist.image_url.replace(`/${bucketName}/`, '');
            await minioClient.removeObject(bucketName, imageFilePath);
        }

        await artist.destroy();
        res.status(200).json({
            success: true,
            message: 'Xóa nghệ sĩ thành công'
        });
    } catch (error) {
        console.error('Lỗi xóa nghệ sĩ Failure:', error);
        res.status(500).json({ success: false, errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = ArtistRouter;