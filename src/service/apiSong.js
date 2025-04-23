import apiInstance from './apiInstance';
import AuthService from './auth';

// API lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.get('/songs', { token });
    return response;
  } catch (error) {
    console.error('Lỗi khi gọi API getSongs:', error);
    throw error;
  }
};

// API lấy danh sách bài hát đã thích
export const getLikedSongs = async () => {
  try {
    const token = await AuthService.getToken(); // Sử dụng AuthService để lấy token
    const response = await apiInstance.get('/songs/liked', {
      token, // Truyền token vào config
      onTokenExpired: async () => {
        try {
          const newToken = await AuthService.refreshToken(); // Gọi refresh token từ AuthService
          if (!newToken) {
            throw new Error('Không thể refresh token');
          }
          return newToken;
        } catch (error) {
          console.error('Không thể refresh token, đăng xuất...');
          await AuthService.logout(); // Đăng xuất nếu không refresh được
          return null;
        }
      },
    });
    return response;
  } catch (error) {
    console.error('Lỗi khi gọi API getLikedSongs:', error);
    throw error;
  }
};