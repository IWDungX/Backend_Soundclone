import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,g
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchNormal1, CloseCircle, Play } from 'iconsax-react-nativejs';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';
import apiSearch from '../../service/apiSearch';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { getFullMinioUrl } from '../../service/minioUrl';
import { useAuth } from '../../context/AuthContext';

const SearchingScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const { logout } = useAuth();
  const { setCurrentTrack, togglePlay } = usePlayerStore(); // Lấy hàm từ usePlayerStore

  const SEARCH_HISTORY_KEY = 'search_history';
  const MAX_HISTORY_ITEMS = 5;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = JSON.parse(
          (await AsyncStorage.getItem(SEARCH_HISTORY_KEY)) || '[]'
        );
        setSearchHistory(history);
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    };
    loadHistory();
  }, []);

  const saveSearchHistory = async (query) => {
    const updatedHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, MAX_HISTORY_ITEMS);
    try {
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
      setSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setSuggestions([]);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const results = await apiSearch.search(query);
      setSearchResults(results);
      await saveSearchHistory(query);
    } catch (error) {
      console.error('Search error:', error);
      if (error.message.includes('token')) {
        await logout();
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const suggestions = await apiSearch.getSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      if (error.message.includes('token')) {
        await logout();
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  };

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSearch(item.value)}
    >
      <SearchNormal1 color="#b3b3b3" />
      <Text style={styles.suggestionText}>{item.value}</Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleSearch(item)}
    >
      <Text style={styles.historyText}>{item}</Text>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          const newHistory = searchHistory.filter((h) => h !== item);
          setSearchHistory(newHistory);
          AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        }}
      >
        <CloseCircle color="#b3b3b3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={async () => {
        try {
          // Dừng và reset TrackPlayer
          await TrackPlayer.stop();
          await TrackPlayer.reset();

          // Thiết lập bài hát mới
          const songData = {
            id: item.song_id,
            title: item.song_title,
            artist: item.artist_name,
            artwork: getFullMinioUrl(item.song_image_url),
            url: getFullMinioUrl(item.song_audio_url), // Đảm bảo URL hợp lệ
          };

          // Thêm bài hát vào queue của TrackPlayer
          await TrackPlayer.add({
            id: songData.id,
            url: songData.url,
            title: songData.title,
            artist: songData.artist,
            artwork: songData.artwork,
          });

          // Cập nhật trạng thái trong store
          await setCurrentTrack(songData.id, songData);

          // Phát bài hát
          await togglePlay();
        } catch (error) {
          console.error("Error playing song:", error);
          Alert.alert('Lỗi', 'Không thể phát bài hát này. Vui lòng thử lại.');
        }
      }}
    >
      <Image source={{ uri: getFullMinioUrl(item.song_image_url) }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.song_title}</Text>
        <Text style={styles.subtitle}>{item.artist_name}</Text>
      </View>
      <Play color="#1DB954" size={20} />
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: getFullMinioUrl(item.image_url) }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.artist_name}</Text>
      </View>
    </View>
  );

  const renderPlaylistItem = ({ item }) => (
    <View style={styles.resultItem}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.playlist_title}</Text>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.searchBar}>
          <SearchNormal1 color="#b3b3b3" size={20} />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm bài hát, nghệ sĩ, hoặc playlist"
            placeholderTextColor="#b3b3b3"
            value={searchQuery}
            onChangeText={fetchSuggestions}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults(null);
              setSuggestions([]);
            }}>
              <CloseCircle color="#b3b3b3" size={20} />
            </TouchableOpacity>
          ) : null}
        </View>

        {searchQuery && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item, index) => index.toString()}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {!searchQuery && searchHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Gần đây</Text>
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={styles.clearText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchHistory}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {loading && <Text style={styles.loading}>Đang tải...</Text>}
        {searchResults && (
          <View style={styles.resultsContainer}>
            {searchResults.songs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bài hát</Text>
                <FlatList
                  data={searchResults.songs}
                  renderItem={renderSongItem}
                  keyExtractor={(item) => item.song_id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
            {searchResults.artists.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nghệ sĩ</Text>
                <FlatList
                  data={searchResults.artists}
                  renderItem={renderArtistItem}
                  keyExtractor={(item) => item.artist_id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
            {searchResults.playlists.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Playlist</Text>
                <FlatList
                  data={searchResults.playlists}
                  renderItem={renderPlaylistItem}
                  keyExtractor={(item) => item.playlist_id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
          </View>
        )}
        {!searchQuery && !searchResults && !loading && (
          <Text style={styles.placeholder}>
            Tìm kiếm bài hát, nghệ sĩ hoặc playlist yêu thích của bạn
          </Text>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 40,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#282828',
    borderRadius: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  historyContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#1DB954',
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
  },
  historyText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  resultsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#282828',
    borderRadius: 4,
    marginRight: 10,
    width: 200,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  placeholder: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default SearchingScreen;