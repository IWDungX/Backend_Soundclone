import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.205:15000/api';

const AuthService = {
  getToken: async () => {
    try {
      return await EncryptedStorage.getItem('token');
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      return await EncryptedStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Lỗi lấy refresh token:', error);
      return null;
    }
  },

  setToken: async (token) => {
    try {
      await EncryptedStorage.setItem('token', token);
    } catch (error) {
      console.error('Lỗi lưu token:', error);
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = await AuthService.getRefreshToken();
      if (!refreshToken) throw new Error('Không tìm thấy refresh token');

      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken, // hoặc tùy theo backend yêu cầu
      });

      const newToken = response.data.token; // hoặc accessToken tùy theo backend trả về
      if (!newToken) throw new Error('Token mới không tồn tại trong response');

      await AuthService.setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Lỗi khi refresh token:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      await EncryptedStorage.removeItem('token');
      await EncryptedStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Lỗi xóa token:', error);
      throw error;
    }
  },
};

export default AuthService;
