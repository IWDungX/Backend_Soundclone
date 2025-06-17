import apiInstance from './apiInstance';
import AuthService from './auth';

// Lấy thông tin người dùng
const getUser = async () => {
  try {
    const token = await AuthService.getToken();
    console.log('apiUser.getUser: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get('/users/me', {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiUser.getUser: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !response.data) {
      console.error('apiUser.getUser: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ hoặc không chứa dữ liệu');
    }

    return response.data;
  } catch (error) {
    console.error('apiUser.getUser: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Cập nhật thông tin người dùng (gửi JSON thay vì FormData)
const updateUser = async (user_name) => {
  try {
    if (!user_name || typeof user_name !== 'string' || user_name.trim() === '') {
      throw new Error('Tên người dùng không hợp lệ');
    }

    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.put('/users/me', { user_name }, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    if (!response?.success || !response.data) {
      console.error('apiUser.updateUser: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response.data;
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error.message, error.response?.data);
    throw error;
  }
};

// Lấy lịch sử phát nhạc theo khoảng ngày (giữ nguyên mã gốc)
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

// Tạo một bản ghi lịch sử phát nhạc (giữ nguyên mã gốc)
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

// Xóa một bản ghi lịch sử phát nhạc (giữ nguyên mã gốc)
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