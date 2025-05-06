import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, { useProgress, Event, useTrackPlayerEvents, State } from 'react-native-track-player';
import { Previous, Pause, Play, Next } from 'iconsax-react-nativejs';
import { usePlayerStore } from '../stores/usePlayerStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MusicPlayerBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { position, duration } = useProgress();
  const { currentTrackData, isPlaying, togglePlay, skipToNext, skipToPrevious } = usePlayerStore();

  // Lắng nghe sự kiện từ TrackPlayer
  useTrackPlayerEvents([Event.PlaybackState, Event.RemotePlay, Event.RemotePause], async (event) => {
    if (event.type === Event.PlaybackState) {
      const state = await TrackPlayer.getState();
      usePlayerStore.setState({ isPlaying: state === State.Playing });
      console.log('Playback state:', state);
    } else if (event.type === Event.RemotePlay) {
      await TrackPlayer.play();
      usePlayerStore.setState({ isPlaying: true });
    } else if (event.type === Event.RemotePause) {
      await TrackPlayer.pause();
      usePlayerStore.setState({ isPlaying: false });
    }
  });

  // Đồng bộ trạng thái khi currentTrackData thay đổi
  useEffect(() => {
    const syncState = async () => {
      if (currentTrackData) {
        const state = await TrackPlayer.getState();
        usePlayerStore.setState({ isPlaying: state === State.Playing });
      }
    };
    syncState();
  }, [currentTrackData]);

  if (!currentTrackData || route.name === 'NowPlayingScreen') return null;

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = duration ? (position / duration) * 100 : 0;

  const handlePress = () => {
    navigation.navigate('NowPlayingScreen', { songs: [currentTrackData], initialTrackIndex: 0 });
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
            style={styles.controlButton}
          >
            <Previous color="#ffffff" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async (e) => {
              e.stopPropagation();
              await togglePlay();
            }}
            activeOpacity={0.7}
            style={styles.controlButton}
          >
            {isPlaying ? <Pause size="35" color="#fff" /> : <Play size="35" color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              skipToNext();
            }}
            activeOpacity={0.7}
            style={styles.controlButton}
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
    height: 60,
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
    width: 40,
    height: 40,
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
  },
});

export default MusicPlayerBar;