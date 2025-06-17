import EncryptedStorage from 'react-native-encrypted-storage';
import axios from 'axios';

const BASE_URL = 'http://192.168.126.223:15000/api';

const AuthService = {
  getToken: async () => {
    try {
      const token = await EncryptedStorage.getItem('token');
      console.log('AuthService.getToken: Retrieved token at', new Date().toISOString(), ':', token ? 'Valid' : 'Null');
      return token;
    } catch (error) {
      console.error('AuthService.getToken: Error retrieving token at', new Date().toISOString(), ':', error.message);
      return null;
    }
  },

  getRefreshToken: async () => {
    try {
      const refreshToken = await EncryptedStorage.getItem('refreshToken');
      console.log('AuthService.getRefreshToken: Retrieved refresh token at', new Date().toISOString(), ':', refreshToken ? 'Valid' : 'Null');
      return refreshToken;
    } catch (error) {
      console.error('AuthService.getRefreshToken: Error retrieving refresh token at', new Date().toISOString(), ':', error.message);
      return null;
    }
  },

  setToken: async (token) => {
    try {
      await EncryptedStorage.setItem('token', token);
      console.log('AuthService.setToken: Token saved successfully at', new Date().toISOString());
    } catch (error) {
      console.error('AuthService.setToken: Error saving token at', new Date().toISOString(), ':', error.message);
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = await AuthService.getRefreshToken();
      if (!refreshToken) {
        console.log('AuthService.refreshToken: No refresh token found at', new Date().toISOString());
        throw new Error('No refresh token found');
      }

      console.log('AuthService.refreshToken: Sending refresh request to', `${BASE_URL}/auth/refresh`, 'at', new Date().toISOString());
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

      console.log('AuthService.refreshToken: Response at', new Date().toISOString(), ':', JSON.stringify(response.data, null, 2));
      const newToken = response.data.token || response.data.accessToken;
      if (!newToken) {
        console.error('AuthService.refreshToken: No new token in response at', new Date().toISOString());
        throw new Error('No new token in response');
      }

      await AuthService.setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('AuthService.refreshToken: Error at', new Date().toISOString(), ':', error.message, error.response?.data);
      throw error; // Ném lỗi để `apiInstance` xử lý
    }
  },

  logout: async () => {
    try {
      await EncryptedStorage.removeItem('token');
      await EncryptedStorage.removeItem('refreshToken');
      console.log('AuthService.logout: Tokens removed successfully at', new Date().toISOString());
    } catch (error) {
      console.error('AuthService.logout: Error during logout at', new Date().toISOString(), ':', error.message);
      throw error;
    }
  },
};

export default AuthService;