const MINIO_BASE_URL ='http://192.168.126.223:9000';
const API_BASE_URL = 'http://localhost:15000/api/admin/songs';

// Hàm tiện ích để nối URL hoàn chỉnh
const getFullMinioUrl = (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    const cleanUrl = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    return `${MINIO_BASE_URL}/${cleanUrl}`;
};

// Hàm thêm URL hoàn chỉnh vào object bài hát
const addFullUrlsToSong = (song) => ({
    ...song,
    song_audio_url: getFullMinioUrl(song.song_audio_url),
    song_image_url: getFullMinioUrl(song.song_image_url),
});

const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    const response = await fetch(url, { ...options, headers });

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('Unexpected response format');
    }

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
};

export const fetchSongs = async () => {
    const songs = await fetchWithAuth(API_BASE_URL);
    // Áp dụng getFullMinioUrl cho từng bài hát
    return songs.map(addFullUrlsToSong);
};

export const fetchArtists = async () => fetchWithAuth(`${API_BASE_URL}/artists`);

export const fetchGenres = async () => fetchWithAuth(`${API_BASE_URL}/genres`);

export const deleteSong = async (id) => fetchWithAuth(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

const createSongFormData = (songData) => {
    const formData = new FormData();
    if (songData.file) formData.append('song', songData.file);
    if (songData.image) formData.append('image', songData.image);
    formData.append('song_title', songData.title);
    formData.append('artist_id', songData.artist_id);
    formData.append('genre_id', songData.genre_id);
    formData.append('song_duration', songData.duration);
    return formData;
};

export const uploadSong = async (songData) => {
    const result = await fetchWithAuth(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: createSongFormData(songData),
    });
    // Áp dụng getFullMinioUrl cho bài hát vừa upload
    return {
        ...result,
        song: addFullUrlsToSong(result.song),
    };
};

export const updateSong = async (id, songData) => {
    const result = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        body: createSongFormData(songData),
    });
    // Áp dụng getFullMinioUrl cho bài hát vừa cập nhật
    return {
        ...result,
        song: addFullUrlsToSong(result.song),
    };
};