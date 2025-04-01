const API_BASE_URL = "http://localhost:15000/api/artists";

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

export const fetchArtists = async () => fetchWithAuth(API_BASE_URL);
export const fetchArtistById = async (id) => fetchWithAuth(`${API_BASE_URL}/${id}`);
export const deleteArtist = async (id) => fetchWithAuth(`${API_BASE_URL}/${id}`, { method: "DELETE" });

const createArtistFormData = (artistData) => {
    const formData = new FormData();
    if (artistData.image) formData.append("image", artistData.image);
    formData.append("artist_name", artistData.name);
    formData.append("bio", artistData.bio);
    return formData;
};

export const uploadArtist = async (artistData) => {
    return fetchWithAuth('{API_BASE_URL}/${upload}', {
        method: "POST",
        body: createArtistFormData(artistData),
    });
};

export const updateArtist = async (id, artistData) => {
    return fetchWithAuth(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: createArtistFormData(artistData),
    });
};
