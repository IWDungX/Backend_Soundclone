const MINIO_BASE_URL = 'http://192.168.126.223:9000';
const API_BASE_URL = 'http://localhost:15000/api/admin/artists';

// Hàm tiện ích để nối URL hoàn chỉnh
const getFullMinioUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    return `${MINIO_BASE_URL}/${cleanUrl}`;
};

// Hàm thêm URL đầy đủ vào object artist
const addFullUrlsToArtist = (artist) => ({
    ...artist,
    image_url: getFullMinioUrl(artist.image_url),
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
        throw new Error(errorData.errorMessage || `Request failed with status ${response.status}`);
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error(`Unexpected response format: ${response.status} - ${error.message}`);
    }
};

// Lấy danh sách nghệ sĩ
export const fetchArtists = async () => {
    try {
        const response = await fetchWithAuth(API_BASE_URL);
        if (!response || !response.success || !Array.isArray(response.data)) {
            throw new Error('Dữ liệu từ API không hợp lệ hoặc không có dữ liệu');
        }
        return response.data
            .filter(artist => artist && artist.artist_id) // Lọc dữ liệu không hợp lệ
            .map(addFullUrlsToArtist); // Gắn image_url đầy đủ nếu có
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nghệ sĩ:', error);
        throw error;
    }
};

// Lấy thông tin nghệ sĩ theo ID
export const fetchArtistById = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`);
        if (!response || !response.success || !response.data) {
            throw new Error('Không tìm thấy nghệ sĩ');
        }
        return addFullUrlsToArtist(response.data);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin nghệ sĩ:', error);
        throw error;
    }
};

// Xóa nghệ sĩ
export const deleteArtist = async (id) => {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response || !response.success) {
            throw new Error('Xóa nghệ sĩ thất bại');
        }
        return response;
    } catch (error) {
        console.error('Lỗi khi xóa nghệ sĩ:', error);
        throw error;
    }
};

// Tạo form data khi upload
const createArtistFormData = (artistData) => {
    const formData = new FormData();
    if (artistData.image_url) formData.append('image', artistData.image_url);
    formData.append('artist_name', artistData.artist_name || artistData.name || '');
    formData.append('bio', artistData.bio || '');
    return formData;
};

// Thêm nghệ sĩ mới
export const uploadArtist = async (artistData) => {
    try {
        const result = await fetchWithAuth(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: createArtistFormData(artistData),
        });

        if (!result || !result.success || !result.data) {
            throw new Error('Thêm nghệ sĩ thất bại');
        }

        return {
            ...result,
            data: addFullUrlsToArtist(result.data),
        };
    } catch (error) {
        console.error('Lỗi khi thêm nghệ sĩ:', error);
        throw error;
    }
};

// Cập nhật nghệ sĩ
export const updateArtist = async (artist_id, artistData) => {
    try {
        const result = await fetchWithAuth(`${API_BASE_URL}/${artist_id}`, {
            method: 'PUT',
            body: createArtistFormData(artistData),
        });

        if (!result || !result.success || !result.data) {
            throw new Error('Cập nhật nghệ sĩ thất bại');
        }

        return {
            ...result,
            data: addFullUrlsToArtist(result.data),
        };
    } catch (error) {
        console.error('Lỗi khi cập nhật nghệ sĩ:', error);
        throw error;
    }
};