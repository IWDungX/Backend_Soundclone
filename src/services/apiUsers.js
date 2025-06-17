const MINIO_BASE_URL = 'http://192.168.126.223:9000';
const API_BASE_URL = 'http://localhost:15000/api/admin/users';

// Hàm tiện ích để nối URL hoàn chỉnh
const getFullMinioUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    return `${MINIO_BASE_URL}/${cleanUrl}`;
};

// Hàm thêm URL hoàn chỉnh vào object user
const addFullUrlsToUser = (user) => ({
    ...user,
    user_avatar_url: getFullMinioUrl(user.user_avatar_url),
});

// Hàm fetch có token
const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const fetchOptions = {
        ...options,
        headers: options.body instanceof FormData ? headers : { ...headers, 'Content-Type': 'application/json' },
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            throw new Error(`Request failed with status ${response.status}`);
        }
        throw new Error(errorData.errorMessage || errorData.message || `Request failed with status ${response.status}`);
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Unexpected response format: ${response.status} - ${error.message}`);
    }
};

// Lấy danh sách người dùng
export const fetchUsers = async () => {
    try {
        const response = await fetchWithAuth(API_BASE_URL);
        console.log('API Response (fetchUsers):', response);

        if (!response || !response.success || !Array.isArray(response.data)) {
            throw new Error('Dữ liệu từ API không hợp lệ hoặc không có dữ liệu');
        }

        return response.data
            .filter(user => user && user.user_id)
            .map(addFullUrlsToUser);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        throw error;
    }
};

// Lấy thông tin người dùng theo ID
export const fetchUserById = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`);
        console.log('API Response (fetchUserById):', response);

        if (!response || !response.success || !response.data) {
            throw new Error('Không tìm thấy người dùng');
        }

        return addFullUrlsToUser(response.data);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        throw error;
    }
};

// Cập nhật role
export const updateRole = async (user_id, roleName) => {
    if (!roleName) {
        throw new Error('Role name is required');
    }

    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${user_id}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: roleName }),
        });
        console.log('API Response (updateRole):', response);

        if (!response || !response.success) {
            throw new Error(response.errorMessage || response.message || 'Cập nhật role thất bại');
        }

        return response;
    } catch (error) {
        console.error('Lỗi khi cập nhật role:', error);
        throw error;
    }
};

// Xóa người dùng
export const deleteUser = async (user_id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${user_id}`, {
            method: 'DELETE',
        });
        console.log('API Response (deleteUser):', response);

        if (!response || !response.success) {
            throw new Error(response.errorMessage || response.message || 'Xóa người dùng thất bại');
        }

        return response;
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        throw error;
    }
};