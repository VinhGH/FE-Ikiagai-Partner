import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { loginSuccess, setRole } from '../../../redux/actions/authActions';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES } from '../../../constants/theme';
import Input from '../../../components/shared/Input';
import Button from '../../../components/shared/Button';

export default function MerchantLoginScreen({ navigation }: any) {
  const dispatch = useDispatch();
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
      dispatch(
        loginSuccess(
          'mock_token_merchant_123456',
          { id: '2', name: 'Nhà Hàng Ikigai Sushi', email },
          'merchant'
        )
      );
    }, 1500);
  };

  const handleBackToSelect = () => {
    dispatch(setRole(null));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToSelect} style={styles.backButton}>
            <Text style={styles.backText}>← Đổi vai trò</Text>
          </TouchableOpacity>
          <Text style={styles.emoji}>🍳</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('MerchantRegister')}>
            <Text style={[styles.registerText, { color: COLORS.merchant }]}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  emoji: {
    fontSize: 54,
    marginBottom: SPACING.sm,
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
