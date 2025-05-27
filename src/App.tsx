import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import OtpScreen from './screens/auth/OtpScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import NowPlayingScreen from './screens/music/NowPlayingScreen';
import SongListScreen from './screens/music/SongListScreen';
import MainApp from './screens/music/MainApp';
import ProfileScreen from './screens/other/sidebar-screen/ProfileScreen';
import IntroductionScreen from './screens/other/sidebar-screen/IntroductionScreen';
import History from './screens/other/sidebar-screen/History';
import { useSetupPlayer } from './hooks/useSetupTrackPlayer';


const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor="#121212"
        barStyle="light-content"
        translucent={false}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen name="NowPlayingScreen" component={NowPlayingScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="IntroductionScreen" component={IntroductionScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="SongListScreen" component={SongListScreen} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
            <Stack.Screen name="OtpScreen" component={OtpScreen} />
            <Stack.Screen name="History" component={History} />
          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
            <Stack.Screen name="OtpScreen" component={OtpScreen} />
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen name="NowPlayingScreen" component={NowPlayingScreen} />
            <Stack.Screen name="SongListScreen" component={SongListScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="IntroductionScreen" component={IntroductionScreen} />
            <Stack.Screen name="History" component={History} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const onLoad = async () => {
    console.log('TrackPlayer setup completed.');
  };

  const onError = (error) => {
    console.error('TrackPlayer setup error:', error);
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: 'Không thể khởi tạo trình phát nhạc.',
    });
  };

  useSetupPlayer({ onLoad, onError });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});

export default App;