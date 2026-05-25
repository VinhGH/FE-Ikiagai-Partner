import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import MerchantNavigator from './MerchantNavigator';
import RoleSelectionScreen from '../screens/onboarding/RoleSelectionScreen';

export type RootStackParamList = {
  RoleSelection: undefined;
  Auth: { role: 'driver' | 'merchant' };
  DriverApp: undefined;
  MerchantApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoggedIn, role } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!role ? (
          // 1. Chưa chọn vai trò -> Bắt buộc chọn vai trò trước
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        ) : !isLoggedIn ? (
          // 2. Đã chọn vai trò nhưng chưa đăng nhập -> Đưa vào luồng Auth của vai trò đó
          <Stack.Screen name="Auth">
            {() => <AuthNavigator role={role} />}
          </Stack.Screen>
        ) : role === 'driver' ? (
          // 3a. Đăng nhập thành công với vai trò Tài xế
          <Stack.Screen name="DriverApp" component={DriverNavigator} />
        ) : (
          // 3b. Đăng nhập thành công với vai trò Nhà hàng
          <Stack.Screen name="MerchantApp" component={MerchantNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
