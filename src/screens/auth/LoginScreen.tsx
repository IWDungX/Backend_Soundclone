import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EncryptedStorage from 'react-native-encrypted-storage';
import apiInstance from '../../service/apiInstance';
import AuthService from '../../service/auth';
import WibuLogin from '../../assets/images/wibu/WibuLogin';
import GoogleIcon from '../../assets/icons/GoogleIcon';
import MainApp from '../music/MainApp';
import { Lock, Sms, Eye, EyeSlash, ArrowLeft } from 'iconsax-react-nativejs';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

   const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }
  }, [isAuthenticated]);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // TODO: Tích hợp Google Sign-In
      // Lấy user_google_uid từ Google Sign-In
      const user_google_uid = 'fake-google-uid'; // Thay bằng UID thực từ Google Sign-In

      // Gửi yêu cầu đăng nhập Google đến endpoint /login
      const response = await apiInstance.post(
        '/login',
        { user_google_uid },
        { skipAuth: true }
      );

      if (!response.success) {
        throw new Error(response.errorMessage || 'Đăng nhập Google thất bại');
      }

      // Lưu token và refreshToken
      await EncryptedStorage.setItem('token', response.token);
      await EncryptedStorage.setItem('refreshToken', response.refreshToken);

      // Điều hướng đến màn hình Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    } catch (err) {
      setError(err.message || 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Lỗi đăng nhập', error);
    }
  }, [error]);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#ffffff"/>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng nhập</Text>
        </View>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <WibuLogin width={170} height={170} />
          </View>
          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Chào mừng trở lại!</Text>
              <Text style={styles.subtitle}>SoundClone rất nhớ bạn</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Sms color="#ffffff" variant="Bold"/>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock color="#ffffff" size={22} variant="Bold"/>
                  <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#888"
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={24} color="#fff" variant="Linear" />
                    ) : (
                      <EyeSlash size={24} color="#fff" variant="Linear" />
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                  >
                    <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
                <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RegisterScreen')}
                >
                  <Text style={styles.registerLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: { marginRight: 16 },
  backIcon: { color: '#fff', fontSize: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  container: { flex: 1, padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  content: { flex: 1, justifyContent: 'center', gap: 24 },
  textContainer: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#ccc' },
  formContainer: { gap: 16 },
  inputContainer: { position: 'relative' },
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
  inputIcon: { color: '#fff', marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16, height: '100%' },
  eyeIcon: { paddingHorizontal: 12 },
  forgotPasswordContainer: { alignItems: 'flex-end', marginTop: 8 },
  forgotPasswordText: { color: '#1DB954', fontSize: 14 },
  button: {
    backgroundColor: '#1DB954',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#fff', opacity: 0.3 },
  dividerText: { color: '#fff', fontSize: 14 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 25,
  },
  googleIcon: { width: 20, height: 20 },
  googleButtonText: { color: '#000', fontSize: 16 },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
  },
  registerText: { fontSize: 14, color: '#fff' },
  registerLink: { fontSize: 14, color: '#1DB954', fontWeight: '600' },
});

export default LoginScreen;