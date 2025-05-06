import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.214.72:15000/api';

const AuthService = {
  async getToken() {
    try {
      const token = await EncryptedStorage.getItem('token');
      console.log('Lấy token:', token ? 'Có token' : 'Không có token');
      return token;
    } catch (error) {
      console.error('Lỗi lấy token:', error);
      return null;
    }
  },
  async refreshToken() {
    try {
      const refreshToken = await EncryptedStorage.getItem('refreshToken');
      console.log('Lấy refreshToken:', refreshToken ? 'Có refreshToken' : 'Không có refreshToken');
      if (!refreshToken) {
        throw new Error('Không có refresh token');
      }
      const response = await axios.post(`${BASE_URL}/login/refresh`, { refreshToken });
      if (response.data.token) {
        await EncryptedStorage.setItem('token', response.data.token);
        console.log('Lưu token mới thành công');
        return response.data.token;
      }
      throw new Error('Không nhận được token mới');
    } catch (error) {
      console.error('Lỗi refresh token:', error.message);
      throw error;
    }
  },
  async logout() {
    try {
      await EncryptedStorage.removeItem('token');
      await EncryptedStorage.removeItem('refreshToken');
      console.log('Xóa token thành công');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      throw error;
    }
  },
};

export default AuthService;