const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Song, Artist, Playlist } = require('../models');

// Endpoint tìm kiếm trên cả ba bảng
router.get('/', async (req, res) => {
  const { query } = req.query;
  const q = (req.query.query || '').trim();
  if (!q) {
    // Trả về top 5 bài hát nổi bật nếu query rỗng
    try {
      const topSongs = await Song.findAll({
        include: [{ model: Artist, attributes: ['artist_name'] }],
        limit: 5,
        order: [['created_at', 'DESC']], // Ví dụ: sắp xếp theo ngày tạo
      });
      return res.json({
        songs: topSongs.map(song => ({
          song_id: song.song_id,
          song_title: song.song_title,
          artist_name: song.Artist.artist_name,
          song_image_url: song.song_image_url,
          song_audio_url: song.song_audio_url,
        })),
        artists: [],
      });
    } catch (error) {
      console.error('Search default error:', error);
      return res.json({ songs: [], artists: [] });
    }
  }

  try {
    const songs = await Song.findAll({
      where: { song_title: { [Op.like]: `${q}%` } },
      include: [{ model: Artist, attributes: ['artist_name'] }],
      limit: 5,
    });
    const artists = await Artist.findAll({
      where: { artist_name: { [Op.like]: `${q}%` } },
      limit: 5,
    });
    console.log('Songs found:', songs);
    console.log('Artists found:', artists);
    res.json({
      songs: songs.map(song => ({
        song_id: song.song_id,
        song_title: song.song_title,
        artist_name: song.Artist.artist_name,
        song_image_url: song.song_image_url,
        song_audio_url: song.song_audio_url,
      })),
      artists: artists.map(artist => ({
        artist_id: artist.artist_id,
        artist_name: artist.artist_name,
        image_url: artist.image_url,
      })),
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint lấy gợi ý tìm kiếm
router.get('/suggestions', async (req, res) => {
  const { query } = req.query;
  const q = (req.query.query || '').trim();
  if (!q) {
    // Trả về top 5 bài hát nổi bật nếu query rỗng
    try {
      const topSongs = await Song.findAll({
        attributes: ['song_id', 'song_title', 'song_image_url', 'song_audio_url'],
        include: [{ model: Artist, attributes: ['artist_name'] }],
        limit: 5,
        order: [['created_at', 'DESC']],
      });
      return res.json({
        suggestions: topSongs.map(song => ({
          type: 'song',
          value: song.song_title,
          id: song.song_id,
          song_image_url: song.song_image_url || '',
          song_audio_url: song.song_audio_url || '',
          artist: song.Artist?.artist_name || '',
        })),
      });
    } catch (error) {
      console.error('Suggestions default error:', error);
      return res.json({ suggestions: [] });
    }
  }

  try {
    const songSuggestions = await Song.findAll({
      where: {
        song_title: { [Op.like]: `${q}%` }, // Chỉ khớp với chữ cái đầu
      },
      attributes: ['song_id', 'song_title', 'song_image_url', 'song_audio_url'],
      include: [{ model: Artist, attributes: ['artist_name'] }],
      limit: 5,
    });

    const artistSuggestions = await Artist.findAll({
      where: {
        artist_name: { [Op.like]: `${q}%` }, // Chỉ khớp với chữ cái đầu
      },
      attributes: ['artist_name'],
      limit: 3,
    });

    res.json({
      suggestions: [
        ...songSuggestions.map(song => ({
          type: 'song',
          value: song.song_title,
          id: song.song_id,
          song_image_url: song.song_image_url || '',
          song_audio_url: song.song_audio_url || '',
          artist: song.Artist?.artist_name || '',
        })),
        ...artistSuggestions.map(artist => ({
          type: 'artist',
          value: artist.artist_name,
        })),
      ],
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;