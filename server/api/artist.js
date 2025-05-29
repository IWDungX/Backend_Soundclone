const { Router } = require('express');
const { Artist } = require('../models');

const artistRouter = Router();

// Lấy danh sách tất cả nghệ sĩ
artistRouter.get('/', async (req, res) => {
    try {
        const artists = await Artist.findAll();
        res.status(200).json({  success: true, data: artists || [] });
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
        res.status(200).json({  success: true, data: artist || [] });
    } catch (error) {
        console.error('Lỗi lấy thông tin nghệ sĩ:', error);
        res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = artistRouter;
