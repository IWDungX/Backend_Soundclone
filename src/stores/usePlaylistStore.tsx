import { create } from 'zustand';
import PlaylistService from '../service/apiPlaylist';
import Toast from 'react-native-toast-message';

const usePlaylistStore = create((set) => ({
  playlists: [],
  isLoading: false,
  error: null,

  // Lấy danh sách playlist từ API
  fetchPlaylists: async () => {
    set({ isLoading: true, error: null });
    try {
      const playlistsData = await PlaylistService.getUserPlaylists();
      set({ playlists: playlistsData, isLoading: false });
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tải danh sách playlist',
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể tải danh sách playlist',
      });
    }
  },

  // Tạo playlist mới
  createPlaylist: async (playlistTitle) => {
    set({ isLoading: true, error: null });
    try {
      const newPlaylist = await PlaylistService.createPlaylist(playlistTitle);
      set((state) => ({
        playlists: [...state.playlists, newPlaylist],
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
      throw error;
    }
  },
}));

export default usePlaylistStore;