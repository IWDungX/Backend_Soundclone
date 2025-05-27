import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WibuRegister from '../../assets/images/wibu/WibuRegister';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import apiInstance from '../../service/apiInstance';
import AuthService from '../../service/auth';
import Toast from 'react-native-toast-message';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const validateForm = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm
    ) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Địa chỉ email không hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.post('/register', {
        user_name: formData.username,
        user_email: formData.email,
        user_password: formData.password,
        user_password_confirm: formData.passwordConfirm,
      }, {
        skipAuth: true,
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực',
        });
        navigation.navigate('Welcome');
      } else {
        throw new Error(response.errorMessage || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      if (err.response?.status === 400) {
        errorMessage = `⚠ ${err.response.data.errorMessage || 'Thông tin không hợp lệ'}`;
      } else if (err.response?.status === 409) {
        errorMessage = '⚠ Email đã được đăng ký';
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (!userInfo.idToken) {
        throw new Error('Không lấy được Google ID token');
      }
      const response = await apiInstance.post('/register', {
        user_name: userInfo.user.name || 'Google User',
        user_email: userInfo.user.email,
        user_google_uid: userInfo.user.id,
      }, {
        skipAuth: true,
      });
      if (response.success) {
        if (response.user_id && response.user_email) {
          await AuthService.saveUserInfo({
            user_id: response.user_id,
            user_email: response.user_email,
            user_name: response.user_name,
            // Giả sử backend trả về token khi đăng ký Google thành công
            // token: response.token,
          });
        }
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Đăng ký với Google thành công!',
        });
        navigation.navigate('Welcome');
      } else {
        throw new Error(response.errorMessage || 'Đăng ký Google thất bại');
      }
    } catch (err) {
      console.error('Lỗi đăng ký Google:', err);
      let errorMessage = 'Đăng ký với Google thất bại.';
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = '⚠ Đăng nhập Google bị hủy';
      } else if (err.code === statusCodes.IN_PROGRESS) {
        errorMessage = '⚠ Đăng nhập Google đang xử lý';
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = '⚠ Dịch vụ Google Play không khả dụng';
      } else if (err.response?.status === 409) {
        errorMessage = '⚠ Email đã được đăng ký';
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

  const renderInput = ({
    icon,
    placeholder,
    field,
    secure = false,
    showSecure,
    toggleSecure,
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={formData[field]}
          onChangeText={(text) => handleChange(field, text)}
          secureTextEntry={secure && !showSecure}
          keyboardType={field === 'email' ? 'email-address' : 'default'}
          autoCapitalize={field === 'email' ? 'none' : 'sentences'}
        />
        {secure && (
          <TouchableOpacity style={styles.eyeIcon} onPress={toggleSecure}>
            <Text>{showSecure ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} forceInset={{ top: 'always', bottom: 'always' }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <WibuRegister width={170} height={170} />
        </View>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Bắt đầu hành trình mới!</Text>
            <Text style={styles.subtitle}>SoundClone sẽ đồng hành cùng bạn</Text>
          </View>
          <View style={styles.formContainer}>
            {renderInput({
              icon: '👤',
              placeholder: 'Nhập họ và tên',
              field: 'username',
            })}
            {renderInput({
              icon: '📧',
              placeholder: 'Nhập email của bạn',
              field: 'email',
            })}
            {renderInput({
              icon: '🔒',
              placeholder: 'Nhập mật khẩu',
              field: 'password',
              secure: true,
              showSecure: showPassword,
              toggleSecure: () => setShowPassword(!showPassword),
            })}
            {renderInput({
              icon: '🔒',
              placeholder: 'Nhập lại mật khẩu',
              field: 'passwordConfirm',
              secure: true,
              showSecure: showConfirmPassword,
              toggleSecure: () => setShowConfirmPassword(!showConfirmPassword),
            })}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={[styles.googleButton, loading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon width={20} height={20} style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
            </TouchableOpacity>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Bạn đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}
              >
                <Text style={styles.registerLink}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  dividerText: {
    color: '#fff',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#fff',
  },
  registerLink: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '600',
  },
});

export default RegisterScreen;