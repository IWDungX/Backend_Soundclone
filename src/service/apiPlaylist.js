import apiInstance from './apiInstance';
import AuthService from './auth';

// Hàm xử lý refresh token
const handleTokenExpired = async () => {
    try {
        const newToken = await AuthService.refreshToken();
        if (!newToken) {
            throw new Error('Không thể refresh token');
        }
        return newToken;
    } catch (error) {
        console.error('Không thể refresh token, đăng xuất...');
        await AuthService.logout();
        throw error;
    }
};

// Service cho các API liên quan đến playlist
const PlaylistService = {
    // Tạo playlist mới
    async createPlaylist(playlistTitle) {
        try {
            const token = await AuthService.getToken();
            if (!token) {
                throw new Error('Không có token để thực hiện yêu cầu');
            }

            const response = await apiInstance.post(
                '/playlists',
                { playlist_title: playlistTitle },
                {
                    token,
                    onTokenExpired: handleTokenExpired,
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Tạo playlist thất bại');
            }

            return response.playlist;
        } catch (error) {
            console.error('Lỗi khi tạo playlist:', error.message);
            throw error;
        }
    },

    // Thêm bài hát vào playlist
    async addSongToPlaylist(playlistId, songId) {
        try {
            const token = await AuthService.getToken();
            if (!token) {
                throw new Error('Không có token để thực hiện yêu cầu');
            }

            const response = await apiInstance.post(
                `/playlists/${playlistId}/songs`,
                { songId },
                {
                    token,
                    onTokenExpired: handleTokenExpired,
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Thêm bài hát thất bại');
            }

            return response.playlist;
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào playlist:', error.message);
            throw error;
        }
    },

    // Lấy danh sách tất cả playlist của người dùng
    async getUserPlaylists() {
        try {
            const token = await AuthService.getToken();
            if (!token) {
                throw new Error('Không có token để thực hiện yêu cầu');
            }

            const response = await apiInstance.get(
                '/playlists',
                {
                    token,
                    onTokenExpired: handleTokenExpired,
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Lấy danh sách playlist thất bại');
            }

            return response.playlists;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách playlist:', error.message);
            throw error;
        }
    },
};

export default PlaylistService;