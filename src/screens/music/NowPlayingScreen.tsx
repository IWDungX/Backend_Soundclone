import React, { useState, useEffect } from 'react';
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
import TrackPlayer, { usePlaybackState, State, useProgress, useTrackPlayerEvents, Event, RepeatMode } from 'react-native-track-player';
import {ArrowDown2, More, Previous, Pause, Play, Next, Shuffle, Repeat, RepeatOne} from 'iconsax-react-nativejs';
import { useRepeatMode } from '../../hooks/useRepeatMode';

const REPEAT_MODES = {
  OFF: 'off',
  TRACK: 'track',
  QUEUE: 'queue',
};

const RepeatOrder = [REPEAT_MODES.OFF, REPEAT_MODES.TRACK, REPEAT_MODES.QUEUE];

const NowPlayingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { songs, initialTrackIndex } = route.params as {
      songs: Array<{
        id: string;
        url: string;
        title: string;
        artist: string;
        artwork: string;
      }>;
      initialTrackIndex: number;
  };
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(500); // Cập nhật mỗi 500ms
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(songs[initialTrackIndex]);
  const [isShuffling, setIsShuffling] = useState(false);
  const { repeatMode, changeRepeatMode } = useRepeatMode();

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
   if (event.type === Event.PlaybackState) {
     const state = await TrackPlayer.getState();
     console.log('Playback state changed:', state);
     setIsPlaying(state === State.Playing);
   }
  });

  useEffect(() => {
      console.log('Song từ route params:', songs);
      console.log('Current track:', currentTrack);
    }, [songs, currentTrack]);

  useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteNext, Event.RemotePrevious], async (event) => {
      if (event.type === Event.RemotePlay) {
        await TrackPlayer.play();
        setIsPlaying(true);
      } else if (event.type === Event.RemotePause) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else if (event.type === Event.RemoteNext) {
        await nextTrack();
      } else if (event.type === Event.RemotePrevious) {
        await previousTrack();
      }
  });

  useEffect(() => {
      const initQueue = async () => {
        await TrackPlayer.reset();
        await TrackPlayer.add(songs);
        await TrackPlayer.skip(initialTrackIndex);
        await TrackPlayer.play();
      };
      initQueue();
    }, [songs, initialTrackIndex]);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
      if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
        const queue = await TrackPlayer.getQueue();
        setCurrentTrack(queue[event.nextTrack]);
      }
  });


  // Hàm play/pause
  const togglePlay = async () => {
    console.log('Toggle play pressed, current state:', playbackState);
    try {
      const state = await TrackPlayer.getState();
      console.log('Trạng thái TrackPlayer trước khi toggle:', state);
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('Hàng đợi trống, thêm current track trước khi phát');
        const track = {
          id: currentTrack.id,
          url: currentTrack.url,
          title: currentTrack.title,
          artist: currentTrack.artist,
          artwork: currentTrack.artwork,
        };
        await TrackPlayer.add(track);
      }

      if (state === State.Playing) {
        await TrackPlayer.pause();
        console.log('Paused');
      } else {
        await TrackPlayer.play();
        console.log('Playing');
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const previousTrack = async () => {
    console.log('Previous track pressed');
    try {
      await TrackPlayer.skipToPrevious();
      const queue = await TrackPlayer.getQueue();
      const newIndex = await TrackPlayer.getCurrentTrack();
      if (newIndex !== null && queue[newIndex]) {
        setCurrentTrack(queue[newIndex]);
        console.log('Skipped to previous track:', queue[newIndex]);
      } else {
        console.log('No previous track available');
      }
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  const nextTrack = async () => {
    console.log('Next track pressed');
    try {
      await TrackPlayer.skipToNext();
      const queue = await TrackPlayer.getQueue();
      const newIndex = await TrackPlayer.getCurrentTrack();
      if (newIndex !== null && queue[newIndex]) {
        setCurrentTrack(queue[newIndex]);
        console.log('Skipped to next track:', queue[newIndex]);
      } else {
        console.log('No next track available');
      }
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };


  const toggleRepeat = () => {
    if (repeatMode === null) return;

    const modes = [RepeatMode.Off, RepeatMode.Track, RepeatMode.Queue];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    changeRepeatMode(nextMode);
  };

  const ShuffleSongs = async () => {
    let queue = await TrackPlayer.getQueue();
    console.log('Current queue:', queue);
    await TrackPlayer.reset();
    queue = queue.sort(() => Math.random() - 0.5);
    await TrackPlayer.add(queue);
    await TrackPlayer.play();
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>Không có bài hát nào đang phát</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => {
          console.log('Back button pressed');
          navigation.goBack();
        }}>
          <ArrowDown2 color="#ffffff"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐANG PHÁT</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => console.log('More button pressed')}>
          <More color="#ffffff"/>
        </TouchableOpacity>
      </View>

      <View style={styles.artworkContainer}>
        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
      </View>

      <View style={styles.trackInfoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        </View>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          value={position}
          minimumValue={0}
          maximumValue={duration}
          onSlidingComplete={(value) => {
            console.log('Seeking to:', value);
            TrackPlayer.seekTo(value);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
          thumbTintColor="#fff"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              setIsShuffling(!isShuffling);
              ShuffleSongs();
            }}
            activeOpacity={0.7}
          >
            <Shuffle size="28" color={isShuffling ? '#1DB954' : '#ffffff'} variant="Bold" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={previousTrack}>
          <Previous color="#ffffff" size={28}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlay}>
          {isPlaying ? (
              <Pause size="40" color="#fff" />
          ) : (
              <Play size="40" color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={nextTrack}>
          <Next color="#ffffff"/>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleRepeat}
            activeOpacity={0.7}
        >
          {repeatMode === REPEAT_MODES.TRACK ? (
              <RepeatOne size="28" color="#1DB954" variant="Bold" />
          ) : (
              <Repeat
                size="28"
                color={repeatMode === REPEAT_MODES.QUEUE ? '#1DB954' : repeatMode === REPEAT_MODES.OFF ? '#ffffff' : '#ffffff'}
                variant="Bold"
              />
        )}
        </TouchableOpacity>
      </View>
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
  },
});

export default NowPlayingScreen;