const { Router } = require("express");
const { Sequelize } = require("sequelize");
const { Song, Playlist, PlaylistSong, Artist, LikeSong } = require("../models");

const playlistRouter = Router();

// Tạo playlist mới
playlistRouter.post('/', async (req, res) => {
    const { playlist_title, user_id } = req.body;
    try {
        const newPlaylist = await Playlist.create({ playlist_title, user_id }); 
        return res.status(201).json({
            user_id, 
            playlist_title, 
            songs: []
        });
    } catch (e) {
        console.error('Playlist error:', e);
        return res.status(500).json({ errorMessage: 'Không thể tạo danh sách' });
    }
});

// Thêm bài hát vào playlist
playlistRouter.post('/playlists/:id/songs', async (req, res) => {
    const { id } = req.params;
    const { title, artist, duration } = req.body;
    try {

        const existingPlaylist = await Playlist.findOne({ where: { id } });
        if (!existingPlaylist) {
            return res.status(404).json({ error: 'Danh sách không tồn tại' });
        }

        await PlaylistSong.create({
            playlistId: id,
            title,
            artist,
            duration
        });

        const songs = await PlaylistSong.findAll({ where: { playlistId: id } });
        return res.status(200).json({
            id,
            name: existingPlaylist.title, 
            songs
        });
    } catch (error) {
        console.error('Error adding song:', error);
        return res.status(500).json({ error: 'Không thể thêm bài hát' });
    }
});

module.exports = playlistRouter;