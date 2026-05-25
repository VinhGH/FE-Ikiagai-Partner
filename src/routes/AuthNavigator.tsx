import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverLoginScreen from '../screens/auth/driver/DriverLoginScreen';
import DriverRegisterScreen from '../screens/auth/driver/DriverRegisterScreen'; // Import màn hình đăng ký tài xế
import MerchantLoginScreen from '../screens/auth/merchant/MerchantLoginScreen';
import MerchantRegisterScreen from '../screens/auth/merchant/MerchantRegisterScreen'; // Import màn hình đăng ký nhà hàng

export type AuthStackParamList = {
  DriverLogin: undefined;
  DriverRegister: undefined;
  MerchantLogin: undefined;
  MerchantRegister: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  role: 'driver' | 'merchant';
}

export default function AuthNavigator({ role }: AuthNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'driver' ? (
        <>
          <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
          <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MerchantLogin" component={MerchantLoginScreen} />
          <Stack.Screen name="MerchantRegister" component={MerchantRegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
