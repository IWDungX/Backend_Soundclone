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
    const response = await apiInstance.get('/songs/liked', {
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
    if (!response || !response.playlist || !Array.isArray(response.playlist.songs)) {
      console.error('Dữ liệu bài hát đã thích không hợp lệ:', response);
      return [];
    }

    // Trả về danh sách bài hát đã thích
    return response.playlist.songs.map(song => ({
      ...song,
      liked: true, // Đảm bảo liked là true cho các bài hát trong danh sách đã thích
    }));
  } catch (error) {
    console.error('Lỗi khi gọi API getLikedSongs:', error);
    throw error;
  }
};