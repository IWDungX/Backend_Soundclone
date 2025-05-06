import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import usePlaylistStore from '../../stores/usePlaylistStore';

const PlaylistScreen = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const { playlists, isLoading, fetchPlaylists, createPlaylist } = usePlaylistStore();

  // Lấy danh sách playlist khi màn hình được tải
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery('');
    }
  };

  const handleCreatePlaylist = () => {
    setIsModalVisible(true);
  };

  const handleSubmitPlaylist = async () => {
    if (playlistName.trim()) {
      try {
        await createPlaylist(playlistName.trim());
        setIsModalVisible(false);
        setPlaylistName('');
      } catch (error) {
        // Lỗi đã được xử lý trong store, không cần làm gì thêm
      }
    }
  };

  // Lọc playlist theo searchQuery
  const filteredPlaylists = playlists.filter((item) =>
    item.playlist_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!isSearchVisible ? (
          <>
            <Text style={styles.title}>Thư viện</Text>
            <TouchableOpacity style={styles.iconButton} onPress={toggleSearch}>
              <Text>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleCreatePlaylist}>
              <Text>➕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Text>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm trong thư viện"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <TouchableOpacity onPress={toggleSearch}>
                <Text>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      <ScrollView style={styles.content}>
        {isLoading ? (
          <Text style={styles.emptyState}>Đang tải...</Text>
        ) : filteredPlaylists.length > 0 ? (
          filteredPlaylists.map((item) => (
            <View key={item.id} style={styles.playlistItem}>
              <Image
                source={{ uri: item.coverImage || 'https://picsum.photos/200/200' }}
                style={styles.playlistCover}
              />
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.playlist_title}</Text>
                <Text style={styles.playlistDetails}>
                  {item.songs?.length || 0} bài hát
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyState}>
            {searchQuery
              ? 'Không tìm thấy playlist nào'
              : 'Chưa có playlist nào. Hãy tạo playlist đầu tiên của bạn!'}
          </Text>
        )}
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text>❌</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Tạo playlist mới</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tên playlist</Text>
              <TextInput
                style={styles.playlistNameInput}
                placeholder="Nhập tên playlist của bạn"
                value={playlistName}
                onChangeText={setPlaylistName}
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[
                styles.createButton,
                playlistName.trim() && !isLoading
                  ? {}
                  : styles.createButtonDisabled,
              ]}
              onPress={handleSubmitPlaylist}
              disabled={!playlistName.trim() || isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Đang tạo...' : 'Tạo playlist'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#000',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  playlistCover: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  playlistDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  emptyState: {
    textAlign: 'center',
    padding: 20,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  playlistNameInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  createButton: {
    backgroundColor: '#1DB954',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default PlaylistScreen;