import apiInstance from './apiInstance';
import AuthService from './auth';

// API lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.get('/songs', { token });
    // Kiểm tra dữ liệu trả về
    if (!response || !Array.isArray(response)) {
      console.error('Dữ liệu bài hát không hợp lệ:', response);
      return [];
    }
    return response;
  } catch (error) {
    console.error('Lỗi khi gọi API getSongs:', error);
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
    if (!response || !Array.isArray(response)) {
      console.error('Dữ liệu bài hát đã thích không hợp lệ:', response);
      return [];
    }
    return response;
  } catch (error) {
    console.error('Lỗi khi gọi API getLikedSongs:', error);
    throw error;
  }
};