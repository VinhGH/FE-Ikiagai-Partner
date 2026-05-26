import "../../global.css";
import { Stack, Redirect, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  const { isLoggedIn, role, user, isLoading, hydrate } = useAuthStore();
  const segments = useSegments();

  // Khôi phục token và vai trò từ storage khi khởi động ứng dụng
  useEffect(() => {
    hydrate();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const currentGroup = segments[0];

  // 1. Chưa chọn vai trò -> Bắt buộc chọn vai trò trước
  if (!role) {
    if (currentGroup !== '(onboarding)') {
      return (
        <SafeAreaProvider>
          <Redirect href="/(onboarding)/role-selection" />
        </SafeAreaProvider>
      );
    }
  } 
  // 2. Đã chọn vai trò nhưng chưa đăng nhập -> Đưa vào luồng Auth của vai trò đó
  else if (!isLoggedIn) {
    const isAuthGroup = currentGroup === '(auth)';
    if (!isAuthGroup) {
      const loginRoute = role === 'driver' ? '/driver-login' : '/merchant-login';
      return (
        <SafeAreaProvider>
          <Redirect href={loginRoute} />
        </SafeAreaProvider>
      );
    }
  } 
  // 3. Đã đăng nhập nhưng đang chờ xét duyệt hồ sơ đối tác
  else if (user?.status === 'pending') {
    if (segments[segments.length - 1] !== 'pending-approval') {
      return (
        <SafeAreaProvider>
          <Redirect href="/pending-approval" />
        </SafeAreaProvider>
      );
    }
  } 
  // 4. Đăng nhập thành công và hồ sơ đã duyệt -> Đưa vào dashboard vai trò tương ứng
  else {
    const expectedGroup = role === 'driver' ? '(driver)' : '(merchant)';
    if (currentGroup !== expectedGroup && segments[segments.length - 1] !== 'pending-approval') {
      const homeRoute = role === 'driver' ? '/dashboard' : '/home';
      return (
        <SafeAreaProvider>
          <Redirect href={homeRoute} />
        </SafeAreaProvider>
      );
    }
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
