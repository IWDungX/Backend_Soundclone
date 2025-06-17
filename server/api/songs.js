'use strict';
const { Router } = require('express');
const { Song, Artist, Genre, Playlist, PlaylistSong, LikeSong, sequelize } = require('../models'); // Đã thêm LikeSong
const e = require('express');

const songsRouter = Router();

// API Lấy danh sách bài hát
songsRouter.get('/', async (req, res, next) => {
    try {
        const user_id = req.user.userId; // Lấy user_id từ middleware xác thực
        const songs = await Song.findAll({
            order: [['song_createAt', 'DESC']],
            include: [
                { model: Artist, attributes: ['artist_name', 'artist_id'] },
                { model: Genre, attributes: ['genre_name'] },
            ],
        });

        // Thêm trạng thái liked cho từng bài hát
        const songsWithLikeStatus = await Promise.all(
            songs.map(async (song) => {
                const existingLike = await LikeSong.findOne({
                    where: { user_id, song_id: song.song_id },
                });
                return {
                    ...song.toJSON(),
                    liked: !!existingLike, // true nếu bài hát được thích, false nếu không
                };
            })
        );

        res.json(songsWithLikeStatus);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách:', error);
        next(error);
    }
});

// API Lấy danh sách bài hát đã thích
songsRouter.get('/liked', async (req, res, next) => {
    try {
        const user_id = req.user.userId;

        const likedSongsPlaylist = await Playlist.findOne({
            where: { user_id: user_id, playlist_title: 'Bài hát đã thích' },
            include: [
                {
                    model: Song,
                    as: 'songs', 
                    through: { attributes: [] },
                    include: [
                        { model: Artist, attributes: ['artist_name'] },
                        { model: Genre, attributes: ['genre_name'] },
                    ],
                },
            ],
        });

        if (!likedSongsPlaylist) {
            return res.status(200).json({
                success: true,
                playlist: {
                    playlist_id: null,
                    playlist_title: 'Bài hát đã thích',
                    songs: [],
                },
            });
        }

        return res.status(200).json({
            success: true,
            playlist: {
                playlist_id: likedSongsPlaylist.playlist_id,
                playlist_title: likedSongsPlaylist.playlist_title,
                songs: likedSongsPlaylist.songs, 
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bài hát đã thích:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách bài hát đã thích' });
    }
});

// API Lấy danh sách thể loại
songsRouter.get('/genres', async (req, res, next) => {
    try {
        const genres = await Genre.findAll({
            attributes: ['genre_id', 'genre_name'],
        });
        res.json(genres);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thể loại:', error);
        next(error);
    }
});

// API Lấy danh sách nghệ sĩ
songsRouter.get('/artists', async (req, res, next) => {
    try {
        const artists = await Artist.findAll({
            attributes: ['artist_id', 'artist_name'],
        });
        res.json(artists);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nghệ sĩ:', error);
        next(error);
    }
});

// API Lấy chi tiết bài hát
songsRouter.get('/:id', async (req, res, next) => {
    try {
        const user_id = req.user.userId; // Lấy user_id từ middleware xác thực
        const song = await Song.findByPk(req.params.id, {
            include: [
                { model: Artist, attributes: ['artist_name'] },
                { model: Genre, attributes: ['genre_name'] },
            ],
        });

        if (!song) {
            return res.status(404).json({ error: 'Không tìm thấy bài hát' });
        }

        const existingLike = await LikeSong.findOne({
            where: { user_id, song_id: song.song_id },
        });

        const songWithLikeStatus = {
            ...song.toJSON(),
            liked: !!existingLike, // true nếu bài hát được thích, false nếu không
        };

        res.json(songWithLikeStatus);
    } catch (error) {
        console.error('Lỗi khi lấy bài hát:', error);
        next(error);
    }
});

// Hàm lấy hoặc tạo playlist "Bài hát đã thích"
const getOrCreateLikedPlaylist = async (userId) => {
    let LikeSongPlaylist = await Playlist.findOne({
        where: { user_id: userId, playlist_title: 'Bài hát đã thích' },
    });

    if (!LikeSongPlaylist) {
        LikeSongPlaylist = await Playlist.create({
            user_id: userId,
            playlist_title: 'Bài hát đã thích',
        });
    }

    return LikeSongPlaylist;
};

// API Thêm bài hát vào playlist "Bài hát đã thích"
songsRouter.post('/:id/like', async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const song_id = req.params.id;

        const song = await Song.findByPk(song_id);
        if (!song) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bài hát' });
        }

        const existingLike = await LikeSong.findOne({
            where: { user_id, song_id },
        });

        if (existingLike) {
            const LikeSongPlaylist = await Playlist.findOne({
                where: { user_id: user_id, playlist_title: 'Bài hát đã thích' },
            });

            await sequelize.transaction(async (transaction) => {
                await existingLike.destroy({ transaction });

                if (LikeSongPlaylist) {
                    await PlaylistSong.destroy({
                        where: { playlist_id: LikeSongPlaylist.playlist_id, song_id: song_id },
                        transaction,
                    });

                    const songCount = await PlaylistSong.count({
                        where: { playlist_id: LikeSongPlaylist.playlist_id },
                        transaction,
                    });

                    if (songCount === 0) {
                        await LikeSongPlaylist.destroy({ transaction });
                    }
                }

                return res.status(200).json({ success: true, message: 'Đã bỏ thích bài hát', liked: false });
            });
        } else {
            const LikeSongPlaylist = await getOrCreateLikedPlaylist(user_id);

            await sequelize.transaction(async (transaction) => {
                await LikeSong.create({ user_id, song_id }, { transaction });

                await PlaylistSong.create({
                    playlist_id: LikeSongPlaylist.playlist_id,
                    song_id,
                }, { transaction });

                return res.status(200).json({ success: true, message: 'Đã thích bài hát', liked: true });
            });
        }
    } catch (error) {
        console.error('Lỗi khi thêm bài hát vào danh sách yêu thích:', error);
        next(error);
    }
});

// API: Kiểm tra trạng thái bài hát và số lượt thích
songsRouter.get('/:id/like', async (req, res, next) => {
    try {
        const user_id = req.user.userId;
        const song_id = req.params.id;

        const song = await Song.findByPk(song_id);
        if (!song) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bài hát' });
        }

        const existingLike = await LikeSong.findOne({
            where: { user_id, song_id },
        });

        const likeCount = await LikeSong.count({
            where: { song_id },
        });

        return res.status(200).json({
            success: true,
            liked: !!existingLike,
            likeCount: likeCount,
        });
    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái bài hát:', error);
        next(error);
    }
});

module.exports = songsRouter;
