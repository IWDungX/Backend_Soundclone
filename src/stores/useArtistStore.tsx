import { create } from 'zustand';
import apiArtist from '../service/apiArtist';
import { getFullMinioUrl } from '../service/minioUrl';

interface Artist {
  artist_id: string;
  artist_name: string;
  bio: string;
  image_url: string;
}

interface Song {
  id: string;
  title: string;
  artistId: string;
  artist: string;
  artwork: string;
  url: string;
  album: string;
  releaseYear: string;
  duration: string;
  plays: string;
  liked: boolean;
}

const useArtistStore = create((set, get) => ({
  artists: [] as Artist[],
  followedArtists: [] as Artist[],
  artistSongs: [] as Song[],
  isLoading: false,
  error: null as string | null,

  fetchArtists: async () => {
    set({ isLoading: true, error: null });
    try {
      const artists = await apiArtist.getArtists();
      console.log('useArtistStore.fetchArtists: Artists at', new Date().toLocaleTimeString(), ':', JSON.stringify(artists, null, 2));
      set({ artists, isLoading: false });
    } catch (error: any) {
      console.error('useArtistStore.fetchArtists: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to fetch artists', isLoading: false });
    }
  },

  fetchArtistById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const artist = await apiArtist.getArtistById(id);
      console.log('useArtistStore.fetchArtistById: Artist at', new Date().toLocaleTimeString(), ':', JSON.stringify(artist, null, 2));
      set((state) => ({
        artists: state.artists.some((a) => a.artist_id === artist.artist_id)
          ? state.artists.map((a) => (a.artist_id === artist.artist_id ? artist : a))
          : [...state.artists, artist],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('useArtistStore.fetchArtistById: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to fetch artist', isLoading: false });
    }
  },

  fetchArtistSongs: async (artistId: string) => {
    set({ isLoading: true, error: null });
    try {
      const songsResponse = await apiArtist.getArtistSongs(artistId);
      console.log('useArtistStore.fetchArtistSongs: Songs Response at', new Date().toLocaleTimeString(), ':', JSON.stringify(songsResponse, null, 2));

      if (!Array.isArray(songsResponse)) {
        throw new Error('Dữ liệu bài hát từ API không phải là mảng');
      }

      const formattedSongs = songsResponse
        .map((song) => {
          if (!song.song_audio_url) {
            console.warn(`Bài hát ${song.song_title} thiếu song_audio_url`);
            return null;
          }
          if (!song.artist_id || !song.Artist?.artist_name) {
            console.warn(`Bài hát ${song.song_title} thiếu thông tin nghệ sĩ hoặc artist_id`);
            return null;
          }

          const songUrl = getFullMinioUrl(song.song_audio_url);
          if (!songUrl) {
            console.warn(`Bài hát ${song.song_title} có song_audio_url không hợp lệ`);
            return null;
          }

          const maxDuration = 900;
          const safeDuration = Math.min(song.song_duration || 0, maxDuration);
          const minutes = Math.floor(safeDuration / 60);
          const seconds = Math.floor(safeDuration % 60);
          const duration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

          const artworkUrl = getFullMinioUrl(song.song_image_url) || 'https://via.placeholder.com/150';

          return {
            id: song.song_id,
            artistId: song.artist_id,
            title: song.song_title,
            artist: song.Artist.artist_name,
            artwork: artworkUrl,
            url: songUrl,
            album: song.album_name || 'Unknown Album',
            releaseYear: song.song_createAt
              ? new Date(song.song_createAt).getFullYear().toString()
              : 'Unknown',
            duration,
            plays: song.play_count ? `${(song.play_count / 1000000).toFixed(1)}M` : '0',
            liked: song.liked || false,
          };
        })
        .filter((song) => song !== null);

      if (formattedSongs.length === 0) {
        console.warn('Không có bài hát hợp lệ sau khi xử lý');
        set({ artistSongs: [], isLoading: false });
        return;
      }

      set({ artistSongs: formattedSongs, isLoading: false });
    } catch (error: any) {
      console.error('useArtistStore.fetchArtistSongs: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to fetch songs', isLoading: false, artistSongs: [] });
    }
  },

  followArtist: async (artistId: string) => {
    set({ isLoading: true, error: null });
    try {
      const followData = await apiArtist.followArtist(artistId);
      console.log('useArtistStore.followArtist: Follow data at', new Date().toLocaleTimeString(), ':', JSON.stringify(followData, null, 2));

      const artist = await apiArtist.getArtistById(artistId);
      set((state) => ({
        followedArtists: [...state.followedArtists, artist],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('useArtistStore.followArtist: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to follow artist', isLoading: false });
    }
  },

  unfollowArtist: async (artistId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiArtist.unfollowArtist(artistId);
      console.log('useArtistStore.unfollowArtist: Success at', new Date().toLocaleTimeString());
      set((state) => ({
        followedArtists: state.followedArtists.filter((artist) => artist.artist_id !== artistId),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('useArtistStore.unfollowArtist: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to unfollow artist', isLoading: false });
    }
  },

  fetchFollowedArtists: async () => {
    set({ isLoading: true, error: null });
    try {
      const followedArtists = await apiArtist.getFollowedArtists();
      console.log('useArtistStore.fetchFollowedArtists: Followed artists at', new Date().toLocaleTimeString(), ':', JSON.stringify(followedArtists, null, 2));
      set({ followedArtists, isLoading: false });
    } catch (error: any) {
      console.error('useArtistStore.fetchFollowedArtists: Error at', new Date().toLocaleTimeString(), ':', error.message, error.stack);
      set({ error: error.message || 'Failed to fetch followed artists', isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useArtistStore;