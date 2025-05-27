import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WibuReset from '../../assets/images/wibu/WibuReset';
import apiInstance from '../../service/apiInstance';
import OtpScreen from './OtpScreen';
import Toast from 'react-native-toast-message';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('⚠ Email không được để trống');
      return;
    }
    if (!validateEmail(email)) {
      setError('⚠ Email không hợp lệ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.post('/password/send-otp', { user_email: email }, {
        skipAuth: true, // Bỏ qua auth vì endpoint không cần token
      });
      if (response.success) {
        setCountdown(60);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Đã gửi mã OTP qua email',
        });
        navigation.navigate('OtpScreen', { email });
      } else {
        throw new Error(response.errorMessage || 'Yêu cầu OTP thất bại');
      }
    } catch (err) {
      console.error('Lỗi gửi OTP:', err);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      if (err.response?.status === 400) {
        errorMessage = '⚠ Email không được để trống';
      } else if (err.response?.status === 404) {
        errorMessage = '⚠ Không tìm thấy người dùng với email này';
      } else if (err.response?.status === 429) {
        errorMessage = '⚠ Vui lòng đợi 1 phút trước khi yêu cầu OTP mới';
        setCountdown(60); // Đồng bộ countdown với rate-limit
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <WibuReset width={150} height={150} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>Nhập email của bạn để nhận mã OTP</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[
                styles.button,
                (loading || countdown > 0) && styles.buttonDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={loading || countdown > 0}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? 'Đang gửi...'
                  : countdown > 0
                  ? `Gửi lại sau ${countdown}s`
                  : 'Gửi mã OTP'}
              </Text>
            </TouchableOpacity>
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
    padding: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: '#fff',
    fontSize: 24,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    gap: 24,
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
    color: '#fff',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
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

export default ForgotPasswordScreen;