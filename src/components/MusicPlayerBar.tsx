import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer, { usePlaybackState, State, useProgress, Event, useTrackPlayerEvents } from 'react-native-track-player';
import { Previous, Pause, Play, Next } from 'iconsax-react-nativejs';
import NowPlayingScreen from '../screens/music/NowPlayingScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MusicPlayerBar = ({ currentTrack }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const isPlaying = playbackState === State.Playing;

  if (!currentTrack || route.name === 'NowPlayingScreen') return null;

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePress = () => {
    navigation.navigate('NowPlayingScreen', { song: currentTrack });
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const nextTrack = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const previousTrack = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  const progress = duration ? (position / duration) * 100 : 0;

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.9}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.content}>
        <Image
          source={{ uri: currentTrack.artwork }}
          style={styles.artwork}
          defaultSource={require('../assets/images/wibu.png')}
        />
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              previousTrack();
            }}
            activeOpacity={0.7}
            style={styles.controlButton}
          >
            <Previous color="#ffffff" size={28}/>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            activeOpacity={0.7}
            style={styles.controlButton}
          >
          {isPlaying ? (
              <Pause size="35" color="#fff" />
          ) : (
              <Play size="35" color="#fff" />
          )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            activeOpacity={0.7}
            style={styles.controlButton}
          >
            <Next color="#ffffff" size={28}/>
          </TouchableOpacity>
        </View>
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
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
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