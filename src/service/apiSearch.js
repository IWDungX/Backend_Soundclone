import apiInstance from './apiInstance';
import AuthService from './auth';

const search = async (query) => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await apiInstance.get('/search', {
      token,
      params: { query },
      onTokenExpired: AuthService.refreshToken,
    });
    return response;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

const getSuggestions = async (query) => {
  try {
    const token = await AuthService.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await apiInstance.get('/search/suggestions', {
      token,
      params: { query },
      onTokenExpired: AuthService.refreshToken,
    });
    return response.suggestions;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    throw error;
  }
};

export default {
  search,
  getSuggestions,
};