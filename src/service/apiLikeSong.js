import apiInstance from './apiInstance';
import AuthService from './auth';

// API để thích hoặc bỏ thích bài hát
export const toggleLike = async (songId) => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.post(`/songs/${songId}/like`, {}, {
      token,
      onTokenExpired: async () => {
        try {
          const newToken = await AuthService.refreshToken();
          if (!newToken) {
            throw new Error('Không thể refresh token');
          }
          return newToken;
        } catch (error) {
          console.error('Không thể refresh token, đăng xuất...');
          await AuthService.logout();
          return null;
        }
      },
    });

    // Kiểm tra dữ liệu trả về
    if (!response || !response.success) {
      console.error('Phản hồi toggleLike không hợp lệ:', response);
      throw new Error('Không thể thực hiện toggleLike');
    }

    return response; // Trả về { success: true, message: 'Đã thích bài hát', liked: true/false }
  } catch (error) {
    console.error('Lỗi khi gọi API toggleLike:', error);
    throw error;
  }
};

// API kiểm tra trạng thái liked của bài hát
export const checkLikeStatus = async (songId) => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.get(`/songs/${songId}/like`, {
      token,
      onTokenExpired: async () => {
        try {
          const newToken = await AuthService.refreshToken();
          if (!newToken) {
            throw new Error('Không thể refresh token');
          }
          return newToken;
        } catch (error) {
          console.error('Không thể refresh token, đăng xuất...');
          await AuthService.logout();
          return null;
        }
      },
    });

    // Kiểm tra dữ liệu trả về
    if (!response || !response.success) {
      console.error('Phản hồi checkLikeStatus không hợp lệ:', response);
      throw new Error('Không thể kiểm tra trạng thái liked');
    }

    return response; // Trả về { success: true, liked: true/false, likeCount: number }
  } catch (error) {
    console.error('Lỗi khi gọi API checkLikeStatus:', error);
    throw error;
  }
};

// API lấy danh sách bài hát đã thích
export const getLikedSongs = async () => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.get(
      '/songs/liked',
      {
        token,
        onTokenExpired: async () => {
          try {
            const newToken = await AuthService.refreshToken();
            if (!newToken) throw new Error('Không thể refresh token');
            return newToken;
          } catch (error) {
            console.error('Không thể refresh token, đăng xuất...', error);
            await AuthService.logout();
            return null;
          }
        },
      }
    );

    if (!response) {
      throw new Error('Không nhận được phản hồi từ server');
    }
    if (!response.success) {
      throw new Error(response.message || 'Không thể lấy danh sách bài hát đã thích');
    }
    if (!response.playlist || !Array.isArray(response.playlist.songs)) {
      console.warn('Dữ liệu playlist không hợp lệ, trả về danh sách rỗng:', response);
      return { playlist: { songs: [], playlist_id: null, playlist_title: 'Bài hát đã thích' } };
    }

    return response; // { success: true, playlist: { playlist_id, playlist_title, songs: [...] } }
  } catch (error) {
    console.error('Lỗi khi gọi API getLikedSongs:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};
