const API_BASE_URL = "http://localhost:15000/api/songs";

const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        ...options.headers,
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
    };

    const response = await fetch(url, { ...options, headers });

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("Unexpected response format");
    }

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
};

export const fetchSongs = async () => fetchWithAuth(API_BASE_URL);
export const fetchArtists = async () => fetchWithAuth(`${API_BASE_URL}/artists`);
export const fetchGenres = async () => fetchWithAuth(`${API_BASE_URL}/genres`);
export const deleteSong = async (id) => fetchWithAuth(`${API_BASE_URL}/${id}`, { method: "DELETE" });

const createSongFormData = (songData) => {
    const formData = new FormData();
    if (songData.file) formData.append("song", songData.file);
    if (songData.image) formData.append("image", songData.image);
    formData.append("song_title", songData.title);
    formData.append("artist_id", songData.artist_id);
    formData.append("genre_id", songData.genre_id);
    formData.append("song_duration", songData.duration);
    return formData;
};

export const uploadSong = async (songData) => {
    return fetchWithAuth(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: createSongFormData(songData),
    });
};

export const updateSong = async (id, songData) => {
    return fetchWithAuth(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: createSongFormData(songData),
    });
};
