import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchNormal1, CloseCircle, Play } from 'iconsax-react-native';
import TrackPlayer from 'react-native-track-player';
import apiSearch from '../../service/apiSearch';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { getFullMinioUrl } from '../../service/minioUrl';
import { useAuth } from '../../context/AuthContext';

const SearchingScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const { logout } = useAuth();
  const { setCurrentTrack, togglePlay } = usePlayerStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    fetchDefaultSongSuggestions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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

  const handleSearch = async (query) => {
    console.log('handleSearch called with query:', query);
    setSearchQuery(query);
    setSearchSuggestions([]);
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const results = await apiSearch.search(trimmedQuery);
      console.log('Processed search results:', results);
      setSearchResults(results || { songs: [], artists: [] });
      console.log('Updated searchResults state:', results || { songs: [], artists: [] });
      await saveSearchHistory(trimmedQuery);
    } catch (error) {
      console.error('Search error:', error);
      alert('Lỗi tìm kiếm: ' + error.message);
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
      setSearchSuggestions([]);
      setSongSuggestions([]);
      return;
    }
    try {
      const suggestions = await apiSearch.getSuggestions(query);
      console.log('Suggestions:', suggestions);
      const sortedSuggestions = suggestions
        .sort((a, b) => {
          const aStartsWith = a.value.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.value.toLowerCase().startsWith(query.toLowerCase());
          return bStartsWith - aStartsWith;
        })
        .slice(0, 10);
      setSearchSuggestions(sortedSuggestions);
      const songs = sortedSuggestions
        .filter((item) => item.type === 'song')
        .slice(0, 5);
      setSongSuggestions(songs);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
      setSongSuggestions([]);
      if (error.message.includes('token')) {
        await logout();
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  };

  const fetchDefaultSongSuggestions = async () => {
    try {
      const suggestions = await apiSearch.getSuggestions('');
      console.log('Default suggestions:', suggestions);
      const songs = suggestions.filter((item) => item.type === 'song').slice(0, 5);
      setSongSuggestions(songs);
    } catch (error) {
      console.error('Error fetching default song suggestions:', error);
    }
  };

  const renderSearchSuggestionItem = ({ item }) => {
    const highlightQuery = (text) => {
      if (!searchQuery) return <Text style={styles.suggestionText}>{text}</Text>;
      const index = text.toLowerCase().indexOf(searchQuery.toLowerCase());
      if (index === -1) return <Text style={styles.suggestionText}>{text}</Text>;
      const before = text.slice(0, index);
      const match = text.slice(index, index + searchQuery.length);
      const after = text.slice(index + searchQuery.length);
      return (
        <Text style={styles.suggestionText}>
          {before}
          <Text style={styles.highlightText}>{match}</Text>
          {after}
          {item.type === 'song' ? ` • ${item.artist}` : ''}
        </Text>
      );
    };

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSearch(item.value)}
        activeOpacity={0.7}
      >
        <SearchNormal1 color="#b3b3b3" size={16} />
        {highlightQuery(item.value)}
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleSearch(item)}
      activeOpacity={0.7}
    >
      <SearchNormal1 color="#b3b3b3" size={16} />
      <Text style={styles.historyText}>{item}</Text>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          const newHistory = searchHistory.filter((h) => h !== item);
          setSearchHistory(newHistory);
          AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        }}
      >
        <CloseCircle color="#b3b3b3" size={16} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songSuggestionItem}
      onPress={async () => {
        try {
          console.log('Song suggestion item:', item);
          if (!item.song_audio_url) {
            throw new Error('Missing song_audio_url');
          }
          await TrackPlayer.stop();
          await TrackPlayer.reset();
          const songData = {
            id: item.id,
            title: item.value,
            artist: item.artist,
            artwork: getFullMinioUrl(item.song_image_url) || 'https://via.placeholder.com/48',
            url: getFullMinioUrl(item.song_audio_url),
          };
          await TrackPlayer.add(songData);
          await setCurrentTrack(songData.id, songData);
          await togglePlay();
        } catch (error) {
          console.error('Error playing song suggestion:', error);
          alert('Không thể phát bài hát: ' + error.message);
        }
      }}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: getFullMinioUrl(item.song_image_url) || 'https://via.placeholder.com/48' }}
        style={styles.songImage}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songSuggestionText}>{item.value}</Text>
        <Text style={styles.songSuggestionArtist}>Bài hát • {item.artist}</Text>
      </View>
      <Play color="#1DB954" size={24} />
    </TouchableOpacity>
  );

 const renderSongItem = ({ item }) => {
   console.log('Rendering song item:', item);
   return (
     <TouchableOpacity
       style={styles.resultItem}
       onPress={async () => {
         try {
           await TrackPlayer.stop();
           await TrackPlayer.reset();
           const songData = {
             id: item.song_id,
             title: item.song_title,
             artist: item.artist_name,
             artwork: getFullMinioUrl(item.song_image_url) || 'https://via.placeholder.com/60',
             url: getFullMinioUrl(item.song_audio_url),
           };
           console.log('Song data for playback:', songData);
           await TrackPlayer.add(songData);
           await setCurrentTrack(songData.id, songData);
           await togglePlay();
         } catch (error) {
           console.error('Error playing song:', error);
           alert('Không thể phát bài hát: ' + error.message);
         }
       }}
       activeOpacity={0.7}
     >
       <Image
         source={{ uri: getFullMinioUrl(item.song_image_url) || 'https://via.placeholder.com/60' }}
         style={styles.artwork}
         onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
       />
       <View style={styles.info}>
         <Text style={styles.title}>{item.song_title || 'No title'}</Text>
         <Text style={styles.subtitle}>{item.artist_name || 'No artist'}</Text>
       </View>
       <Play color="#1DB954" size={24} />
     </TouchableOpacity>
   );
 };

 const renderArtistItem = ({ item }) => {
   console.log('Rendering artist item:', item);
   return (
     <TouchableOpacity
       style={styles.resultItem}
       onPress={() => console.log('Navigate to artist:', item.artist_name)}
       activeOpacity={0.7}
     >
       <Image
         source={{ uri: getFullMinioUrl(item.image_url) || 'https://via.placeholder.com/60' }}
         style={styles.artwork}
         onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
       />
       <View style={styles.info}>
         <Text style={styles.title}>{item.artist_name || 'No name'}</Text>
         <Text style={styles.subtitle}>Nghệ sĩ</Text>
       </View>
     </TouchableOpacity>
   );
 };

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
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults(null);
                setSearchSuggestions([]);
                setSongSuggestions([]);
              }}
            >
              <CloseCircle color="#b3b3b3" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
              <Text style={styles.searchButton}>Tìm</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {loading && <Text style={styles.loading}>Đang tìm kiếm...</Text>}
          {!searchQuery && !searchResults && !loading && (
            <Text style={styles.placeholder}>
              Tìm kiếm bài hát, nghệ sĩ hoặc playlist yêu thích của bạn
            </Text>
          )}
          {searchHistory.length > 0 && !searchResults && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
              <FlatList
                data={searchHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
          {searchSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.sectionTitle}>Gợi ý tìm kiếm</Text>
              {['song', 'artist'].map((type) => {
                const items = searchSuggestions.filter((item) => item.type === type);
                if (items.length === 0) return null;
                return (
                  <View key={type} style={styles.suggestionGroup}>
                    <Text style={styles.suggestionGroupTitle}>
                      {type === 'song' ? 'Bài hát' : 'Nghệ sĩ'}
                    </Text>
                    <FlatList
                      data={items}
                      renderItem={renderSearchSuggestionItem}
                      keyExtractor={(item, index) => `${type}-${index}`}
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                );
              })}
            </View>
          )}
          {songSuggestions.length > 0 && (
            <View style={styles.songSuggestionsContainer}>
              <Text style={styles.sectionTitle}>Gợi ý bài hát</Text>
              <FlatList
                data={songSuggestions}
                renderItem={renderSongSuggestionItem}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
          {searchResults && (
            <View style={styles.resultsContainer}>
              {searchResults.songs?.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Bài hát</Text>
                  <FlatList
                    data={searchResults.songs}
                    renderItem={renderSongItem}
                    keyExtractor={(item) => item.song_id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.placeholder}>Không có bài hát nào.</Text>}
                  />
                </View>
              ) : (
                <Text style={styles.placeholder}>Không tìm thấy bài hát cho "{searchQuery}".</Text>
              )}
              {searchResults.artists?.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nghệ sĩ</Text>
                  <FlatList
                    data={searchResults.artists}
                    renderItem={renderArtistItem}
                    keyExtractor={(item) => item.artist_id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.placeholder}>Không có nghệ sĩ nào.</Text>}
                  />
                </View>
              ) : (
                <Text style={styles.placeholder}>Không tìm thấy nghệ sĩ cho "{searchQuery}".</Text>
              )}
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 48,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
  },
  searchButton: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  suggestionGroup: {
    marginBottom: 12,
  },
  suggestionGroupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginBottom: 8,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
  },
  highlightText: {
    color: '#1DB954',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginBottom: 8,
  },
  historyText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  songSuggestionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  songSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songSuggestionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  songSuggestionArtist: {
    color: '#b3b3b3',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  resultsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  resultItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  loading: {
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  placeholder: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});

export default SearchingScreen;