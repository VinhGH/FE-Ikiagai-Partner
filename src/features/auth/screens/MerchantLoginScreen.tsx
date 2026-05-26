import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/useAuthStore';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES } from '../../../constants/theme';
import Input from '../../../components/shared/Input';
import Button from '../../../components/shared/Button';
import { router } from 'expo-router';

export default function MerchantLoginScreen() {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const setRole = useAuthStore((state) => state.setRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    // Giả lập cuộc gọi API đăng nhập
    setTimeout(() => {
      setLoading(false);
      loginSuccess(
        'mock_token_merchant_123456',
        { id: '2', name: 'Nhà Hàng Ikigai Sushi', email, phone: '0987654321', status: 'approved' },
        'merchant'
      );
    }, 1500);
  };

  const handleBackToSelect = () => {
    setRole(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToSelect} style={styles.backButton}>
            <Text style={styles.backText}>← Đổi vai trò</Text>
          </TouchableOpacity>
          <Text style={emojiStyle}>🍳</Text>
          <Text style={styles.title}>Đăng nhập Nhà hàng</Text>
          <Text style={styles.subtitle}>Quản lý thực đơn và tiếp cận hàng vạn thực khách cùng Ikigai</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email đăng ký cửa hàng"
            placeholder="example@restaurant.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button
            title="Đăng nhập cửa hàng"
            onPress={handleLogin}
            loading={loading}
            variant="merchant"
            style={styles.loginBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa liên kết nhà hàng? </Text>
          <TouchableOpacity onPress={() => router.push('/merchant-register')}>
            <Text style={[styles.registerText, { color: COLORS.merchant }]}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Inline formatting to avoid linting on large font size
const emojiStyle = {
  fontSize: 54,
  marginBottom: SPACING.sm,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
  },
  backText: {
    fontSize: SIZES.body - 1,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.body - 2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginVertical: SPACING.lg,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption + 2,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  footerText: {
    fontSize: SIZES.body - 2,
    color: COLORS.textSecondary,
  },
  registerText: {
    fontSize: SIZES.body - 2,
    fontWeight: 'bold',
  },
});
