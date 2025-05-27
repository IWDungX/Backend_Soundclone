import apiInstance from './apiInstance';
import AuthService from './auth';

// Lấy thông tin người dùng
const getUser = async () => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get('/users/me', {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error.message, error.response?.data);
    throw error;
  }
};

// Cập nhật thông tin người dùng (dùng FormData)
const updateUser = async (formData) => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.put('/users/me', formData, {
      token, // Token được gửi qua config để apiInstance xử lý
      headers: {
        'Content-Type': 'multipart/form-data', // FormData yêu cầu Content-Type này
      },
      onTokenExpired: AuthService.refreshToken,
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error.message, error.response?.data);
    throw error;
  }
};

// Lấy lịch sử phát nhạc theo khoảng ngày
const getHistoryByDateRange = async () => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    // Thêm query params để gửi startDate và endDate
    const response = await apiInstance.get(`/history/date`, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử theo ngày:', error.message, error.response?.data);
    throw error;
  }
};

// Tạo một bản ghi lịch sử phát nhạc
const createHistory = async (songId) => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.post(
      '/history',
      { song_id: songId },
      {
        token,
        onTokenExpired: AuthService.refreshToken,
      }
    );

    if (!response || typeof response !== 'object') {
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('Lỗi khi tạo lịch sử:', error.message, error.response?.data);
    throw error;
  }
};

// Xóa một bản ghi lịch sử phát nhạc
const deleteHistory = async (historyId) => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.delete(`/history/${historyId}`, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử:', error.message, error.response?.data);
    throw error;
  }
};

export default {
  getUser,
  updateUser,
  getHistoryByDateRange,
  createHistory,
  deleteHistory,
};