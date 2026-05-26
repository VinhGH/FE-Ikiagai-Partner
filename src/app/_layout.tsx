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

  const currentGroup = segments[0] as string | undefined;

  // Tính toán href cần redirect (nếu có)
  let redirectHref: string | null = null;

  if (!role) {
    // 1. Chưa chọn vai trò -> Bắt buộc chọn vai trò trước
    if (currentGroup !== '(onboarding)') {
      redirectHref = '/role-selection';
    }
  } else if (!isLoggedIn) {
    // 2. Đã chọn vai trò nhưng chưa đăng nhập -> Đưa vào luồng Auth
    if (currentGroup !== '(auth)') {
      redirectHref = role === 'driver' ? '/driver-login' : '/merchant-login';
    }
  } else if (user?.status === 'pending') {
    // 3. Đăng nhập nhưng đang chờ duyệt hồ sơ
    if (segments[segments.length - 1] !== 'pending-approval') {
      redirectHref = '/pending-approval';
    }
  } else {
    // 4. Đăng nhập thành công -> Đưa vào dashboard tương ứng
    // Các route chia sẻ (shared) được truy cập bởi cả merchant lẫn driver
    const SHARED_ROUTES = ['chat', 'pending-approval'];
    const expectedGroup = role === 'driver' ? '(driver)' : '(merchant)';
    const isSharedRoute = currentGroup !== undefined && SHARED_ROUTES.includes(currentGroup);
    if (
      currentGroup !== expectedGroup &&
      !isSharedRoute &&
      segments[segments.length - 1] !== 'pending-approval'
    ) {
      redirectHref = role === 'driver' ? '/dashboard' : '/merchant-orders';
    }
  }

  // Luôn render cùng một cây component để tránh unmount/remount không cần thiết
  return (
    <SafeAreaProvider>
      {redirectHref ? <Redirect href={redirectHref as any} /> : null}
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
