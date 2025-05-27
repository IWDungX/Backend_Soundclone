const { Router } = require("express");
const { Sequelize } = require("sequelize");
const { User, Song, Playlist, PlaylistSong, Artist, LikeSong } = require("../models");

const playlistRouter = Router();

// Tạo playlist mới
playlistRouter.post("/", async (req, res) => {
  const { playlist_title } = req.body;
  const user_id = req.user.userId;

  try {
    const newPlaylist = await Playlist.create({ playlist_title, user_id });
    return res.status(201).json({
      success: true,
      message: "Tạo playlist thành công",
      playlist: {
        id: newPlaylist.playlist_id,
        playlist_title,
        user_id,
        songs: [],
      },
    });
  } catch (error) {
    console.error("Playlist creation error:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể tạo playlist",
    });
  }
});

// Thêm bài hát vào playlist
playlistRouter.post("/:id/songs", async (req, res) => {
  const { id: playlist_id } = req.params;
  const { songId } = req.body;
  const user_id = req.user.userId;

  try {
    const existingPlaylist = await Playlist.findOne({
      where: { playlist_id, user_id },
    });
    if (!existingPlaylist) {
      return res.status(403).json({
        success: false,
        error: "Playlist không tồn tại hoặc bạn không có quyền",
      });
    }

    const song = await Song.findByPk(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: "Bài hát không tồn tại",
      });
    }

    const alreadyExists = await PlaylistSong.findOne({
      where: { playlist_id, song_id: songId },
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        error: "Bài hát đã có trong playlist",
      });
    }

    await PlaylistSong.create({ playlist_id, song_id: songId });

    const songs = await PlaylistSong.findAll({
      where: { playlist_id },
      include: [
        {
          model: Song,
          include: [{ model: Artist, attributes: ["artist_name"] }],
          attributes: ["song_id", "song_title", "song_duration", "song_audio_url", "song_image_url"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Thêm bài hát thành công",
      playlist: {
        id: playlist_id,
        playlist_title: existingPlaylist.playlist_title,
        songs: songs.map((ps) => ({
          id: ps.Song.song_id,
          title: ps.Song.song_title,
          artist: ps.Song.Artist?.artist_name || "Unknown",
          duration: ps.Song.song_duration,
          url: ps.Song.song_audio_url,
          artwork: ps.Song.song_image_url,
        })),
      },
    });
  } catch (error) {
    console.error("Error adding song:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể thêm bài hát",
    });
  }
});

// Xóa bài hát khỏi playlist
playlistRouter.delete("/:id/songs/:songId", async (req, res) => {
  const { id: playlist_id, songId } = req.params;
  const user_id = req.user.userId;

  try {
    console.log('Received DELETE request - playlistId:', playlist_id, 'songId:', songId);
    const existingPlaylist = await Playlist.findOne({ where: { playlist_id, user_id } });
    if (!existingPlaylist) {
      return res.status(403).json({ success: false, error: "Playlist không tồn tại hoặc bạn không có quyền" });
    }

    const playlistSong = await PlaylistSong.findOne({ where: { playlist_id, song_id: songId } });
    if (!playlistSong) {
      return res.status(404).json({ success: false, error: "Bài hát không tồn tại trong playlist" });
    }

    await playlistSong.destroy();
    const songs = await PlaylistSong.findAll({
      where: { playlist_id },
      include: [{ model: Song, include: [{ model: Artist, attributes: ["artist_name"] }], attributes: ["song_id", "song_title", "song_duration", "song_audio_url", "song_image_url"] }],
    });

    return res.status(200).json({
      success: true,
      message: "Xóa bài hát khỏi playlist thành công",
      playlist: {
        id: playlist_id,
        playlist_title: existingPlaylist.playlist_title,
        songs: songs.map(ps => ({
          id: ps.Song.song_id,
          title: ps.Song.song_title,
          artist: ps.Song.Artist?.artist_name || "Unknown",
          duration: ps.Song.song_duration,
          url: ps.Song.song_audio_url,
          artwork: ps.Song.song_image_url,
        })),
      },
    });
  } catch (error) {
    console.error("Error removing song from playlist:", error.message, error.stack);
    return res.status(500).json({ success: false, error: "Không thể xóa bài hát khỏi playlist: " + error.message });
  }
});

// Lấy chi tiết một playlist cụ thể
playlistRouter.get("/:id", async (req, res) => {
  const { id: playlist_id } = req.params;
  const user_id = req.user?.userId;

  try {
    if (!req.user || !user_id) {
      return res.status(401).json({
        success: false,
        error: "Không tìm thấy thông tin người dùng",
      });
    }

    const playlist = await Playlist.findOne({
      where: { playlist_id, user_id },
      include: [
        {
          model: Song,
          as: 'songs',
          attributes: ['song_id', 'song_title', 'song_duration', 'song_audio_url', 'song_image_url'],
          through: { attributes: [] },
          include: [{ model: Artist, attributes: ['artist_name'] }],
        },
      ],
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: "Playlist không tồn tại hoặc bạn không có quyền truy cập",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết playlist thành công",
      playlist: {
        id: playlist.playlist_id,
        playlist_title: playlist.playlist_title,
        songs: (playlist.songs || []).map((s) => ({
          id: s.song_id,
          title: s.song_title,
          artist: s.Artist?.artist_name ?? 'Unknown',
          duration: s.song_duration,
          url: s.song_audio_url,
          artwork: s.song_image_url,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể lấy chi tiết playlist",
    });
  }
});

// Lấy danh sách tất cả playlist của người dùng
playlistRouter.get("/", async (req, res) => {
  const user_id = req.user?.userId;

  try {
    if (!req.user || !user_id) {
      return res.status(401).json({
        success: false,
        error: "Không tìm thấy thông tin người dùng",
      });
    }

    const playlists = await Playlist.findAll({
      where: { user_id },
      include: [
        {
          model: Song,
          as: 'songs',
          attributes: ['song_id', 'song_title', 'song_duration', 'song_audio_url', 'song_image_url'],
          through: { attributes: [] },
          include: [{ model: Artist, attributes: ['artist_name'] }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách playlist thành công",
      playlists: playlists.map((pl) => ({
        id: pl.playlist_id,
        playlist_title: pl.playlist_title,
        songs: (pl.songs || []).map((s) => ({
          id: s.song_id,
          title: s.song_title,
          artist: s.Artist?.artist_name ?? 'Unknown',
          duration: s.song_duration,
          url: s.song_audio_url,
          artwork: s.song_image_url,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({
      success: false,
      error: "Không thể lấy danh sách playlist",
    });
  }
});

module.exports = playlistRouter;