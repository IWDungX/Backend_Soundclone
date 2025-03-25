'use strict';
const { Router } = require('express');
const multer = require('multer');
const Minio = require('minio');
const { Song, Artist, Genre } = require('../models');
const { verifyToken, checkPermission, checkRole} = require('../utils/auth');


const songsRouter = Router();

// Khởi tạo MinIO client với biến môi trường
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'minio',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
    secretKey: process.env.MINIO_SECRET_KEY || 'admin123',
});

const bucketName = process.env.MINIO_BUCKET || 'songs-bucket';


// Cấu hình multer để xử lý file upload
const upload = multer({ storage: multer.memoryStorage() });

// Middleware kiểm tra quyền admin
const adminOnly = [verifyToken, checkRole('admin')];

// API Upload bài hát (Create)
songsRouter.post('/upload', adminOnly, upload.fields([{ name: 'song' }, { name: 'image' }]), async (req, res) => {
    try {
        const { song, image } = req.files;
        const { song_title, artist_id, genre_id, song_duration } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!song || !song_title || !artist_id || !genre_id || !song_duration) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        // Kiểm tra artist_id và genre_id tồn tại
        const artist = await Artist.findByPk(artist_id);
        const genre = await Genre.findByPk(genre_id);
        if (!artist || !genre) {
            return res.status(404).json({ error: 'Artist hoặc Genre không tồn tại' });
        }

        // Upload file âm thanh lên MinIO
        const songFileName = `${Date.now()}-${song[0].originalname}`;
        await minioClient.putObject(bucketName, songFileName, song[0].buffer);
        const songUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${songFileName}`;

        // Upload hình ảnh nếu có
        let imageUrl = null;
        if (image) {
            const imageFileName = `${Date.now()}-${image[0].originalname}`;
            await minioClient.putObject(bucketName, imageFileName, image[0].buffer);
            imageUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${imageFileName}`;
        }

        // Lưu bài hát vào MySQL
        const newSong = await Song.create({
            song_title,
            artist_id,
            song_duration: parseInt(song_duration),
            song_audio_url: songUrl,
            genre_id,
            song_image_url: imageUrl,
            song_createAt: new Date(),
        });

        res.status(201).json({
            message: 'Upload bài hát thành công!',
            song: newSong,
        });
    } catch (error) {
        console.error('Lỗi khi upload:', error);
        res.status(500).json({ error: 'Lỗi khi upload bài hát' });
    }
});

// API Lấy danh sách bài hát (Read - List)
songsRouter.get('/', async (req, res) => {
    try {
        const songs = await Song.findAll({
            order: [['song_createAt', 'DESC']],
            include: [
                { model: Artist, attributes: ['artist_name'] },
                { model: Genre, attributes: ['genre_name'] },
            ],
        });
        res.json(songs);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách bài hát' });
    }
});

// API Lấy chi tiết bài hát (Read - Detail)
songsRouter.get('/:id', async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id, {
            include: [
                { model: Artist, attributes: ['artist_name'] },
                { model: Genre, attributes: ['genre_name'] },
            ],
        });
        if (!song) {
            return res.status(404).json({ error: 'Không tìm thấy bài hát' });
        }
        res.json(song);
    } catch (error) {
        console.error('Lỗi khi lấy bài hát:', error);
        res.status(500).json({ error: 'Lỗi khi lấy bài hát' });
    }
});

// API Cập nhật bài hát (Update)
songsRouter.put('/:id', adminOnly, upload.fields([{ name: 'song' }, { name: 'image' }]), async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id);
        if (!song) {
            return res.status(404).json({ error: 'Không tìm thấy bài hát' });
        }

        const { song_title, artist_id, genre_id, song_duration } = req.body;
        const { song: songFile, image } = req.files || {};

        // Cập nhật metadata nếu có
        const updateData = {};
        if (song_title) updateData.song_title = song_title;
        if (artist_id) {
            const artist = await Artist.findByPk(artist_id);
            if (!artist) return res.status(404).json({ error: 'Artist không tồn tại' });
            updateData.artist_id = artist_id;
        }
        if (genre_id) {
            const genre = await Genre.findByPk(genre_id);
            if (!genre) return res.status(404).json({ error: 'Genre không tồn tại' });
            updateData.genre_id = genre_id;
        }
        if (song_duration) updateData.song_duration = parseInt(song_duration);

        // Cập nhật file âm thanh nếu có
        if (songFile) {
            const songFileName = `${Date.now()}-${songFile[0].originalname}`;
            await minioClient.putObject(bucketName, songFileName, songFile[0].buffer);
            updateData.song_audio_url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${songFileName}`;
        }

        // Cập nhật hình ảnh nếu có
        if (image) {
            const imageFileName = `${Date.now()}-${image[0].originalname}`;
            await minioClient.putObject(bucketName, imageFileName, image[0].buffer);
            updateData.song_image_url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${imageFileName}`;
        }

        await song.update(updateData);
        res.json({
            message: 'Cập nhật bài hát thành công!',
            song,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
        res.status(500).json({ error: 'Lỗi khi cập nhật bài hát' });
    }
});

// API Xóa bài hát (Delete)
songsRouter.delete('/:id', adminOnly, async (req, res) => {
    try {
        const song = await Song.findByPk(req.params.id);
        if (!song) {
            return res.status(404).json({ error: 'Không tìm thấy bài hát' });
        }

        // Xóa file từ MinIO (tùy chọn)
        if (song.song_audio_url) {
            const audioFileName = song.song_audio_url.split('/').pop();
            await minioClient.removeObject(bucketName, audioFileName);
        }
        if (song.song_image_url) {
            const imageFileName = song.song_image_url.split('/').pop();
            await minioClient.removeObject(bucketName, imageFileName);
        }

        // Xóa bản ghi từ MySQL
        await song.destroy();
        res.json({ message: 'Xóa bài hát thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa:', error);
        res.status(500).json({ error: 'Lỗi khi xóa bài hát' });
    }
});

module.exports = songsRouter;