import { create } from 'zustand';
import TrackPlayer, { RepeatMode, State } from 'react-native-track-player';
import AuthService from '../services/auth';
import { toggleLike, checkLikeStatus } from '../service/apiLikeSong';
import getSongs from '../service/apiSong';

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
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  recentlyPlayed: [],
  currentTrack: null,
  currentTrackData: null,
  isSidebarVisible: false,
  isPlaying: false,
  isLiked: false,
  isShuffling: false,
  repeatMode: RepeatMode.Off,
  setRecentlyPlayed: (songs) => set({ recentlyPlayed: songs }),
  setIsLiked: (liked) => set({ isLiked: liked }),
  setCurrentTrack: (id, data) => set({ currentTrack: id, currentTrackData: data, isLiked: data?.liked || false }),
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
    const { isShuffling } = get();
    set({ isShuffling: !isShuffling });
    if (!isShuffling) {
      let queue = await TrackPlayer.getQueue();
      await TrackPlayer.reset();
      queue = queue.sort(() => Math.random() - 0.5);
      await TrackPlayer.add(queue);
      await TrackPlayer.play();
      set({ isPlaying: true });
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
      }
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  },
  seekTo: async (position) => {
    await TrackPlayer.seekTo(position);
  },
  loadSongs: async () => {
    // Implement if needed
  },
}));