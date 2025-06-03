const { Router } = require('express');
const { Op } = require('sequelize');
const { History, User, Song, Artist } = require('../models');

const HistoryRouter = Router();

// Endpoint lấy lịch sử phát nhạc
HistoryRouter.get('/date', async (req, res) => {
  const user_id = req.user.userId;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7 ngày gồm hôm nay

    // Fetch all history in the last 7 days
    const histories = await History.findAll({
      where: {
        user_id,
        played_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Song,
          attributes: ['song_id', 'song_title', 'song_image_url', 'song_audio_url', 'artist_id'],
          include: [{ model: Artist, attributes: ['artist_name'] }],
        },
        {
          model: User,
          attributes: ['user_id', 'user_name'],
        },
      ],
      order: [['played_at', 'DESC']],
    });

    // Group histories by date
    const grouped = {};

    for (const history of histories) {
      const date = history.played_at.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!grouped[date]) grouped[date] = [];
      if (grouped[date].length < 5) {
        grouped[date].push({
          history_id: history.history_id,
          song_id: history.Song.song_id,
          song_title: history.Song.song_title,
          artist_name: history.Song.Artist.artist_name,
          song_image_url: history.Song.song_image_url || '',
          song_audio_url: history.Song.song_audio_url || '',
          user_name: history.User.user_name,
          played_at: history.played_at,
        });
      }
    }

    res.json({ histories_by_day: grouped });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint tạo một bản ghi lịch sử phát nhạc
HistoryRouter.post('/', async (req, res) => {
  const { song_id } = req.body;
  const user_id = req.user.userId;

  console.log('Received POST request with user_id:', user_id, 'song_id:', song_id); // Debug log

  if (!user_id || !song_id) {
    return res.status(400).json({ message: 'user_id and song_id are required' });
  }

  try {
    const user = await User.findByPk(user_id);
    const song = await Song.findByPk(song_id);

    if (!user || !song) {
      console.log('User or Song not found:', { user_id, song_id }); // Debug log
      return res.status(404).json({ message: 'User or Song not found' });
    }

    const history = await History.create({
      user_id,
      song_id,
      played_at: new Date(),
    });

    const historyWithDetails = await History.findByPk(history.history_id, {
      include: [
        {
          model: Song,
          attributes: ['song_id', 'song_title', 'song_image_url', 'song_audio_url'],
          include: [{ model: Artist, attributes: ['artist_name'] }],
        },
        {
          model: User,
          attributes: ['user_id', 'user_name'],
        },
      ],
    });

    console.log('History created successfully:', historyWithDetails); // Debug log

    res.status(201).json({
      history_id: historyWithDetails.history_id,
      song_id: historyWithDetails.Song.song_id,
      song_title: historyWithDetails.Song.song_title,
      artist_name: historyWithDetails.Song.Artist.artist_name,
      song_image_url: historyWithDetails.Song.song_image_url || '',
      song_audio_url: historyWithDetails.Song.song_audio_url || '',
      user_name: historyWithDetails.User.user_name,
      played_at: historyWithDetails.played_at,
    });
  } catch (error) {
    console.error('History creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint xóa một bản ghi lịch sử
HistoryRouter.delete('/:history_id', async (req, res) => {
  const { history_id } = req.params;

  try {
    const history = await History.findByPk(history_id);
    if (!history) {
      return res.status(404).json({ message: 'History record not found' });
    }

    await history.destroy();
    res.json({ message: 'History record deleted successfully' });
  } catch (error) {
    console.error('History deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = HistoryRouter;