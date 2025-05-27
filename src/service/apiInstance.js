import axios from 'axios';

//const BASE_URL = 'http://192.168.22.72:15000/api';
const BASE_URL = 'http://192.168.1.205:15000/api';

const apiInstance = {
  async get(endpoint, config = {}) {
    return this.request(endpoint, 'GET', null, config);
  },

  async post(endpoint, data, config = {}) {
    return this.request(endpoint, 'POST', data, config);
  },

  async put(endpoint, data, config = {}) {
    return this.request(endpoint, 'PUT', data, config);
  },

  async delete(endpoint, config = {}) {
    return this.request(endpoint, 'DELETE', {}, config);
  },

  async request(endpoint, method, data = null, config = {}) {
    let isRetrying = false;
    const token = config.token || null; // Token is passed via config
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers,
    };

    const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    console.log('Sending API request:', { method, url, data, headers });

    try {
      const response = await axios({ method, url, headers, data, ...config });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error calling API ${method} ${url}:`, {
        message: error.message,
        code: error.code,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : null,
      });

      if (error.response?.status === 401 && !config._retry && !config.skipAuth) {
        config._retry = true;
        try {
          console.log('Token expired, calling onTokenExpired callback');
          if (!config.onTokenExpired) throw new Error('No onTokenExpired callback provided');
          const newToken = await config.onTokenExpired();
          if (!newToken) throw new Error('Không thể refresh token: Token mới không hợp lệ');

          const newHeaders = {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          };

          console.log('Retrying with new token:', { method, url });

          const retryResponse = await axios({
            method,
            url,
            data,
            ...config,
            headers: newHeaders,
          });

          console.log('Retry response:', retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError.message);
          throw error;
        }
      }
      throw error;
    }
  },
};

export default apiInstance;