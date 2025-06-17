const { Router } = require('express');
const { Artist, Song, Genre } = require('../models');

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

artistRouter.get('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ errorMessage: 'artist_id là bắt buộc' });
    }

    const songs = await Song.findAll({
      where: { artist_id: id },
      include: [
        { model: Artist, attributes: ['artist_name', 'artist_id'] },
        { model: Genre, attributes: ['genre_name'] },
      ],
    });

    if (!songs.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: songs });
  } catch (error) {
    console.error('Lỗi lấy danh sách bài hát:', error);
    res.status(500).json({ errorMessage: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = artistRouter;
