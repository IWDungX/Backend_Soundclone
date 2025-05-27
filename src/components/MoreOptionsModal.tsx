import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../stores/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import usePlaylistStore from '../stores/usePlaylistStore';

const { width, height } = Dimensions.get('window');

const MoreOptionsModal = ({ visible, onClose, song, playlistId }) => {
  const navigation = useNavigation();
  const { setCurrentTrack, togglePlay, queue } = usePlayerStore();
  const { fetchPlaylists, removeSongFromPlaylist, isLoading } = usePlaylistStore();

  // Khai báo playlists từ usePlaylistStore
  const playlists = usePlaylistStore((state) => state.playlists); // Giả sử playlists là một state trong store

  useEffect(() => {
    if (visible && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [visible, fetchPlaylists, playlists]); // Thêm playlists vào dependency array

  if (!song) return null;

  const handlePlaySong = async () => {
    try {
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artwork: song.artwork,
        url: song.url,
      };

      const currentQueue = await TrackPlayer.getQueue();
      const songIndex = currentQueue.findIndex(track => track.id === song.id);

      if (songIndex === -1) {
        await TrackPlayer.reset();
        await TrackPlayer.add([songData]);
        usePlayerStore.setState({ queue: [songData] });
        await TrackPlayer.skip(0);
      } else {
        await TrackPlayer.skip(songIndex);
      }

      await setCurrentTrack(songData.id, songData);
      const state = await TrackPlayer.getState();
      if (state !== TrackPlayer.State.Playing) {
        await togglePlay();
      }

      onClose();
    } catch (error) {
      console.error('Lỗi khi phát bài hát:', error);
      usePlayerStore.setState({ isPlaying: false });
    }
  };

  const handleRemoveFromPlaylist = async () => {
    if (!playlistId) {
      Alert.alert('Lỗi', 'Không xác định được playlist để xóa bài hát');
      return;
    }

    console.log('Removing song from playlist - playlistId:', playlistId, 'songId:', song.id);

    try {
      await removeSongFromPlaylist(playlistId, song.id);
      Alert.alert('Thành công', 'Đã xóa bài hát khỏi playlist');
      onClose();
    } catch (error) {
      console.error('Lỗi khi xóa bài hát khỏi playlist:', error.message, error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa bài hát khỏi playlist';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleViewArtist = () => {
    onClose();
    // navigation.navigate('ProfileArtist', { artistId: song.artistId });
  };

  const handleShareSong = async () => {
    onClose();
  };

  const handleDownloadSong = async () => {
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.songInfoContainer}>
                <Image source={{ uri: song.artwork }} style={styles.songImage} />
                <View style={styles.songDetails}>
                  <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={handlePlaySong}>
                  <Icon name="play-circle-outline" size={24} color="#fff" />
                  <Text style={styles.optionText}>Phát</Text>
                </TouchableOpacity>

                {playlistId && (
                  <TouchableOpacity style={styles.option} onPress={handleRemoveFromPlaylist}>
                    <Icon name="remove-circle-outline" size={24} color="#fff" />
                    <Text style={styles.optionText}>Xóa khỏi playlist</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.option} onPress={handleViewArtist}>
                  <Icon name="person-outline" size={24} color="#fff" />
                  <Text style={styles.optionText}>Xem nghệ sĩ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleShareSong}>
                  <Icon name="share-social-outline" size={24} color="#fff" />
                  <Text style={styles.optionText}>Chia sẻ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleDownloadSong}>
                  <Icon name="download-outline" size={24} color="#fff" />
                  <Text style={styles.optionText}>Tải xuống</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: height * 0.7,
  },
  songInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songDetails: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  optionsContainer: {
    maxHeight: height * 0.5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
});

export default MoreOptionsModal;