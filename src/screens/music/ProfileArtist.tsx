import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, More } from 'iconsax-react-native';
import LinearGradient from 'react-native-linear-gradient';
import useArtistStore from '../../stores/useArtistStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import Toast from 'react-native-toast-message';
import TrackPlayer, { State } from 'react-native-track-player';
import MoreMenu from '../../components/MoreMenu';
import { getFullMinioUrl } from '../../service/minioUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 90;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const ProfileArtist = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artistId } = route.params || {};
  const {
    artists,
    artistSongs,
    followedArtists,
    isLoading,
    error,
    fetchArtistById,
    fetchArtistSongs,
    followArtist,
    unfollowArtist,
    fetchFollowedArtists,
  } = useArtistStore();
  const { setCurrentTrack, setIsPlaying, setQueue } = usePlayerStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const scrollY = new Animated.Value(0);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const artist = artists.find((a) => a.artist_id === artistId);

  useEffect(() => {
    if (artistId) {
      console.log('Fetching data for artistId:', artistId);
      fetchArtistById(artistId);
      fetchArtistSongs(artistId);
      fetchFollowedArtists();
    }
  }, [artistId, fetchArtistById, fetchArtistSongs, fetchFollowedArtists]);

  useEffect(() => {
    console.log('Artists:', artists);
    console.log('ArtistSongs:', artistSongs);
    console.log('FollowedArtists:', followedArtists);
    console.log('Selected Artist:', artist);
  }, [artists, artistSongs, followedArtists, artist]);

  useEffect(() => {
    const isFollowed = followedArtists.some((a) => a.artist_id === artistId);
    setIsFollowing(isFollowed);
    console.log('IsFollowing:', isFollowed);
  }, [followedArtists, artistId]);

  const handleFollowPress = async () => {
    try {
      if (isFollowing) {
        await unfollowArtist(artistId);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã bỏ theo dõi nghệ sĩ',
        });
      } else {
        await followArtist(artistId);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã theo dõi nghệ sĩ',
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái theo dõi:', error.message, error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể thay đổi trạng thái theo dõi',
      });
    }
  };

  const handleSongPress = async (song) => {
    try {
      if (!song.url) {
        throw new Error('URL bài hát không hợp lệ');
      }

      // Sử dụng trực tiếp artistSongs vì nó đã chứa các trường url và artwork
      const songs = artistSongs.map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist || 'Unknown Artist',
        artwork: s.artwork || 'https://via.placeholder.com/150',
        url: s.url,
        duration: parseInt(s.duration.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0)),
      }));

      await TrackPlayer.reset();
      await TrackPlayer.add(songs);

      const songIndex = songs.findIndex((s) => s.id === song.id);
      if (songIndex !== -1) {
        await TrackPlayer.skip(songIndex);
        await TrackPlayer.play();
        setCurrentTrack(song.id, songs[songIndex]);
        setIsPlaying(true);
        setQueue(songs);
        Toast.show({
          type: 'success',
          text1: 'Đang phát',
          text2: `Đang phát bài hát: ${song.title}`,
        });
      } else {
        throw new Error('Không tìm thấy bài hát trong danh sách');
      }
    } catch (error) {
      console.error('Lỗi khi phát bài hát:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể phát bài hát',
      });
    }
  };

  const handleMorePress = (song) => {
    setSelectedSong(song);
    setIsMoreMenuVisible(true);
  };

  const handleCloseMoreMenu = () => {
    setIsMoreMenuVisible(false);
    setSelectedSong(null);
  };

  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handleSongPress(item)}>
      <Text style={styles.songIndex}>{index + 1}</Text>
      <Image
        source={{ uri: item.artwork }}
        style={styles.songArtworkPlaceholder}
        onError={(e) => console.error(`Song image error (${item.title}):`, e.nativeEvent.error)}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songPlays}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton} onPress={() => handleMorePress(item)}>
        <More size={20} color="#999" variant="Linear" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1DB954" style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (error || !artist) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không tìm thấy nghệ sĩ'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{
              uri: artist?.image_url
             ? getFullMinioUrl(artist.image_url)
             : 'https://via.placeholder.com/150',
          }}
          style={[styles.headerImagePlaceholder, { opacity: imageOpacity }]}
          onError={(e) => console.error('Header image error:', e.nativeEvent.error)}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={styles.headerGradient}
        />
        <View style={styles.headerContent}>
          <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
            <Text style={styles.headerTitle}>{artist?.artist_name || 'Unknown Artist'}</Text>
          </Animated.View>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" variant="Linear" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
      >
        <View style={styles.artistInfoContainer}>
                  <Image
                    source={{
                      uri: artist?.image_url
                        ? getFullMinioUrl(artist.image_url)
                        : 'https://via.placeholder.com/150',
                    }}
                    style={styles.artistImagePlaceholder}
                    onError={(e) => console.error('Artist image error:', e.nativeEvent.error)}
                  />
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName}>{artist?.artist_name || 'Unknown Artist'}</Text>
                  </View>
                </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.followButton, isFollowing ? styles.followingButton : {}]}
            onPress={handleFollowPress}
          >
            <Text style={styles.followButtonText}>{isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.sectionTitle}>Giới thiệu</Text>
          <Text style={styles.bioText} numberOfLines={showFullBio ? undefined : 3}>
            {artist?.bio || 'Không có thông tin giới thiệu'}
          </Text>
          {artist?.bio?.length > 150 && (
            <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
              <Text style={styles.readMoreText}>{showFullBio ? 'Thu gọn' : 'Xem thêm'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.songsContainer}>
          <Text style={styles.sectionTitle}>Bài hát phổ biến</Text>
          {artistSongs.length > 0 ? (
            <FlatList
              data={artistSongs}
              renderItem={renderSongItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          ) : (
            <Text style={styles.emptyText}>Không có bài hát</Text>
          )}
        </View>
      </Animated.ScrollView>

      <MoreMenu
        visible={isMoreMenuVisible}
        onClose={handleCloseMoreMenu}
        song={selectedSong}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: HEADER_MAX_HEIGHT,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleContainer: {
    position: 'absolute',
    left: 56,
    right: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT,
    paddingBottom: 80,
  },
  artistInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  artistImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginRight: 16,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  followButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bioContainer: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bioText: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
  },
  readMoreText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  songsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  songIndex: {
    width: 24,
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
  },
  songArtworkPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginLeft: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
  },
  songPlays: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 4,
  },
  moreButton: {
    padding: 8,
  },
});

export default ProfileArtist;