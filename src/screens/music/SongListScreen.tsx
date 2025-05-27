import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Play, Pause, MoreCircle } from 'iconsax-react-nativejs';
import TrackPlayer from 'react-native-track-player';
import usePlaylistStore from '../../stores/usePlaylistStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { getFullMinioUrl } from '../../service/minioUrl';
import MoreOptionsModal from '../../components/MoreOptionsModal';

const SongListScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { playlistId, playlistTitle, coverImage } = route.params;

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getPlaylistDetails, playPlaylist, removeSongFromPlaylist } = usePlaylistStore();
  const { currentTrack, queue, isPlaying, setCurrentTrack, togglePlay } = usePlayerStore();

  // Add state for modal
  const [selectedSong, setSelectedSong] = useState(null);
  const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        setIsLoading(true);
        const playlistData = await getPlaylistDetails(playlistId);
        setPlaylist(playlistData);
        setError(null);
      } catch (err) {
        console.error('Error fetching playlist details:', err);
        setError('Không thể tải danh sách bài hát. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId, getPlaylistDetails]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePlayAll = async () => {
    try {
      // Gọi playPlaylist và truyền usePlayerStore để đồng bộ
      await playPlaylist(playlistId, usePlayerStore.getState());
    } catch (error) {
      console.error('Error playing playlist:', error);
      Alert.alert('Lỗi', 'Không thể phát playlist. Vui lòng thử lại sau.');
    }
  };

  const handleSongPress = async (song) => {
    try {
      const currentQueue = await TrackPlayer.getQueue();
      const songData = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        artwork: song.artwork,
        url: song.url,
      };

      // Kiểm tra xem queue hiện tại có khớp với playlist không
      const playlistSongs = playlist.songs.map(s => ({
        id: s.id,
        url: s.url,
        title: s.title,
        artist: s.artist,
        artwork: s.artwork,
      }));

      const isQueueMatching = currentQueue.length === playlistSongs.length &&
        currentQueue.every((track, index) => track.id === playlistSongs[index].id);

      if (!isQueueMatching) {
        // Nếu queue không khớp, reset và thêm toàn bộ playlist
        await TrackPlayer.reset();
        await TrackPlayer.add(playlistSongs);
        // Cập nhật queue trong usePlayerStore
        usePlayerStore.setState({ queue: playlistSongs });
      }

      // Tìm index của bài hát trong queue
      const songIndex = playlistSongs.findIndex(s => s.id === song.id);
      if (songIndex !== -1) {
        await TrackPlayer.skip(songIndex);
        // Cập nhật currentTrack trong usePlayerStore
        setCurrentTrack(songData.id, songData);
        // Nếu không đang phát, gọi togglePlay để phát
        const state = await TrackPlayer.getState();
        if (state !== TrackPlayer.State.Playing) {
          await togglePlay();
        }
      }
    } catch (error) {
      console.error("Error playing song:", error);
      Alert.alert('Lỗi', 'Không thể phát bài hát này. Vui lòng thử lại.');
    }
  };

  // Add handler for more button
  const handleMorePress = (song) => {
    setSelectedSong(song);
    setMoreOptionsVisible(true);
  };

  const handleCloseMoreOptions = () => {
    setMoreOptionsVisible(false);
    setSelectedSong(null);
  };

  const renderSongItem = ({ item, index }) => {
    const isCurrentSong = currentTrack === item.id; // So sánh với currentTrack (string)

    return (
      <TouchableOpacity
        style={[
          styles.songItem,
          isCurrentSong && styles.currentSongItem
        ]}
        onPress={() => handleSongPress(item)}
      >
        <Text style={styles.songIndex}>{index + 1}</Text>
        <Image
          source={{ uri: item.artwork || 'https://picsum.photos/100/100' }}
          style={styles.songCover}
        />
        <View style={styles.songInfo}>
          <Text style={[styles.songTitle, isCurrentSong && styles.currentSongText]}>
            {item.title}
          </Text>
          <Text style={styles.songArtist}>{item.artist}</Text>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleMorePress(item)}
        >
          <MoreCircle size={24} color="#ffffff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="rgba(18, 18, 18, 1)"
        barStyle="light-content"
        translucent={true}
      />
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{playlistTitle}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Đang tải danh sách bài hát...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setIsLoading(true);
                setError(null);
                getPlaylistDetails(playlistId)
                  .then(data => setPlaylist(data))
                  .catch(err => setError('Không thể tải danh sách bài hát. Vui lòng thử lại sau.'))
                  .finally(() => setIsLoading(false));
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.playlistHeader}>
              <Image
                source={{ uri: coverImage }}
                style={styles.playlistCover}
              />
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistTitle}>{playlistTitle}</Text>
                <Text style={styles.playlistDetails}>
                  {playlist?.songs?.length || 0} bài hát
                </Text>
                <TouchableOpacity
                  style={styles.playAllButton}
                  onPress={handlePlayAll}
                >
                  <Play size={20} color="#000000" />
                  <Text style={styles.playAllText}>Phát tất cả</Text>
                </TouchableOpacity>
              </View>
            </View>

            {playlist?.songs?.length > 0 ? (
              <FlatList
                data={playlist.songs}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.songList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Playlist này chưa có bài hát nào
                </Text>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
      <MoreOptionsModal
        visible={moreOptionsVisible}
        onClose={handleCloseMoreOptions}
        song={selectedSong}
        playlistId={playlistId} // Thêm playlistId từ route.params
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playlistCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  playlistDetails: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 16,
  },
  playAllButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  playAllText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  songList: {
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  currentSongItem: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  songIndex: {
    width: 30,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  currentSongText: {
    color: '#1DB954',
  },
  songArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});

export default SongListScreen;