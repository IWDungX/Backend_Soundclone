import { create } from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';
import apiUser from '../service/apiUser';
import AuthService from '../service/auth';
import { toggleLike, checkLikeStatus, getLikedSongs } from '../service/apiLikeSong';
import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from './usePlayerStore';
import Toast from 'react-native-toast-message'; // Thêm Toast để thông báo

// Định nghĩa kiểu UserProfile (bỏ avatar_url)
interface UserProfile {
  user_name: string;
  user_email: string;
  is_premium: boolean;
  user_created_at: string;
  following_count: number;
}

// Định nghĩa kiểu History (giữ nguyên)
interface History {
  history_id: string;
  song_id: string;
  song_title: string;
  artist_name: string;
  song_image_url: string;
  song_audio_url: string;
  user_name: string;
  played_at: string;
}

// Hàm ánh xạ dữ liệu API sang UserProfile
const mapApiUserToProfile = (apiData: any): UserProfile => ({
  user_name: apiData.user_name || '',
  user_email: apiData.user_email || '',
  is_premium: apiData.is_premium || false, // Giả định is_premium từ API hoặc mặc định false
  user_created_at: apiData.user_created_at || new Date().toISOString(),
  following_count: apiData.following || 0,
});

const useUserStore = create((set, get) => ({
  isAuthenticated: false,
  user: null as UserProfile | null,
  isLoading: false,
  error: null,
  likedSongIds: new Set<string>(),
  histories: [] as History[],

  // Khởi tạo trạng thái xác thực
  initializeAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AuthService.getToken();
      console.log('initializeAuth: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
      if (!token) {
        console.log('initializeAuth: No token, resetting state');
        set({
          isAuthenticated: false,
          user: null,
          likedSongIds: new Set(),
          histories: [],
          isLoading: false,
        });
        return;
      }

      const userData = await apiUser.getUser();
      console.log('initializeAuth: API response at', new Date().toLocaleTimeString(), ':', JSON.stringify(userData, null, 2));
      const mappedUser = mapApiUserToProfile(userData);

      const songs = await getLikedSongs();
      const likedSongIds = Array.isArray(songs)
        ? new Set(songs.map(song => song.song_id))
        : new Set();

      const historyResponse = await apiUser.getHistoryByDateRange();
      const histories = Array.isArray(historyResponse?.data?.histories)
        ? historyResponse.data.histories
        : [];

      set({
        isAuthenticated: true,
        user: mappedUser,
        likedSongIds,
        histories,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('initializeAuth: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({
        isAuthenticated: false,
        user: null,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: error.message || 'Failed to initialize authentication',
      });
    }
  },

  // Lấy thông tin người dùng
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const userData = await apiUser.getUser();
      console.log('fetchUser: API response at', new Date().toLocaleTimeString(), ':', JSON.stringify(userData, null, 2));
      const mappedUser = mapApiUserToProfile(userData);
      set({ user: mappedUser, isLoading: false });
    } catch (error: any) {
      console.error('fetchUser: Error at', new Date().toLocaleTimeString(), ':', error.message, error.response?.data);
      set({ error: error.message || 'Failed to fetch user data', isLoading: false });
    }
  },

  // Cập nhật thông tin người dùng (gửi JSON với user_name)
  updateUser: async (user_name: string) => {
    set({ isLoading: true, error: null });
    try {
      const userData = await apiUser.updateUser(user_name);
      console.log('updateUser: API response at', new Date().toLocaleTimeString(), ':', JSON.stringify(userData, null, 2));
      const mappedUser = mapApiUserToProfile(userData);
      set({ user: mappedUser, isLoading: false });
    } catch (error: any) {
      console.error('updateUser: Error at', new Date().toLocaleTimeString(), ':', error.message, error.response?.data);
      set({ error: error.message || 'Failed to update user data', isLoading: false });
    }
  },

  // Xóa người dùng
  deleteUser: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiUser.deleteUser();
      await AuthService.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('deleteUser: Error at', new Date().toLocaleTimeString(), ':', error.message, error.response?.data);
      set({ error: error.message || 'Failed to delete user', isLoading: false });
    }
  },

  // Đăng nhập
  login: async (token: string, refreshToken: string) => {
    set({ isLoading: true, error: null });
    try {
      // Xóa trạng thái cũ trước khi đăng nhập tài khoản mới
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      usePlayerStore.setState({
        queue: [],
        currentTrack: null,
        currentTrackData: null,
        isPlaying: false,
      });

      await EncryptedStorage.setItem('token', token);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      const userData = await apiUser.getUser();
      console.log('login: API response at', new Date().toLocaleTimeString(), ':', JSON.stringify(userData, null, 2));
      const mappedUser = mapApiUserToProfile(userData);

      const songs = await getLikedSongs();
      const likedSongIds = new Set(songs.map(song => song.song_id));
      const historyResponse = await apiUser.getHistoryByDateRange();
      const histories = Array.isArray(historyResponse.data.histories)
        ? historyResponse.data.histories
        : [];

      set({
        isAuthenticated: true,
        user: mappedUser,
        likedSongIds,
        histories,
        isLoading: false,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đăng nhập thành công',
      });
    } catch (error: any) {
      console.error('login: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Login failed', isLoading: false });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đăng nhập thất bại',
      });
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Dừng và xóa hàng đợi của TrackPlayer
      await TrackPlayer.stop();
      await TrackPlayer.reset();

      // Xóa trạng thái của usePlayerStore (thay RepeatMode.Off bằng 0)
      usePlayerStore.setState({
        queue: [],
        currentTrack: null,
        currentTrackData: null,
        isPlaying: false,
        isShuffling: false,
        repeatMode: 0, // Thay RepeatMode.Off bằng 0
      });

      // Gọi API đăng xuất
      await AuthService.logout();

      // Cập nhật trạng thái sau khi đăng xuất thành công
      set({
        user: null,
        isAuthenticated: false,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: null,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đăng xuất thành công',
      });
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Dù có lỗi, vẫn đảm bảo trạng thái được đặt lại
      set({
        user: null,
        isAuthenticated: false,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: error.message || 'Đăng xuất thất bại',
      });
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Đăng xuất thất bại',
      });
      throw error;
    }
  },

  // Lấy danh sách bài hát đã thích (giữ nguyên)
  fetchLikedSongs: async () => {
    set({ isLoading: true, error: null });
    try {
      const songs = await getLikedSongs();
      const likedSongIds = new Set(songs.map(song => song.song_id));
      set({ likedSongIds, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Thích hoặc bỏ thích bài hát (giữ nguyên)
  toggleLikeSong: async (songId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await toggleLike(songId);
      if (response.success) {
        set((state) => {
          const likedSongIds = new Set(state.likedSongIds);
          if (response.liked) {
            likedSongIds.add(songId);
          } else {
            likedSongIds.delete(songId);
          }
          return { likedSongIds, isLoading: false };
        });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Kiểm tra trạng thái liked của một bài hát (giữ nguyên)
  checkIsLiked: async (songId: string) => {
    const { likedSongIds } = get();
    if (likedSongIds.has(songId)) {
      return true;
    }
    try {
      const response = await checkLikeStatus(songId);
      if (response.success && response.liked) {
        set((state) => ({
          likedSongIds: new Set([...state.likedSongIds, songId]),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },

  // Lấy lịch sử phát nhạc theo khoảng thời gian (giữ nguyên)
  fetchHistoryByDateRange: async (from = null, to = null) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiUser.getHistoryByDateRange(from, to);

      // Flatten the grouped histories_by_day into a single array
      const groupedHistories = response?.histories_by_day || {};
      const histories = Object.values(groupedHistories).flat(); // Flatten the arrays

      const existingHistory = get().histories || [];
      const newHistory = Array.isArray(histories)
        ? histories.filter((song) => {
            return !existingHistory.some(
              (s) => s.history_id === song.history_id && s.played_at === song.played_at
            );
          })
        : [];

      const mergedHistory = [...existingHistory, ...newHistory].sort(
        (a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
      );

      set({ histories: mergedHistory, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch history', isLoading: false });
    }
  },

  // Thêm lịch sử phát nhạc (giữ nguyên)
  addHistory: async (songId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { histories } = get();
      const lastHistory = histories[0];
      const now = new Date();
      const lastPlayedTime = lastHistory ? new Date(lastHistory.played_at) : null;

      // Kiểm tra trùng lặp: song_id giống và thời gian cách nhau dưới 30 giây
      if (lastHistory && lastHistory.song_id === songId) {
        const timeDiff = lastPlayedTime ? (now.getTime() - lastPlayedTime.getTime()) / 1000 : Infinity;
        if (timeDiff < 30) {
          console.log('Bỏ qua lưu lịch sử: Bài hát trùng và thời gian quá gần');
          set({ isLoading: false });
          return;
        }
      }

      // Gọi API để lưu lịch sử
      const response = await apiUser.createHistory(songId);
      if (response.data) {
        set((state) => ({
          histories: [response.data, ...state.histories].slice(0, 50), // Giới hạn 50 bản ghi
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Thêm lịch sử thất bại:', error.message);
      set({ error: error.message || 'Thêm lịch sử thất bại', isLoading: false });
      throw error;
    }
  },

  // Xóa lịch sử phát nhạc (giữ nguyên)
  deleteHistory: async (historyId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiUser.deleteHistory(historyId);
      set((state) => ({
        histories: state.histories.filter((h) => h.history_id !== historyId),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Xóa lịch sử thất bại:', error.message);
      set({ error: error.message || 'Xóa lịch sử thất bại', isLoading: false });
      throw error;
    }
  },

  // Xóa lỗi (giữ nguyên)
  clearError: () => {
    set({ error: null });
  },
}));

export default useUserStore;