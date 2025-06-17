import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
import { ArrowDown2, ArrowLeft, Calendar } from 'iconsax-react-native';
import { useNavigation } from '@react-navigation/native';
import useUserStore from '../../../stores/useUserStore';

// Types
interface UserProfile {
    user_name: string;
    user_email: string;
    is_premium: boolean;
    user_created_at: string;
    following_count: number;
}

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, isLoading, error, fetchUser, updateUser } = useUserStore();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedName, setEditedName] = useState<string>('');

    // Lấy thông tin người dùng khi màn hình được mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleEditProfile = () => {
        if (user) {
            setEditedName(user.user_name);
            setIsEditModalVisible(true);
        }
    };

    const handleSaveProfile = async () => {
        if (!editedName || editedName.trim() === '') {
            alert('Tên người dùng không được để trống');
            return;
        }
        try {
            await updateUser(editedName);
            setIsEditModalVisible(false);
        } catch (error: any) {
            alert('Lỗi khi cập nhật: ' + (error.message || 'Không thể cập nhật hồ sơ'));
        }
    };

    const formatDate = (dateString: string) => {
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
                                <View style={styles.formSection}>
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.inputLabel}>Tên người dùng</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={editedName}
                                            onChangeText={setEditedName}
                                            placeholder="Nhập tên người dùng"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.saveButton}
                                    onPress={handleSaveProfile}
                                >
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
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Lỗi: {error}</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Không tìm thấy thông tin người dùng</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hồ sơ</Text>
                    <View style={styles.headerRight} />
                </View>

                {/* User info section */}
                <View style={styles.userInfoContainer}>
                    <Text style={styles.username}>{user.user_name}</Text>
                    {user.is_premium && (
                        <Text style={styles.premiumBadge}>Premium</Text>
                    )}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{user.following_count}</Text>
                            <Text style={styles.statLabel}>Nghệ sĩ đang theo dõi</Text>
                        </View>
                    </View>

                    <View style={styles.memberSinceContainer}>
                        <Calendar size={16} color="#666" />
                        <Text style={styles.memberSinceText}>
                            Thành viên từ {formatDate(user.user_created_at)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEditProfile}
                    >
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
    username: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    premiumBadge: {
        color: '#fff',
        fontSize: 14,
        backgroundColor: '#1DB954',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
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
        height: '50%',
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
    formSection: {
        marginTop: 20,
        gap: 24,
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