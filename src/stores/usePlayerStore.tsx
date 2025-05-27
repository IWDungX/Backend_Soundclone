import { create } from 'zustand';
import TrackPlayer, { RepeatMode, State } from 'react-native-track-player';
import AuthService from '../services/auth';
import { toggleLike, checkLikeStatus } from '../service/apiLikeSong';
import getSongs from '../service/apiSong';
import Toast from 'react-native-toast-message';

type Song = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  albumCover?: string;
  duration?: string;
  lastPlayed?: string;
  liked?: boolean;
};

type PlayerState = {
  recentlyPlayed: Song[];
  currentTrack: string | null;
  currentTrackData: Song | null;
  queue: Song[];
  isSidebarVisible: boolean;
  isPlaying: boolean;
  isShuffling: boolean;
  repeatMode: RepeatMode;
  isLiked: boolean;
  setRecentlyPlayed: (songs: Song[]) => void;
  setCurrentTrack: (id: string | null, data: Song | null) => void;
  setSidebarVisible: (visible: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLiked: (liked: boolean) => void;
  toggleLike: () => Promise<void>;
  togglePlay: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  loadSongs: () => Promise<void>;
  syncLikeStatus: () => Promise<void>;
  togglePlayerLike: () => Promise<void>;
};

const debounced = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  recentlyPlayed: [],
  currentTrack: null,
  currentTrackData: null,
  queue: [], // Thêm queue vào state để theo dõi
  isSidebarVisible: false,
  isPlaying: false,
  isLiked: false,
  isShuffling: false,
  repeatMode: RepeatMode.Off,
  setRecentlyPlayed: (songs) => set({ recentlyPlayed: songs }),
  setIsLiked: (liked) => set({ isLiked: liked }),
  // Giữ nguyên setCurrentTrack như bạn yêu cầu
  setCurrentTrack: (id, data) => {
    set({ currentTrack: id, currentTrackData: data, isLiked: data?.liked || false });
    get().syncLikeStatus();
  },
  setSidebarVisible: (visible) => set({ isSidebarVisible: visible }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
        set({ isPlaying: false });
      } else {
        await TrackPlayer.play();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Error toggling play:', error);
      set({ isPlaying: false });
    }
  },
  toggleLike: async () => {
    const { currentTrackData, setIsLiked } = get();
    if (!currentTrackData?.id) return;

    try {
      const response = await toggleLike(currentTrackData.id);
      if (response.success) {
        setIsLiked(response.liked);
        set({
          currentTrackData: {
            ...currentTrackData,
            liked: response.liked,
          },
        });
      }
    } catch (error) {
      console.error('Lỗi khi gọi toggleLike:', error);
    }
  },
  toggleShuffle: async () => {
    const { isShuffling, queue } = get();
    set({ isShuffling: !isShuffling });
    if (!isShuffling && queue.length > 0) {
      const currentTrackId = get().currentTrack;
      const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
      await TrackPlayer.reset();
      await TrackPlayer.add(shuffledQueue);
      // Tìm index của bài hiện tại trong queue mới
      const newIndex = shuffledQueue.findIndex(song => song.id === currentTrackId);
      if (newIndex !== -1) {
        await TrackPlayer.skip(newIndex);
      }
      await TrackPlayer.play();
      set({ isPlaying: true, queue: shuffledQueue });
    }
  },
  toggleRepeat: async () => {
    const { repeatMode } = get();
    const modes = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    await TrackPlayer.setRepeatMode(nextMode);
    set({ repeatMode: nextMode });
  },
  skipToNext: async () => {
    try {
      await TrackPlayer.skipToNext();
      const queue = await TrackPlayer.getQueue();
      const newIndex = await TrackPlayer.getCurrentTrack();
      if (newIndex !== null && queue[newIndex]) {
        set({ currentTrack: queue[newIndex].id, currentTrackData: queue[newIndex], isPlaying: true });
        await get().syncLikeStatus();
      }
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  },
  skipToPrevious: async () => {
    try {
      await TrackPlayer.skipToPrevious();
      const queue = await TrackPlayer.getQueue();
      const newIndex = await TrackPlayer.getCurrentTrack();
      if (newIndex !== null && queue[newIndex]) {
        set({ currentTrack: queue[newIndex].id, currentTrackData: queue[newIndex], isPlaying: true });
        await get().syncLikeStatus();
      }
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  },
  seekTo: async (position) => {
    await TrackPlayer.seekTo(position);
  },
  loadSongs: async () => {
    try {
      const songs = await getSongs(); // Giả sử API trả về danh sách bài hát
      set({ queue: songs, recentlyPlayed: songs.slice(0, 5) });
      await TrackPlayer.reset();
      await TrackPlayer.add(songs);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  },

  setLikeStatusBySongId: (songId: string, liked: boolean) => {
    const { currentTrackData } = get();
    if (currentTrackData?.id === songId) {
      set({
        isLiked: liked,
        currentTrackData: {
          ...currentTrackData,
          liked: liked,
        },
      });
    }
  },

  syncLikeStatus: debounced(async () => {
    const { currentTrackData } = get();
    if (!currentTrackData?.id) return;

    try {
      const response = await checkLikeStatus(currentTrackData.id);
      if (response.success) {
        set({ isLiked: response.liked });
        set({
          currentTrackData: {
            ...currentTrackData,
            liked: response.liked,
          },
        });
      }
    } catch (error) {
      console.error('Error syncing like status:', error);
    }
  }, 500),

  togglePlayerLike: async () => {
    const { currentTrackData } = get();
    if (!currentTrackData?.id) return;

    try {
      const response = await toggleLike(currentTrackData.id);
      if (response.success) {
        const isLiked = response.liked;
        set({ isLiked });
        set({
          currentTrackData: {
            ...currentTrackData,
            liked: isLiked,
          },
        });
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: isLiked ? 'Đã thích bài hát' : 'Đã bỏ thích bài hát',
        });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error toggling like in player:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thay đổi trạng thái thích bài hát',
      });
    }
  },
}));