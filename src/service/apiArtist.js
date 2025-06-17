import apiInstance from './apiInstance';
import AuthService from './auth';

// Validation UUID
const isValidUUID = (id: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

// Lấy danh sách tất cả nghệ sĩ
const getArtists = async () => {
  try {
    const token = await AuthService.getToken();
    console.log('apiArtist.getArtists: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get('/artist', {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiArtist.getArtists: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !Array.isArray(response.data)) {
      console.error('apiArtist.getArtists: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ hoặc không chứa danh sách nghệ sĩ');
    }

    return response.data;
  } catch (error) {
    console.error('apiArtist.getArtists: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Lấy thông tin chi tiết của một nghệ sĩ theo ID
const getArtistById = async (id: string) => {
  try {
    if (!id || !isValidUUID(id)) {
      throw new Error('ID nghệ sĩ không hợp lệ');
    }

    const token = await AuthService.getToken();
    console.log('apiArtist.getArtistById: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get(`/artist/${id}`, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiArtist.getArtistById: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !response.data) {
      console.error('apiArtist.getArtistById: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ hoặc không chứa thông tin nghệ sĩ');
    }

    return response.data;
  } catch (error) {
    console.error('apiArtist.getArtistById: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Lấy danh sách bài hát của nghệ sĩ theo ID
const getArtistSongs = async (id: string) => {
  try {
    if (!id || !isValidUUID(id)) {
      throw new Error('ID nghệ sĩ không hợp lệ');
    }

    const token = await AuthService.getToken();
    console.log('apiArtist.getArtistSongs: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get(`/artist/${id}/songs`, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiArtist.getArtistSongs: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !Array.isArray(response.data)) {
      console.error('apiArtist.getArtistSongs: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ hoặc không chứa danh sách bài hát');
    }

    return response.data;
  } catch (error) {
    console.error('apiArtist.getArtistSongs: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Theo dõi nghệ sĩ
const followArtist = async (artistId: string) => {
  try {
    if (!artistId || !isValidUUID(artistId)) {
      throw new Error('ID nghệ sĩ không hợp lệ');
    }

    const token = await AuthService.getToken();
    console.log('apiArtist.followArtist: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.post(
      '/users/me/follow-artists',
      { artist_id: artistId },
      {
        token,
        onTokenExpired: AuthService.refreshToken,
      }
    );

    console.log('apiArtist.followArtist: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !response.data) {
      console.error('apiArtist.followArtist: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response.data;
  } catch (error) {
    console.error('apiArtist.followArtist: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Bỏ theo dõi nghệ sĩ
const unfollowArtist = async (artistId: string) => {
  try {
    if (!artistId || !isValidUUID(id)) {
      throw new Error('ID nghệ sĩ không hợp lệ');
    }

    const token = await AuthService.getToken();
    console.log('apiArtist.unfollowArtist: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.delete(`/users/me/follow-artists/${artistId}`, {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiArtist.unfollowArtist: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success) {
      console.error('apiArtist.unfollowArtist: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ');
    }

    return response;
  } catch (error) {
    console.error('apiArtist.unfollowArtist: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

// Lấy danh sách nghệ sĩ đang theo dõi
const getFollowedArtists = async () => {
  try {
    const token = await AuthService.getToken();
    console.log('apiArtist.getFollowedArtists: Token at', new Date().toLocaleTimeString(), ':', token ? 'Valid' : 'Null');
    if (!token) {
      throw new Error('Không tìm thấy token');
    }

    const response = await apiInstance.get('/users/me/follow-artists', {
      token,
      onTokenExpired: AuthService.refreshToken,
    });

    console.log('apiArtist.getFollowedArtists: Raw response at', new Date().toLocaleTimeString(), ':', JSON.stringify(response, null, 2));
    if (!response?.success || !Array.isArray(response.data)) {
      console.error('apiArtist.getFollowedArtists: Invalid response structure:', response);
      throw new Error('Phản hồi từ server không hợp lệ hoặc không chứa danh sách nghệ sĩ');
    }

    return response.data;
  } catch (error) {
    console.error('apiArtist.getFollowedArtists: Error at', new Date().toLocaleTimeString(), ':', error.message, 'Response:', error.response?.data);
    throw error;
  }
};

export default {
  getArtists,
  getArtistById,
  getArtistSongs,
  followArtist,
  unfollowArtist,
  getFollowedArtists,
};