import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiInstance from '../../service/apiInstance';
import ResetPasswordScreen from './ResetPasswordScreen';
import Toast from 'react-native-toast-message';

const OtpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email || '';
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(300);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (otpExpiry > 0) {
      const timer = setInterval(() => setOtpExpiry((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [otpExpiry]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCountdown]);

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.post('/password/send-otp', { user_email: email }, {
        skipAuth: true,
      });
      if (response.success) {
        setOtpExpiry(300);
        setResendCountdown(60);
        setOtpValues(['', '', '', '', '', '']);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Mã OTP mới đã được gửi đến email của bạn',
        });
      } else {
        throw new Error(response.errorMessage || 'Gửi lại OTP thất bại');
      }
    } catch (err) {
      console.error('Lỗi gửi lại OTP:', err);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      if (err.response?.status === 400) {
        errorMessage = '⚠ Email không hợp lệ';
      } else if (err.response?.status === 404) {
        errorMessage = '⚠ Không tìm thấy người dùng';
      } else if (err.response?.status === 429) {
        errorMessage = '⚠ Vui lòng đợi 1 phút trước khi yêu cầu OTP mới';
        setResendCountdown(60);
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

  const handleVerifyOtp = async () => {
    if (loading || otpExpiry === 0) {
      setError(otpExpiry === 0 ? 'Mã OTP đã hết hạn' : 'Đang xử lý');
      return;
    }
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đủ 6 số');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiInstance.post('/password/verify-otp', { user_email: email, otp: otpCode }, {
        skipAuth: true,
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: response.message || 'Xác nhận OTP thành công',
        });
        navigation.navigate('ResetPasswordScreen', { token: response.token, email });
      } else {
        throw new Error(response.errorMessage || 'Xác nhận OTP thất bại');
      }
    } catch (err) {
      console.error('Lỗi xác nhận OTP:', err);
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      if (err.response?.status === 400) {
        errorMessage = '⚠ OTP không hợp lệ hoặc đã hết hạn';
      } else if (err.response?.status === 404) {
        errorMessage = '⚠ Không tìm thấy người dùng';
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

  const handleOtpChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otpValues];
      newOtp[index] = value;
      setOtpValues(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (newOtp.join('').length === 6) {
        Keyboard.dismiss();
      }
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
          <Text style={styles.title}>Xác thực OTP</Text>
          <Text style={styles.subtitle}>
            Mã xác thực đã được gửi đến{'\n'}
            {email}
          </Text>
          <View style={styles.otpContainer}>
            {otpValues.map((value, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                value={value}
                onChangeText={(text) => handleOtpChange(index, text)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>
          <Text style={styles.countdown}>
            Thời gian còn lại: {Math.floor(otpExpiry / 60)}:
            {(otpExpiry % 60).toString().padStart(2, '0')}
          </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={resendCountdown > 0 || loading}
          >
            <Text
              style={[
                styles.resend,
                (resendCountdown > 0 || loading) && styles.resendDisabled,
              ]}
            >
              Gửi lại OTP{' '}
              {resendCountdown > 0 ? `(${resendCountdown}s)` : ''}
            </Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otpValues.join('').length !== 6 || loading) &&
                styles.buttonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={otpValues.join('').length !== 6 || loading}
          >
            <Text style={styles.verifyButtonText}>
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 16,
  },
  otpInput: {
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    color: '#fff',
  },
  countdown: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1DB954',
  },
  resend: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1DB954',
  },
  resendDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 8,
  },
  verifyButton: {
    backgroundColor: '#1DB954',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OtpScreen;