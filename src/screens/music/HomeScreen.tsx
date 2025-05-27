import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Animated,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Sidebar from '../../components/Sidebar';
import { getSongs } from '../../service/apiSong';
import { getFullMinioUrl } from '../../service/minioUrl';
import AuthService from '../../service/auth';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { AuthContext } from '../../context/AuthContext';

const MOCK_DATA = {
  user: {
    id: 'user123',
    name: 'Nguyễn Văn A',
    avatarUrl: 'https://picsum.photos/seed/user123/100/100',
    email: 'nguyenvana@example.com',
    premium: true,
  },
  featuredPlaylists: [
    {
      id: 'featured1',
      title: 'New Releases',
      description: 'Những bản phát hành mới nhất',
      coverImage: 'https://picsum.photos/seed/featured1/200/200',
      totalSongs: 30,
      totalDuration: '2h 05m',
    },
    {
      id: 'featured2',
      title: 'Top 50 Vietnam',
      description: 'Những bài hát được nghe nhiều nhất',
      coverImage: 'https://picsum.photos/seed/featured2/200/200',
      totalSongs: 50,
      totalDuration: '3h 15m',
    },
    {
      id: 'featured3',
      title: 'Indie Vietnam',
      description: 'Những nghệ sĩ indie Việt nổi bật',
      coverImage: 'https://picsum.photos/seed/featured3/200/200',
      totalSongs: 25,
      totalDuration: '1h 42m',
    },
    {
      id: 'featured4',
      title: 'Chill Weekend',
      description: 'Thư giãn cuối tuần',
      coverImage: 'https://picsum.photos/seed/featured4/200/200',
      totalSongs: 20,
      totalDuration: '1h 20m',
    },
    {
      id: 'featured5',
      title: 'Throwback Hits',
      description: 'Nhạc hay một thời',
      coverImage: 'https://picsum.photos/seed/featured5/200/200',
      totalSongs: 35,
      totalDuration: '2h 25m',
    },
  ],
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { logout } = React.useContext(AuthContext);
  const [greeting, setGreeting] = useState('');
  const [userData, setUserData] = useState(MOCK_DATA.user);
  const [likedSongs, setLikedSongs] = useState([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState(MOCK_DATA.featuredPlaylists);
  const { recentlyPlayed, currentTrackData, isSidebarVisible, setRecentlyPlayed, setCurrentTrack, setSidebarVisible } = usePlayerStore();
  const translateX = useRef(new Animated.Value(1000)).current;
  const blurOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const songsData = await getSongs();
        console.log('Dữ liệu bài hát từ API:', songsData);
        const formattedSongs = songsData
          .map((song) => {
            if (!song.song_id || !song.song_audio_url) {
              console.warn('Bài hát không hợp lệ:', song);
              return null;
            }
            return {
              id: song.song_id,
              title: song.song_title || 'Unknown Title',
              artist: song.Artist?.artist_name || 'Unknown Artist',
              artwork: song.song_image_url ? getFullMinioUrl(song.song_image_url) : 'https://picsum.photos/seed/song/200/200',
              url: song.song_audio_url ? getFullMinioUrl(song.song_audio_url) : null,
              albumCover: song.song_image_url ? getFullMinioUrl(song.song_image_url) : 'https://picsum.photos/seed/song/200/200',
              duration: song.song_duration || '4:00',
              lastPlayed: song.song_createAt || new Date().toISOString(),
            };
          })
          .filter(song => song && song.url);
        console.log('Danh sách bài hát đã định dạng:', formattedSongs);
        setRecentlyPlayed(formattedSongs);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
        setRecentlyPlayed([]);
        if (error.response?.status === 401) {
          try {
            const newToken = await AuthService.refreshToken();
            if (newToken) {
              const songsData = await getSongs();
              const formattedSongs = songsData
                .map((song) => {
                  if (!song.song_id || !song.song_audio_url) {
                    console.warn('Bài hát không hợp lệ:', song);
                    return null;
                  }
                  return {
                    id: song.song_id,
                    title: song.song_title || 'Unknown Title',
                    artist: song.Artist?.artist_name || 'Unknown Artist',
                    artwork: song.song_image_url ? getFullMinioUrl(song.song_image_url) : 'https://picsum.photos/seed/song/200/200',
                    url: song.song_audio_url ? getFullMinioUrl(song.song_audio_url) : null,
                    albumCover: song.song_image_url ? getFullMinioUrl(song.song_image_url) : 'https://picsum.photos/seed/song/200/200',
                    duration: song.song_duration || '4:00',
                    lastPlayed: song.song_createAt || new Date().toISOString(),
                  };
                })
                .filter(song => song && song.url);
              setRecentlyPlayed(formattedSongs);
            } else {
              await AuthService.logout();
              await logout();
              navigation.navigate('LoginScreen');
            }
          } catch (refreshError) {
            console.error('Không thể refresh token:', refreshError);
            await AuthService.logout();
            await logout();
            navigation.navigate('LoginScreen');
          }
        }
      }
    };

    fetchData();
  }, [navigation, logout, setRecentlyPlayed]);

  useEffect(() => {
    const syncTrackPlayer = async () => {
      try {
        const queue = await TrackPlayer.getQueue();
        const currentTrackIndex = await TrackPlayer.getCurrentTrack();
        console.log('TrackPlayer queue:', queue);
        console.log('TrackPlayer currentTrackIndex:', currentTrackIndex);
        if (currentTrackIndex !== null && queue[currentTrackIndex]) {
          setCurrentTrack(queue[currentTrackIndex].id, queue[currentTrackIndex]);
          console.log('Cập nhật currentTrackData:', queue[currentTrackIndex]);
        } else if (recentlyPlayed.length > 0) {
          await TrackPlayer.reset();
          await TrackPlayer.add(recentlyPlayed);
          await TrackPlayer.skip(0);
          setCurrentTrack(recentlyPlayed[0].id, recentlyPlayed[0]);
          console.log('Khởi tạo hàng đợi từ recentlyPlayed:', recentlyPlayed[0]);
        }
      } catch (error) {
        console.error('Lỗi đồng bộ TrackPlayer:', error);
      }
    };
    syncTrackPlayer();
  }, [setCurrentTrack, recentlyPlayed]);

  useEffect(() => {
    const getGreetingByTime = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) return 'Chào buổi sáng';
      if (currentHour >= 12 && currentHour < 18) return 'Chào buổi chiều';
      if (currentHour >= 18 && currentHour < 22) return 'Chào buổi tối';
      return 'Muộn rồi nhỉ';
    };

    setGreeting(getGreetingByTime());
    const intervalId = setInterval(() => setGreeting(getGreetingByTime()), 60000);

    return () => clearInterval(intervalId);
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackQueueEnded], async (event) => {
    console.log('Sự kiện TrackPlayer:', event);
    try {
      if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null) {
        const queue = await TrackPlayer.getQueue();
        const nextTrackIndex = event.nextTrack;
        if (nextTrackIndex >= 0 && nextTrackIndex < queue.length) {
          setCurrentTrack(queue[nextTrackIndex].id, queue[nextTrackIndex]);
          console.log('Cập nhật bài hát hiện tại:', queue[nextTrackIndex]);
        }
      } else if (event.type === Event.PlaybackQueueEnded) {
        if (recentlyPlayed.length > 0) {
          await TrackPlayer.reset();
          await TrackPlayer.add(recentlyPlayed);
          await TrackPlayer.skip(0);
          setCurrentTrack(recentlyPlayed[0].id, recentlyPlayed[0]);
          console.log('Hàng đợi kết thúc, tải lại danh sách bài hát');
        } else {
          setCurrentTrack(null, null);
          console.log('Hàng đợi kết thúc, không có bài hát để tải lại');
        }
      }
    } catch (error) {
      console.error('Lỗi xử lý sự kiện TrackPlayer:', error);
    }
  });

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSongPress = async (song) => {
    const tracks = recentlyPlayed
      .map((item) => ({
        id: String(item.id),
        url: item.url || getFullMinioUrl(song.song_audio_url),
        title: item.title || song.song_title,
        artist: item.artist || song.Artist?.artist_name,
        artwork: item.artwork || getFullMinioUrl(song.song_image_url),
      }))
      .filter(t => t.url);

    if (tracks.length === 0) {
      Alert.alert('Lỗi', 'Danh sách bài hát trống hoặc không hợp lệ');
      return;
    }

    const trackIndex = tracks.findIndex(t => t.id === String(song.id));
    if (trackIndex === -1) {
      Alert.alert('Lỗi', 'Không tìm thấy bài hát trong danh sách');
      return;
    }

    navigation.navigate('NowPlayingScreen', {
      songs: tracks,
      initialTrackIndex: trackIndex,
    });
  };

  const handlePlaylistPress = (item) => {
    console.log('Playlist pressed:', item);
  };

  const SidebarBackdrop = () => (
    <Animated.View style={[styles.backdrop, { opacity: blurOpacity }]}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={toggleSidebar} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <TouchableOpacity onPress={toggleSidebar} style={styles.iconButton}>
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phát gần đây</Text>
            {recentlyPlayed.length === 0 ? (
              <Text style={styles.emptyText}>Không có bài hát nào được phát gần đây</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {recentlyPlayed.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.musicCard}
                    onPress={() => handleSongPress(item)}
                  >
                    <Image source={{ uri: item.albumCover }} style={styles.albumCover} />
                    <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.artistName} numberOfLines={1}>{item.artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Có thể bạn sẽ thích</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {recentlyPlayed.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.playlistCard}
                  onPress={() => handlePlaylistPress(item)}
                >
                  <Image source={{ uri: item.albumCover }} style={styles.playlistCover} />
                  <Text style={styles.playlistTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.playlistDescription} numberOfLines={2}>
                    {item.description || 'No description'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SoundCLone lựa chọn cho bạn</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {featuredPlaylists.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.playlistCard}
                  onPress={() => handlePlaylistPress(item)}
                >
                  <Image source={{ uri: item.coverImage }} style={styles.playlistCover} />
                  <Text style={styles.playlistTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.playlistDescription} numberOfLines={2}>{item.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {isSidebarVisible && <SidebarBackdrop />}
      {isSidebarVisible && (
        <Sidebar
          isVisible={isSidebarVisible}
          onClose={toggleSidebar}
          userData={userData}
          translateX={translateX}
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
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    lineHeight: 30,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  musicCard: {
    width: 150,
    marginRight: 16,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  playlistCard: {
    width: 180,
    marginRight: 16,
  },
  playlistCover: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 16,
  },
});

export default HomeScreen;