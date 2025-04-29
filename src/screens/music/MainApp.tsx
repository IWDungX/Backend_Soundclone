import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context'; // Thêm SafeAreaView
import HomeScreen from './HomeScreen';
import SearchingScreen from './SearchingScreen';
import PlaylistScreen from './PlaylistScreen';
import { Home, SearchNormal1, MusicPlaylist } from 'iconsax-react-native';
import ProfileScreen from '../other/sidebar-screen/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainApp = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#121212',
            borderTopColor: '#1DB954',
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
        <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Trang chủ' }} />
        <Tab.Screen name="SearchingScreen" component={SearchingScreen} options={{ title: 'Tìm kiếm' }} />
        <Tab.Screen name="PlaylistScreen" component={PlaylistScreen} options={{ title: 'Thư viện' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default MainApp;