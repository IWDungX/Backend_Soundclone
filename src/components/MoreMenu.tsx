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
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { CloseCircle, Add, Profile, Share, DocumentDownload } from 'iconsax-react-native';
import usePlaylistStore from '../stores/usePlaylistStore';

const { width, height } = Dimensions.get('window');

const MoreMenu = ({ visible, onClose, song }) => {
  const navigation = useNavigation();
  const { playlists, fetchPlaylists, addSongToPlaylist, isLoading } = usePlaylistStore();

  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    if (visible && playlists.length === 0) {
      fetchPlaylists();
    }
  }, [visible, fetchPlaylists, playlists]);

  useEffect(() => {
    if (song) {
      console.log('MoreMenu received song:', song);
    } else {
      console.warn('MoreMenu received no song data');
    }
  }, [song]);

  if (!song || !song.id || !song.title || !song.artist) {
    console.warn('Invalid song data in MoreMenu:', song);
    return null;
  }

  const handleAddToPlaylist = () => {
    setPlaylistModalVisible(true);
  };

  const handleSelectPlaylist = async (playlistId) => {
    setSelectedPlaylistId(playlistId);
    try {
      await addSongToPlaylist(playlistId, song.id);
      Alert.alert('Thành công', 'Đã thêm bài hát vào playlist');
      setPlaylistModalVisible(false);
      setSelectedPlaylistId(null);
    } catch (error) {
      console.error('Lỗi khi thêm bài hát vào playlist:', error);
      Alert.alert('Lỗi', 'Không thể thêm bài hát vào playlist');
    }
  };

  const handleViewArtist = () => {
    if (!song.artistId) {
      console.error('Artist ID not found in song:', song);
      Alert.alert('Lỗi', 'Không tìm thấy ID nghệ sĩ. Vui lòng kiểm tra lại dữ liệu.');
      return;
    }
    navigation.navigate('ProfileArtist', { artistId: song.artistId });
    onClose();
  };

  const handleShareSong = async () => {
    onClose();
  };

  const handleDownloadSong = async () => {
    onClose();
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity style={styles.playlistItem} onPress={() => handleSelectPlaylist(item.id)}>
      <Text style={styles.playlistTitle}>{item.title}</Text>
      {isLoading && selectedPlaylistId === item.id && (
        <ActivityIndicator size="small" color="#1DB954" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.songInfoContainer}>
                <Image
                  source={{ uri: song.artwork || 'https://via.placeholder.com/150' }}
                  style={styles.songImage}
                />
                <View style={styles.songDetails}>
                  <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                  <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <CloseCircle size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.optionsContainer}>
                <TouchableOpacity style={styles.option} onPress={handleAddToPlaylist}>
                  <Add size={24} color="#fff" />
                  <Text style={styles.optionText}>Thêm vào playlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleViewArtist}>
                  <Profile size={24} color="#fff" />
                  <Text style={styles.optionText}>Xem nghệ sĩ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleShareSong}>
                  <Share size={24} color="#fff" />
                  <Text style={styles.optionText}>Chia sẻ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={handleDownloadSong}>
                  <DocumentDownload size={24} color="#fff" />
                  <Text style={styles.optionText}>Tải xuống</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        transparent={true}
        visible={playlistModalVisible}
        onRequestClose={() => setPlaylistModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPlaylistModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.playlistModalContent}>
                <View style={styles.playlistHeader}>
                  <Text style={styles.playlistHeaderText}>Chọn Playlist</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setPlaylistModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.loadingText}>Đang tải playlist...</Text>
                  </View>
                ) : playlists.length > 0 ? (
                  <FlatList
                    data={playlists}
                    renderItem={renderPlaylistItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.playlistList}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Bạn chưa có playlist nào</Text>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => {
                        setPlaylistModalVisible(false);
                        navigation.navigate('CreatePlaylistScreen');
                      }}
                    >
                      <Text style={styles.createButtonText}>Tạo playlist mới</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  playlistModalContent: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: height * 0.6,
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
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playlistHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playlistList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MoreMenu;