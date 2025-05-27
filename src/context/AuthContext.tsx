import React, { createContext, useState, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import AuthService from '../service/auth';
import apiInstance from '../service/apiInstance';

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: async (email, password) => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AuthService.getToken();
        if (token) {
          console.log('Token lấy ra:', token);
          const response = await apiInstance.get('/verify-token', {
            token,
            onTokenExpired: AuthService.refreshToken,
          });

          if (response.success) {
            const userData = await EncryptedStorage.getItem('userData');
            setIsAuthenticated(true);
            setUser(userData ? JSON.parse(userData) : null);
            console.log('Auth status: Đã đăng nhập, user:', userData);
          } else {
            await AuthService.logout();
            console.log('Token không hợp lệ, đã xóa:', response.message || 'Không có thông báo lỗi');
          }
        } else {
          console.log('Auth status: Chưa đăng nhập');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
        await AuthService.logout(); // Đảm bảo xóa trạng thái không hợp lệ
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await apiInstance.post('/login', {
        user_email: email,
        user_password: password,
      }, {
        onTokenExpired: AuthService.refreshToken,
      });

      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      const { token, refreshToken, user } = response;
      console.log('Token sau khi đăng nhập:', token);
      await EncryptedStorage.setItem('token', token);
      await EncryptedStorage.setItem('refreshToken', refreshToken);
      await EncryptedStorage.setItem('userData', JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);
      console.log('Đăng nhập thành công:', user);
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      console.log('Đăng xuất thành công');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);