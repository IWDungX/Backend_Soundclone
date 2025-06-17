import { create } from 'zustand';
import PlaylistService from '../service/apiPlaylist';
import Toast from 'react-native-toast-message';
import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from './usePlayerStore';
import { getFullMinioUrl } from '../service/minioUrl';

const usePlaylistStore = create((set) => ({
  playlists: [],
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      const playlistsData = await PlaylistService.getUserPlaylists();
      console.log('Playlists Data:', playlistsData);
      const normalizedPlaylists = playlistsData.map(playlist => ({
        id: playlist.id,
        title: playlist.playlist_title,
        songs: playlist.songs || [],
        coverImage: playlist.coverImage || 'https://picsum.photos/200/200',
      }));
      set({ playlists: normalizedPlaylists, isLoading: false });
      console.log('Normalized Playlists:', normalizedPlaylists);
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tải danh sách playlist',
      });
    } catch (error) {
      console.error('Error fetching playlists:', error);
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tải danh sách playlist',
      });
      throw error;
    }
  },

  createPlaylist: async (playlistTitle) => {
    set({ isLoading: true, error: null });
    try {
      const newPlaylist = await PlaylistService.createPlaylist(playlistTitle);
      const normalizedNewPlaylist = {
        id: newPlaylist.id,
        title: newPlaylist.playlist_title,
        songs: newPlaylist.songs || [],
        coverImage: newPlaylist.coverImage || 'https://picsum.photos/200/200',
      };
      set((state) => ({
        playlists: [...state.playlists, normalizedNewPlaylist],
        isLoading: false,
      }));
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Playlist đã được tạo',
      });
      return newPlaylist;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tạo playlist',
      });
      await usePlaylistStore.getState().fetchPlaylists();
      throw error;
    }
  },

  getPlaylistDetails: async (playlistId) => {
    set({ isLoading: true, error: null });
    try {
      const playlistData = await PlaylistService.getPlaylistDetails(playlistId);
      const transformedData = {
        ...playlistData,
        songs: playlistData.songs.map((song) => ({
          ...song,
          url: getFullMinioUrl(song.url),
          artwork: getFullMinioUrl(song.artwork),
        })),
      };
      set({ isLoading: false });
      return transformedData;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tải chi tiết playlist',
      });
      throw error;
    }
  },

  playPlaylist: async (playlistId) => {
    set({ isLoading: true, error: null });
    try {
      const playlistData = await PlaylistService.getPlaylistDetails(playlistId);
      if (!playlistData?.songs?.length) {
        throw new Error('Playlist không có bài hát nào để phát');
      }

      const tracks = playlistData.songs.map((song) => ({
        id: song.id,
        url: getFullMinioUrl(song.url),
        title: song.title,
        artist: song.artist,
        artwork: getFullMinioUrl(song.artwork),
        duration: song.duration,
      }));

      const { currentTrack, queue, setCurrentTrack, setIsPlaying, setQueue } = usePlayerStore.getState();
      const currentQueue = await TrackPlayer.getQueue();
      const isQueueMatching = currentQueue.length === tracks.length &&
        currentQueue.every((track, index) => track.id === tracks[index].id);
      const isCurrentTrackInPlaylist = tracks.some(track => track.id === currentTrack);

      if (!isQueueMatching || !isCurrentTrackInPlaylist) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        setQueue(tracks);
      }

      // Nếu bài hiện tại nằm trong playlist, giữ nguyên vị trí; nếu không, phát từ đầu
      let trackIndex = 0;
      if (isCurrentTrackInPlaylist) {
        trackIndex = tracks.findIndex(track => track.id === currentTrack);
        if (trackIndex === -1) trackIndex = 0; // Fallback nếu không tìm thấy
      }

      await TrackPlayer.skip(trackIndex);
      if (!isQueueMatching || !isCurrentTrackInPlaylist) {
        await TrackPlayer.play();
        setCurrentTrack(tracks[trackIndex].id, tracks[trackIndex]);
        setIsPlaying(true);
      }

      set({ isLoading: false });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đang phát playlist',
      });
    } catch (error) {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      usePlayerStore.getState().setState({ queue: [], currentTrack: null, currentTrackData: null, isPlaying: false });
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể phát playlist',
      });
      throw error;
    }
  },

  addSongToPlaylist: async (playlistId, songId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPlaylist = await PlaylistService.addSongToPlaylist(playlistId, songId);
      set({ isLoading: false });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã thêm bài hát vào playlist',
      });
      return updatedPlaylist;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể thêm bài hát vào playlist',
      });
      throw error;
    }
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    console.log('Removing song - playlistId:', playlistId, 'songId:', songId);
    set({ isLoading: true, error: null });
    try {
      const updatedPlaylist = await PlaylistService.removeSongFromPlaylist(playlistId, songId);
      console.log('Updated playlist after removal:', updatedPlaylist);
      const normalizedUpdatedPlaylist = {
        id: updatedPlaylist.id,
        title: updatedPlaylist.playlist_title,
        songs: updatedPlaylist.songs || [],
        coverImage: updatedPlaylist.coverImage || 'https://picsum.photos/200/200',
      };

      set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === playlistId ? normalizedUpdatedPlaylist : playlist
        ),
        isLoading: false,
      }));

      if (updatedPlaylist.playlist_title.trim().toLowerCase() === 'bài hát đã thích') {
        usePlayerStore.getState().setLikeStatusBySongId(songId, false);
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã xóa bài hát khỏi playlist',
      });
      return updatedPlaylist;
    } catch (error) {
      console.error('Error removing song from playlist:', error.message, error.response?.data);
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.response?.data?.error || error.message || 'Không thể xóa bài hát khỏi playlist',
      });
      throw error;
    }
  },
}));

export default usePlaylistStore;