import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { ArrowLeft, More } from 'iconsax-react-nativejs';
import useUserStore from '../../../stores/useUserStore';
import { usePlayerStore } from '../../../stores/usePlayerStore';
import TrackPlayer, { State } from 'react-native-track-player';
import { getFullMinioUrl } from '../../../service/minioUrl';

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const History = () => {
  const navigation = useNavigation();
  const { histories, fetchHistoryByDateRange, deleteHistory, addHistory, isLoading, error } = useUserStore();
  const { currentTrack, setCurrentTrack, togglePlay, queue, setIsPlaying, setQueue } = usePlayerStore();

  // Load history when component mounts
  useEffect(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(to.getDate() - 7);
    fetchHistoryByDateRange(from.toISOString(), to.toISOString());
  }, [fetchHistoryByDateRange]);

  // Sync TrackPlayer state when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        let state = await TrackPlayer.getState();
        if (state === State.None) {
          await TrackPlayer.setupPlayer();
          state = await TrackPlayer.getState();
        }

        const queue = await TrackPlayer.getQueue();
        const currentTrackIndex = await TrackPlayer.getCurrentTrack();
        if (queue.length > 0) {
          setQueue(queue);
          if (currentTrackIndex !== null && queue[currentTrackIndex]) {
            setCurrentTrack(queue[currentTrackIndex].id, queue[currentTrackIndex]);
            setIsPlaying(state === State.Playing);
          }
        }
      } catch (error) {
        console.error('Error syncing TrackPlayer on focus in History:', error);
      }
    });

    return unsubscribe;
  }, [navigation, setCurrentTrack, setIsPlaying, setQueue]);

  // Filter histories to keep only the latest record for each song
  const filteredHistories = useMemo(() => {
    if (!Array.isArray(histories)) {
      console.warn('histories không phải là mảng:', histories);
      return [];
    }

    const songMap = new Map();
    histories.forEach(item => {
      if (item && item.song_id && item.played_at) {
        const playedAt = new Date(item.played_at).getTime();
        if (!songMap.has(item.song_id) || playedAt > songMap.get(item.song_id).playedAt) {
          songMap.set(item.song_id, {
            ...item,
            playedAt,
          });
        }
      }
    });

    return Array.from(songMap.values()).sort((a, b) => b.playedAt - a.playedAt);
  }, [histories]);

  // Group filtered history by date
  const groupedHistory = useMemo(() => {
    const grouped = {};

    filteredHistories.forEach(item => {
      if (item && item.played_at) {
        const dateKey = format(new Date(item.played_at), 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({
          id: item.history_id,
          songId: item.song_id,
          title: item.song_title || 'Không có tiêu đề',
          artist: item.artist_name || 'Không rõ nghệ sĩ',
          artwork: getFullMinioUrl(item.song_image_url) || 'https://picsum.photos/seed/default/200/200',
          url: getFullMinioUrl(item.song_audio_url),
          playedAt: new Date(item.played_at),
        });
      }
    });

    return Object.keys(grouped).map(date => ({
      date,
      data: grouped[date],
      displayDate: format(new Date(date), 'dd/MM/yyyy'),
    }));
  }, [filteredHistories]);

  // Debounced addHistory to avoid frequent API calls
  const debouncedAddHistory = useCallback(
    debounce((songId) => {
      const existingHistory = filteredHistories.find(item => item.song_id === songId);
      if (existingHistory) {
        deleteHistory(existingHistory.history_id).then(() => {
          addHistory(songId);
        });
      } else {
        addHistory(songId);
      }
    }, 2000),
    [addHistory, deleteHistory, filteredHistories]
  );

  const handleSongPress = async (song) => {
    try {
      // Kiểm tra trạng thái TrackPlayer
      let state = await TrackPlayer.getState();
      if (state === State.None) {
        await TrackPlayer.setupPlayer();
        state = await TrackPlayer.getState();
      }

      if (state === State.Error) {
        throw new Error('TrackPlayer is in an error state');
      }

      const songData = {
        id: song.songId,
        title: song.title,
        artist: song.artist,
        artwork: song.artwork,
        url: song.url,
        lastPlayed: song.playedAt.toISOString(),
      };

      if (!songData.url) {
        throw new Error('Invalid song URL');
      }

      if (currentTrack === songData.id) {
        if (state === State.Paused) {
          await TrackPlayer.play();
          setIsPlaying(true);
        }
        return;
      }

      const historySongs = filteredHistories.map(item => ({
        id: item.song_id,
        title: item.song_title || 'Không có tiêu đề',
        artist: item.artist_name || 'Không rõ nghệ sĩ',
        artwork: getFullMinioUrl(item.song_image_url) || 'https://picsum.photos/seed/default/200/200',
        url: getFullMinioUrl(item.song_audio_url),
        lastPlayed: new Date(item.played_at).toISOString(),
      })).filter(s => s.url);

      if (historySongs.length === 0) {
        throw new Error('No valid songs to play');
      }

      const currentQueue = await TrackPlayer.getQueue();
      const isQueueMatching = currentQueue.length === historySongs.length &&
        currentQueue.every((track, index) => track.id === historySongs[index].id);

      if (!isQueueMatching) {
        await TrackPlayer.reset();
        await TrackPlayer.add(historySongs);
        setQueue(historySongs);
      }

      const songIndex = historySongs.findIndex(s => s.id === songData.id);
      if (songIndex !== -1) {
        await TrackPlayer.skip(songIndex);
        await TrackPlayer.play();
        setCurrentTrack(songData.id, songData);
        setIsPlaying(true);
      } else {
        await TrackPlayer.add(songData);
        await TrackPlayer.skipToLast();
        await TrackPlayer.play();
        setQueue([...queue, songData]);
        setCurrentTrack(songData.id, songData);
        setIsPlaying(true);
      }

      const trackProgress = await TrackPlayer.getProgress();
      if (trackProgress.position > 30) {
        debouncedAddHistory(song.songId);
      }

      navigation.navigate('NowPlayingScreen', {
        songs: historySongs,
        initialTrackIndex: songIndex !== -1 ? songIndex : queue.length,
      });
    } catch (error) {
      console.error('Error playing song from history:', error.message);
      Alert.alert('Lỗi', error.message || 'Không thể phát bài hát');
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      await deleteHistory(historyId);
    } catch (error) {
      console.error('Lỗi khi xóa lịch sử:', error);
      Alert.alert('Lỗi', 'Không thể xóa lịch sử');
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
      ) : filteredHistories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chưa có lịch sử nghe nhạc</Text>
        </View>
      ) : (
        <FlatList
          data={groupedHistory}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={<Text style={styles.loadingText}>Không có dữ liệu để hiển thị</Text>}
        />
      )}
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