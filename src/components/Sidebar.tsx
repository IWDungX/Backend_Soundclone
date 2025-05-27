// components/Sidebar.tsx
import React from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Notification, Clock, Setting2, InfoCircle, Logout, ArrowRight } from 'iconsax-react-nativejs';
import useUserStore from '../stores/useUserStore';
import LoginScreen from '../screens/auth/LoginScreen';
import History from '../screens/other/sidebar-screen/History';

const COLORS = {
  background: '#121212',
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.6)',
  },
};

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  userData: {
    user_name?: string;
    user_email?: string;
    user_avatar_url?: string;
    premium?: boolean;
  } | null;
  translateX: Animated.Value;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, onClose, userData, translateX }) => {
  const navigation = useNavigation();
  const { user, logout, isLoading: userLoading, error: userError } = useUserStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất, thử lại sau');
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: <User color="#ffffff" variant="Bold" />,
      title: 'Hồ sơ',
      onPress: () => navigation.navigate('ProfileScreen'),
    },
    {
      icon: <Notification color="#ffffff" variant="Bold" />,
      title: 'Thông báo',
      onPress: () => navigation.navigate('FavoriteSongsScreen'),
    },
    {
      icon: <Clock color="#ffffff" variant="Bold" />,
      title: 'Lịch sử',
      onPress: () => navigation.navigate('History'),
    },
    {
      icon: <Setting2 color="#ffffff" variant="Bold" />,
      title: 'Cài đặt',
      onPress: () => navigation.navigate('SettingsScreen'),
    },
    {
      icon: <InfoCircle color="#ffffff" variant="Bold" />,
      title: 'Giới thiệu',
      onPress: () => navigation.navigate('IntroductionScreen'),
    },
    {
      icon: <Logout color="#ffffff" variant="Bold" />,
      title: 'Đăng xuất',
      onPress: handleLogout,
    },
  ];

  if (!isVisible) return null;

//   if (userLoading) {
//     return (
//       <Animated.View
//         style={[
//           styles.animatedContainer,
//           { transform: [{ translateX }] },
//         ]}
//       >
//         <SafeAreaView style={styles.container}>
//           <ActivityIndicator size="large" color="#1DB954" />
//         </SafeAreaView>
//       </Animated.View>
//     );
//   }

  if (userError) {
    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          { transform: [{ translateX }] },
        ]}
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>Lỗi: {userError}</Text>
          <TouchableOpacity onPress={() => useUserStore.getState().initializeAuth()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          transform: [{ translateX }],
        },
      ]}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ArrowRight color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Image
            source={{ uri: userData?.user_avatar_url || 'https://picsum.photos/seed/user123/100/100' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userData?.user_name || 'Tên không rõ'}</Text>
          <Text style={styles.userEmail}>{userData?.user_email || 'Email không rõ'}</Text>
          {userData?.premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              {item.icon}
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: COLORS.background,
    zIndex: 1000,
    elevation: 5,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  userInfo: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  retryText: {
    color: '#1DB954',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});

export default Sidebar;