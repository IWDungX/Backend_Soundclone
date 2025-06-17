import axios from 'axios';

const BASE_URL = 'http://192.168.126.223:15000/api';

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
    const token = config.token || null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...config.headers,
    };

    const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    console.log('apiInstance.request: Sending request at', new Date().toISOString(), { method, url, data, headers });

    try {
      const response = await axios({ method, url, headers, data, ...config });
      console.log('apiInstance.request: Response at', new Date().toISOString(), response.data);
      return response.data;
    } catch (error) {
      console.error(`apiInstance.request: Error calling API ${method} ${url} at ${new Date().toISOString()}:`, {
        message: error.message,
        code: error.code,
        response: error.response
          ? {
              status: error.response.status,
              data: error.response.data,
            }
          : null,
      });

      if (error.response?.status === 401 && !isRetrying && config.onTokenExpired) {
        isRetrying = true;
        try {
          console.log('apiInstance.request: Token expired, attempting to refresh token');
          const newToken = await config.onTokenExpired();
          if (!newToken) throw new Error('Refresh token failed: No new token');

          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          console.log('apiInstance.request: Retrying with new token:', { method, url });

          const retryResponse = await axios({
            method,
            url,
            data,
            headers: newHeaders,
            ...config,
          });

          console.log('apiInstance.request: Retry response:', retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('apiInstance.request: Failed to refresh token:', refreshError.message);
          throw error; // Ném lại lỗi gốc
        }
      }
      throw error;
    }
  },
};

export default apiInstance;