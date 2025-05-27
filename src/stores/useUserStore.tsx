import { create } from 'zustand';
import EncryptedStorage from 'react-native-encrypted-storage';
import apiUser from '../service/apiUser';
import AuthService from '../service/auth';
import { toggleLike, checkLikeStatus, getLikedSongs } from '../service/apiLikeSong';

// Định nghĩa kiểu UserProfile
interface UserProfile {
  user_name: string;
  full_name: string;
  email: string;
  avatar: string;
  is_premium: boolean;
  created_at: string;
  following_count: number;
}

// Định nghĩa kiểu History
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
      if (token) {
        const user = await apiUser.getUser();
        const mappedUser = mapApiUserToProfile(user);

        const songs = await getLikedSongs();
        const likedSongIds = Array.isArray(songs)
          ? new Set(songs.map(song => song.song_id))
          : new Set();

        // Lấy lịch sử phát nhạc theo khoảng thời gian (mặc định hoặc tùy chỉnh)
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
      } else {
        set({
          isAuthenticated: false,
          user: null,
          likedSongIds: new Set(),
          histories: [],
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Initialize Auth Error:', error.message);
      set({
        isAuthenticated: false,
        user: null,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: error.message || 'Failed to initialize authentication',
      });
      throw error;
    }
  },

  // Lấy thông tin người dùng
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await apiUser.getUser();
      const mappedUser = mapApiUserToProfile(user);
      set({ user: mappedUser, isLoading: false });
    } catch (error) {
      console.error('Fetch User Error:', error.message);
      set({ error: error.message || 'Failed to fetch user data', isLoading: false });
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userData: UserProfile, avatarFile: any) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('user_name', userData.user_name);
      formData.append('user_email', userData.email);
      formData.append('fullName', userData.full_name);
      if (avatarFile && avatarFile.uri) {
        formData.append('avatar', {
          uri: avatarFile.uri,
          name: avatarFile.fileName || 'avatar.jpg',
          type: avatarFile.type || 'image/jpeg',
        });
      }

      const updatedUser = await apiUser.updateUser(formData);
      const mappedUser = mapApiUserToProfile(updatedUser);
      set({ user: mappedUser, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Xóa tài khoản người dùng
  deleteUser: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiUser.deleteUser();
      await AuthService.logout();
      set({
        user: null,
        isAuthenticated: false,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Đăng nhập
  login: async (token: string, refreshToken: string) => {
    set({ isLoading: true, error: null });
    try {
      await EncryptedStorage.setItem('token', token);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      const response = await apiUser.getUser();
      if (response.success) {
        const mappedUser = mapApiUserToProfile(response.data);
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
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.logout();
      set({
        user: null,
        isAuthenticated: false,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      set({
        user: null,
        isAuthenticated: false,
        likedSongIds: new Set(),
        histories: [],
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  // Lấy danh sách bài hát đã thích
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

  // Thích hoặc bỏ thích bài hát
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

  // Kiểm tra trạng thái liked của một bài hát
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

  // Lấy lịch sử phát nhạc theo khoảng thời gian
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

  // Thêm lịch sử phát nhạc
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

  // Xóa lịch sử phát nhạc
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

  // Xóa lỗi
  clearError: () => {
    set({ error: null });
  },
}));

// Hàm ánh xạ dữ liệu từ API sang kiểu UserProfile
const mapApiUserToProfile = (apiData: any): UserProfile => ({
  user_name: apiData.user_name || '',
  full_name: apiData.full_name || apiData.user_name || '',
  email: apiData.user_email || '',
  avatar: apiData.user_avatar_url || 'https://i.pravatar.cc/150',
  is_premium: false,
  created_at: apiData.user_created_at || '',
  following_count: apiData.following || 0,
});

export default useUserStore;