import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiInstance from '../../service/apiInstance';
import Toast from 'react-native-toast-message';
import WibuReset from '../../assets/images/wibu/WibuReset';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const token = route.params?.token || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePasswords = () => {
    if (!token) {
      setError('Token không hợp lệ. Vui lòng kiểm tra lại.');
      return false;
    }
    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return false;
    }
    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.post('/password/reset-password', {
        token,
        newPassword,
        confirmPassword,
      }, {
        skipAuth: true,
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.',
        });
        navigation.navigate('LoginScreen');
      } else {
        throw new Error(response.errorMessage || 'Đặt lại mật khẩu thất bại');
      }
    } catch (err) {
      console.error('Lỗi đặt lại mật khẩu:', err);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      if (err.response?.status === 400) {
        errorMessage = '⚠ Token không hợp lệ hoặc mật khẩu không hợp lệ';
      } else if (err.response?.data?.errorMessage) {
        errorMessage = `⚠ ${err.response.data.errorMessage}`;
      }
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage.replace('⚠ ', ''),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} forceInset={{ top: 'always', bottom: 'always' }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <WibuReset width={150} height={150} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập mật khẩu mới của bạn</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                placeholderTextColor="#888"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError('');
                }}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError('');
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1DB954',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;