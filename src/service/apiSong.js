import apiInstance from './apiInstance';
import AuthService from './auth';

// API lấy danh sách bài hát
export const getSongs = async () => {
  try {
    const token = await AuthService.getToken();
    const response = await apiInstance.get('/songs', {
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
      console.error('Dữ liệu bài hát không hợp lệ:', response);
      return [];
    }

    // Đảm bảo mỗi bài hát có trường liked
    const songsWithLiked = response.map(song => ({
      ...song,
      liked: song.liked !== undefined ? song.liked : false, // Đảm bảo liked luôn có giá trị
    }));

    return songsWithLiked;
  } catch (error) {
    console.error('Lỗi khi gọi API getSongs:', error);
    throw error;
  }
};