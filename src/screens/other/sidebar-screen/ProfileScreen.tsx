import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDown2, ArrowLeft, Calendar, Camera, Star } from 'iconsax-react-native';
import { useNavigation } from '@react-navigation/native';
import useUserStore from '../../../stores/useUserStore';

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
  imageUri: string;
  followers: number;
  following: number;
  premiumStatus: boolean;
  createdAt: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    initializeAuth,
    fetchUser,
    updateUser,
    clearError,
  } = useUserStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    user_name: '',
    full_name: '',
    email: '',
    image_url: '',
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditedProfile({
        user_name: user.user_name || '',
        full_name: user.full_name || '',
        email: user.email || '',
        image_url: user.image_url || '',
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser(editedProfile, null);
      setIsEditModalVisible(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const EditProfileModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditModalVisible}
      onRequestClose={() => setIsEditModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              style={styles.closeButton}
            >
              <ArrowDown2 color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
            <View style={styles.headerRight} />
          </View>

          <ScrollView
            style={styles.modalForm}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={{ uri: editedProfile.image_url || 'https://i.pravatar.cc/150' }}
                    style={styles.modalProfileImage}
                  />
                  <TouchableOpacity style={styles.changePhotoButton}>
                    <Camera size={22} color="#1DB954" />
                    <Text style={styles.changePhotoText}>Thay đổi ảnh đại diện</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tên người dùng</Text>
                    <TextInput
                      style={styles.input}
                      value={editedProfile.user_name}
                      onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, user_name: text }))}
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Họ và tên</Text>
                    <TextInput
                      style={styles.input}
                      value={editedProfile.full_name}
                      onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, full_name: text }))}
                      placeholderTextColor="#666"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={editedProfile.email}
                      onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      placeholderTextColor="#666"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            clearError();
            initializeAuth();
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Vui lòng đăng nhập để xem hồ sơ</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.retryButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.profileImageWrapper}>
            <Image source={{ uri: user.image_url }} style={styles.profileImage} />
            {user.is_premium && (
              <View style={styles.premiumBadge}>
                <Star size={12} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.username}>{user.user_name}</Text>
          <Text style={styles.fullName}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.following_count}</Text>
              <Text style={styles.statLabel}>Nghệ sĩ đang theo dõi</Text>
            </View>
          </View>

          <View style={styles.memberSinceContainer}>
            <Calendar size={16} color="#666" />
            <Text style={styles.memberSinceText}>
              Thành viên từ {formatDate(user.created_at)}
            </Text>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <EditProfileModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#1DB954',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#1DB954',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fullName: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 4,
  },
  email: {
    color: '#666',
    fontSize: 14,
    marginBottom: 24,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    width: '80%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  memberSinceText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    height: '95%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  modalForm: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  modalProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#1DB954',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 20,
    gap: 8,
  },
  changePhotoText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    marginTop: 20,
    gap: 24,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  saveButton: {
    backgroundColor: '#1DB954',
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;