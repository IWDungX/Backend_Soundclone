'use strict';
const { Router } = require('express');
const { User, FollowArtist, Artist } = require('../models');
const { v4: uuidv4 } = require('uuid');

const usersRouter = Router();

// Lấy thông tin người dùng
usersRouter.get('/me', async (req, res) => {
  try {
    const user_id = req.user.userId;
    const user = await User.findByPk(user_id, {
      attributes: ['user_email', 'user_name', 'user_created_at'],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const followingCount = await FollowArtist.count({
      where: { user_id },
    });

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        user_email: user.user_email,
        user_name: user.user_name,
        user_created_at: user.user_created_at,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
});

// Cập nhật thông tin người dùng
usersRouter.put('/me', async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { user_name } = req.body;

    const targetUser = await User.findByPk(user_id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    await targetUser.update({ user_name });

    const followingCount = await FollowArtist.count({
      where: { user_id },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        user_email: targetUser.user_email,
        user_name: targetUser.user_name,
        user_created_at: targetUser.user_created_at,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
});

// Xóa người dùng
usersRouter.delete('/me', async (req, res) => {
  try {
    const user_id = req.user.userId;

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
});

// Theo dõi nghệ sĩ
usersRouter.post('/me/follow-artists', async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { artist_id } = req.body;

    if (!artist_id) {
      return res.status(400).json({ success: false, message: 'artist_id là bắt buộc' });
    }

    const artist = await Artist.findByPk(artist_id);
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nghệ sĩ' });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const existingFollow = await FollowArtist.findOne({
      where: { user_id, artist_id },
    });
    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Người dùng đã theo dõi nghệ sĩ này' });
    }

    const follow = await FollowArtist.create({
      follow_artist_id: uuidv4(),
      user_id,
      artist_id,
    });

    res.status(201).json({
      success: true,
      message: 'Theo dõi nghệ sĩ thành công',
      data: follow,
    });
  } catch (error) {
    console.error('Lỗi khi theo dõi nghệ sĩ:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
    
  }
});

// Bỏ theo dõi nghệ sĩ
usersRouter.delete('/me/follow-artists/:artist_id', async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { artist_id } = req.params;

    const follow = await FollowArtist.findOne({
      where: { user_id, artist_id },
    });
    if (!follow) {
      return res.status(404).json({ success: false, message: 'Người dùng không theo dõi nghệ sĩ này' });
    }

    await follow.destroy();
    res.status(200).json({ success: true, message: 'Bỏ theo dõi nghệ sĩ thành công' });
  } catch (error) {
    console.error('Lỗi khi bỏ theo dõi nghệ sĩ:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
});

// Lấy danh sách nghệ sĩ đang theo dõi
usersRouter.get('/me/follow-artists', async (req, res) => {
  try {
    const user_id = req.user.userId;

    const follows = await FollowArtist.findAll({
      where: { user_id },
      include: [
        {
          model: Artist,
          attributes: ['artist_id', 'artist_name', 'bio', 'image_url'],
        },
      ],
    });

    const artists = follows.map((follow) => follow.Artist);
    res.status(200).json({
      success: true,
      data: artists,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nghệ sĩ theo dõi:', error);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = usersRouter;