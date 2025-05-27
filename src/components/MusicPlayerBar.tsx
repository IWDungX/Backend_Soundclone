import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, { useProgress, Event, useTrackPlayerEvents, State } from 'react-native-track-player';
import { Previous, Pause, Play, Next } from 'iconsax-react-nativejs';
import { usePlayerStore } from '../stores/usePlayerStore';
import useUserStore from '../stores/useUserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MusicPlayerBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { position, duration } = useProgress();
  const { currentTrackData, queue, isPlaying, isLoading, togglePlay, skipToNext, skipToPrevious } = usePlayerStore();
  const { addHistory, histories } = useUserStore(); // Lấy addHistory và histories từ store

  // Lắng nghe sự kiện từ TrackPlayer
  useTrackPlayerEvents(
    [Event.PlaybackState, Event.RemotePlay, Event.RemotePause, Event.PlaybackTrackChanged],
    async (event) => {
      const { setIsPlaying, setCurrentTrack } = usePlayerStore.getState();
      if (event.type === Event.PlaybackState) {
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing);
      } else if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
        const currentQueue = await TrackPlayer.getQueue();
        if (currentQueue[event.nextTrack]) {
          const nextTrack = currentQueue[event.nextTrack];
          setCurrentTrack(nextTrack.id, nextTrack);
          // Kiểm tra trạng thái phát để lưu lịch sử
          const state = await TrackPlayer.getState();
          if (state === State.Playing && nextTrack.id && histories[0]?.song_id !== nextTrack.id) {
            try {
              await addHistory(nextTrack.id);
              console.log('Đã lưu lịch sử phát nhạc:', nextTrack.title);
            } catch (error) {
              console.error('Lỗi khi lưu lịch sử:', error);
            }
          }
        }
      } else if (event.type === Event.RemotePlay) {
        await TrackPlayer.play();
        setIsPlaying(true);
        // Lưu lịch sử khi phát từ remote
        if (currentTrackData && histories[0]?.song_id !== currentTrackData.id) {
          try {
            await addHistory(currentTrackData.id);
            console.log('Đã lưu lịch sử phát nhạc:', currentTrackData.title);
          } catch (error) {
            console.error('Lỗi khi lưu lịch sử:', error);
          }
        }
      } else if (event.type === Event.RemotePause) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      }
    }
  );

  // Đồng bộ trạng thái khi currentTrackData thay đổi
  useEffect(() => {
    const syncState = async () => {
      if (currentTrackData) {
        const state = await TrackPlayer.getState();
        usePlayerStore.getState().setIsPlaying(state === State.Playing);
      }
    };
    syncState();
  }, [currentTrackData]);

  if (!currentTrackData || route.name === 'NowPlayingScreen') {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Chưa có bài hát nào được chọn</Text>
      </View>
    );
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = duration ? (position / duration) * 100 : 0;

  const handlePress = () => {
    const currentTrackIndex = queue.findIndex(song => song.id === currentTrackData.id);
    navigation.navigate('NowPlayingScreen', {
      songs: queue,
      initialTrackIndex: currentTrackIndex !== -1 ? currentTrackIndex : 0,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.9}>
      <View style={styles.content}>
        <Image
          source={{ uri: currentTrackData.artwork }}
          style={styles.artwork}
          defaultSource={require('../assets/images/wibu.png')}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrackData.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrackData.artist}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              skipToPrevious();
            }}
            activeOpacity={0.7}
            style={[styles.controlButton, isLoading && styles.controlButtonDisabled]}
            disabled={isLoading}
          >
            <Previous color="#ffffff" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async (e) => {
              e.stopPropagation();
              await togglePlay();
            }}
            activeOpacity={0.7}
            style={[styles.controlButton, isPlaying && styles.controlButtonActive, isLoading && styles.controlButtonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.loadingText}>Đang tải...</Text>
            ) : isPlaying ? (
              <Pause size="35" color="#fff" />
            ) : (
              <Play size="35" color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              skipToNext();
            }}
            activeOpacity={0.7}
            style={[styles.controlButton, isLoading && styles.controlButtonDisabled]}
            disabled={isLoading}
          >
            <Next color="#ffffff" size={28} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282828',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    borderRadius: 12,
    marginLeft: 5,
    marginRight: 5,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 5,
    marginRight: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: '#333',
  },
  trackInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#B3B3B3',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default MusicPlayerBar;