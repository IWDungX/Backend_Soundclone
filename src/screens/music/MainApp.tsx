import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from './HomeScreen';
import SearchingScreen from './SearchingScreen';
import PlaylistScreen from './PlaylistScreen';
import MusicPlayerBar from '../../components/MusicPlayerBar';
import { Home, SearchNormal1, MusicPlaylist } from 'iconsax-react-native';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 50;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'rgba(18, 18, 18, 0.9)',
            borderTopColor: 'rgba(255, 255, 255, 0.2)',
            paddingBottom: insets.bottom,
            height: TAB_BAR_HEIGHT + insets.bottom,
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
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  musicBarContainer: {
    position: 'absolute',
    bottom: '6%',
    left: 0,
    right: 0,
  },
});

export default MainApp;
