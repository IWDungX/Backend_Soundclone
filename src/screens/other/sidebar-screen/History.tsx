import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ArrowLeft, More } from 'iconsax-react-nativejs';
import useUserStore from '../../../stores/useUserStore';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import TrackPlayer from 'react-native-track-player';
import { getFullMinioUrl } from '../../../service/minioUrl';

const History = () => {
  const navigation = useNavigation();
  const { histories, fetchHistoryByDateRange, deleteHistory, isLoading, error } = useUserStore();
  const { setCurrentTrack, togglePlay, queue, setIsPlaying } = usePlayerStore(); // Use player store

  useEffect(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 7); // Fetch history for the last 7 days
    fetchHistoryByDateRange(from.toISOString(), to.toISOString());
  }, [fetchHistoryByDateRange]);

  const groupHistoryByDate = () => {
    const grouped = {};
    if (!Array.isArray(histories)) {
      console.warn('histories không phải là mảng:', histories);
      return [];
    }

    histories.forEach(item => {
      if (item && item.played_at) {
        const dateKey = format(new Date(item.played_at), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push({
          id: item.history_id,
          songId: item.song_id,
          title: item.song_title || 'Không có tiêu đề',
          artist: item.artist_name || 'Không rõ nghệ sĩ',
          artwork: getFullMinioUrl(item.song_image_url) || 'https://picsum.photos/seed/default/200/200',
          url: getFullMinioUrl(item.song_audio_url) || '',
          playedAt: new Date(item.played_at),
        });
      }
    });

    return Object.keys(grouped).map(date => ({
      date,
      data: grouped[date],
      displayDate: format(new Date(date), 'dd/MM/yyyy'),
    }));
  };

  const handleSongPress = async (song) => {
    try {
      // Map the history item to the Song type expected by usePlayerStore
      const songData = {
        id: song.songId, // Use songId as the track ID
        title: song.title,
        artist: song.artist,
        artwork: song.artwork,
        url: song.url,
        lastPlayed: song.playedAt.toISOString(),
      };

      // Check if the song is already in the queue
      const songInQueue = queue.find(track => track.id === songData.id);

      if (!songInQueue) {
        // If the song is not in the queue, reset the queue and add the song
        await TrackPlayer.reset();
        await TrackPlayer.add(songData);
        setCurrentTrack(songData.id, songData);
      } else {
        // If the song is in the queue, skip to it
        const queueIndex = queue.findIndex(track => track.id === songData.id);
        await TrackPlayer.skip(queueIndex);
        setCurrentTrack(songData.id, songData);
      }

      // Start playback
      await TrackPlayer.play();
      setIsPlaying(true);

      // Optionally navigate to NowPlayingScreen
      navigation.navigate('NowPlayingScreen', { song: songData });
    } catch (error) {
      console.error('Error playing song from history:', error);
      alert('Không thể phát bài hát');
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await deleteHistory(historyId);
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử:', error);
      alert('Không thể xóa lịch sử');
    }
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
    >
      <Image source={{ uri: item.artwork }} style={styles.songArtwork} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Text style={styles.songTime}>{format(item.playedAt, 'HH:mm')}</Text>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => handleDeleteHistory(item.id)}
      >
        <More size={20} color="#999" variant="Linear" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDateSection = ({ item }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateSectionTitle}>{item.displayDate}</Text>
      <FlatList
        data={item.data}
        renderItem={renderSongItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử nghe nhạc</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Lỗi: {error}</Text>
        </View>
      ) : histories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chưa có lịch sử nghe nhạc</Text>
        </View>
      ) : (
        <FlatList
          data={groupHistoryByDate()}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.loadingText}>Không có dữ liệu để hiển thị</Text>}
        />
      )}
    </SafeAreaView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#121212',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  songArtwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 4,
  },
  songTime: {
    color: '#b3b3b3',
    fontSize: 14,
    marginRight: 12,
  },
  moreButton: {
    padding: 8,
  },
});

export default History;