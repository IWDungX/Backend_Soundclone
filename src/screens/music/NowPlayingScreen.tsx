import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, {
  useProgress,
  Event,
  useTrackPlayerEvents,
  RepeatMode,
  State,
} from 'react-native-track-player';
import {
  ArrowDown2,
  More,
  Previous,
  Pause,
  Play,
  Next,
  Shuffle,
  Repeat,
  RepeateOne,
} from 'iconsax-react-nativejs';
import { usePlayerStore } from '../../stores/usePlayerStore';
import LikeButton from '../../components/LikeButton';
import MoreMenu from '../../components/MoreMenu';

const NowPlayingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { songs: initialSongs, initialTrackIndex } = route.params || {};

  const { position, duration } = useProgress(500);
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const {
    currentTrackData,
    isPlaying,
    isShuffling,
    repeatMode,
    queue,
    setCurrentTrack,
    togglePlay,
    toggleShuffle,
    toggleRepeat,
    skipToNext,
    skipToPrevious,
    seekTo,
    setQueue,
    setIsPlaying,
  } = usePlayerStore();

  const didSetup = useRef(false);
  const lastTrack = useRef<number | null>(null);

  // Đồng bộ trạng thái khi màn hình được focus
  useEffect(() => {
    if (didSetup.current) return;
    didSetup.current = true;

    const setupPlayer = async () => {
      try {
        if (initialSongs && initialSongs.length > 0) {
          const currentQueue = await TrackPlayer.getQueue();
          const currentTrackId = currentTrackData?.id;
          const selectedSong = initialSongs[initialTrackIndex];

          if (!selectedSong) return;

          const songWithArtistId = {
            ...selectedSong,
            id: selectedSong.id,
            artistId: selectedSong.artistId,
          };

          const isSameTrack = currentTrackId === selectedSong.id;
          const isQueueMatching =
            currentQueue.length === initialSongs.length &&
            currentQueue.every((track, index) => track.id === initialSongs[index].id);

          if (isSameTrack) {
            const state = await TrackPlayer.getState();
            setIsPlaying(state === State.Playing);
            if (state === State.Paused) await TrackPlayer.play();
            setCurrentTrack(selectedSong.id, songWithArtistId);
            return;
          }

          if (!isQueueMatching) {
            await TrackPlayer.reset();
            await TrackPlayer.add(
              initialSongs.map(song => ({
                id: song.id,
                url: song.url,
                title: song.title,
                artist: song.artist,
                artwork: song.artwork,
              }))
            );
            setQueue(initialSongs);
          }

          await TrackPlayer.skip(initialTrackIndex);
          const state = await TrackPlayer.getState();
          if (state !== State.Playing) await TrackPlayer.play();
          setCurrentTrack(selectedSong.id, songWithArtistId);
          setIsPlaying(true);
        } else if (queue.length > 0) {
          const currentTrackIndex = await TrackPlayer.getCurrentTrack();
          const currentTrack = queue[currentTrackIndex];
          if (currentTrack) {
            setCurrentTrack(currentTrack.id, currentTrack);
            const state = await TrackPlayer.getState();
            setIsPlaying(state === State.Playing);
          }
        }
      } catch (err) {
        console.error('Error in setupPlayer:', err);
      }
    };

    setupPlayer();
  }, [
    initialSongs,
    initialTrackIndex,
    currentTrackData?.id,
    queue.length,
    setCurrentTrack,
    setIsPlaying,
    setQueue,
  ]);


  useTrackPlayerEvents(
    [
      Event.PlaybackState,
      Event.PlaybackTrackChanged,
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteNext,
      Event.RemotePrevious,
    ],
    async (event) => {
      if (event.type === Event.PlaybackState) {
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing);
      } else if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
        if (event.nextTrack === lastTrack.current) return;
        lastTrack.current = event.nextTrack;

        const queue = await TrackPlayer.getQueue();
        if (queue[event.nextTrack]) {
          const matchingSong = initialSongs?.find(song => song.id === queue[event.nextTrack].id) || queue[event.nextTrack];
          const songWithArtistId = {
            ...matchingSong,
            id: matchingSong.id,
            artistId: matchingSong.artistId, // Đảm bảo artistId
          };
          setCurrentTrack(queue[event.nextTrack].id, songWithArtistId);
        }
      } else if (event.type === Event.RemotePlay) {
        await TrackPlayer.play();
        setIsPlaying(true);
      } else if (event.type === Event.RemotePause) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else if (event.type === Event.RemoteNext) {
        await skipToNext();
      } else if (event.type === Event.RemotePrevious) {
        await skipToPrevious();
      }
    }
  );

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrackData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Đang tải bài hát...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowDown2 color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐANG PHÁT</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsMoreMenuVisible(true)}
        >
          <More color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: currentTrackData.artwork || 'https://placehold.co/300x300' }}
          style={styles.artwork}
        />
      </View>

      <View style={styles.trackInfoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrackData.title}
          </Text>
          <LikeButton />
        </View>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrackData.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          value={position}
          minimumValue={0}
          maximumValue={duration || 1}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
          thumbTintColor="#fff"
          disabled={duration === 0}
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleShuffle}
          activeOpacity={0.7}
        >
          <Shuffle
            size="30"
            color={isShuffling ? '#1DB954' : '#ffffff'}
            variant="Bold"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={skipToPrevious}>
          <Previous color="#ffffff" size={30} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlay}>
          {isPlaying ? (
            <Pause size="40" color="#fff" />
          ) : (
            <Play size="40" color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={skipToNext}>
          <Next color="#ffffff" size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleRepeat}
          activeOpacity={0.7}
        >
          {repeatMode === RepeatMode.Track ? (
            <RepeateOne size="30" color="#1DB954" variant="Bold" />
          ) : (
            <Repeat
              size="30"
              color={repeatMode === RepeatMode.Queue ? '#1DB954' : '#ffffff'}
              variant="Bold"
            />
          )}
        </TouchableOpacity>
      </View>

      <MoreMenu
        visible={isMoreMenuVisible}
        onClose={() => setIsMoreMenuVisible(false)}
        song={{ ...currentTrackData, song_id: currentTrackData.id, artistId: currentTrackData.artistId || initialSongs?.[initialTrackIndex]?.artistId }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  artworkContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 30,
  },
  artwork: {
    width: '80%',
    height: 300,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  trackInfoContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginRight: 16,
  },
  artist: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  controlButton: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
});

export default NowPlayingScreen;