import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRoute } from '@react-navigation/native';
import HomeScreen from './HomeScreen';
import SearchingScreen from './SearchingScreen';
import PlaylistScreen from './PlaylistScreen';
import MusicPlayerBar from '../../components/MusicPlayerBar';
import { Home, SearchNormal1, MusicPlaylist } from 'iconsax-react-native';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const route = useRoute();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
             backgroundColor: 'rgba(18, 18, 18, 0.9)',
             borderTopColor: 'rgba(255, 255, 255, 0.2)',
             position: 'absolute',
          },
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === 'HomeScreen') {
              return <Home size={size} color={color} variant={focused ? 'Bold' : 'Outline'} />;
            } else if (route.name === 'SearchingScreen') {
              return <SearchNormal1 size={size} color={color} variant={focused ? 'Bold' : 'Outline'} />;
            } else if (route.name === 'PlaylistScreen') {
              return <MusicPlaylist size={size} color={color} variant={focused ? 'Bold' : 'Outline'} />;
            }
          },
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: 'white',
        })}
        initialRouteName="HomeScreen"
      >
        <Tab.Screen name="HomeScreen" component={HomeScreen} />
        <Tab.Screen name="SearchingScreen" component={SearchingScreen} />
        <Tab.Screen name="PlaylistScreen" component={PlaylistScreen} />
      </Tab.Navigator>

      <View style={styles.musicBarContainer}>
        <MusicPlayerBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  musicBarContainer: {
    position: 'absolute',
    bottom: 49,
    left: 0,
    right: 0,
  },
});

export default MainApp;
