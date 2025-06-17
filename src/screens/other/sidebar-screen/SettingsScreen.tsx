
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowRight,
  Star1,
  MessageQuestion,
  MessageText,
  SecuritySafe,
  Trash,
} from 'iconsax-react-nativejs';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleRateUs = () => {
    // Link to app store or play store
    Linking.openURL('https://play.google.com/store');
  };

  const handleHelp = () => {
    navigation.navigate('ComingSoonScreen', { feature: 'Hướng dẫn và hỗ trợ' });
  };

  const handleFeedback = () => {
    navigation.navigate('ComingSoonScreen', { feature: 'Góp ý' });
  };

  const handleClearCache = () => {
    navigation.navigate('ComingSoonScreen', { feature: 'Xóa bộ nhớ đệm' });
  };

  const handlePrivacy = () => {
    navigation.navigate('ComingSoonScreen', { feature: 'Quyền riêng tư' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleRateUs}>
            <View style={styles.settingLeft}>
              <Star1 size={22} color="#1DB954" variant="Bold" />
              <Text style={styles.settingText}>Đánh giá chúng tôi</Text>
            </View>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleHelp}>
            <View style={styles.settingLeft}>
              <MessageQuestion size={22} color="#1DB954" variant="Bold" />
              <Text style={styles.settingText}>Hướng dẫn và hỗ trợ</Text>
            </View>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleFeedback}>
            <View style={styles.settingLeft}>
              <MessageText size={22} color="#1DB954" variant="Bold" />
              <Text style={styles.settingText}>Góp ý</Text>
            </View>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo mật & Dữ liệu</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <SecuritySafe size={22} color="#1DB954" variant="Bold" />
              <Text style={styles.settingText}>Quyền riêng tư</Text>
            </View>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Trash size={22} color="#1DB954" variant="Bold" />
              <Text style={styles.settingText}>Xóa bộ nhớ đệm</Text>
            </View>
            <ArrowRight size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SoundClone v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
     padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#b3b3b3',
  },
});

export default SettingsScreen;