import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverLoginScreen from '../screens/auth/driver/DriverLoginScreen';
import MerchantLoginScreen from '../screens/auth/merchant/MerchantLoginScreen';

export type AuthStackParamList = {
  DriverLogin: undefined;
  MerchantLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  role: 'driver' | 'merchant';
}

export default function AuthNavigator({ role }: AuthNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'driver' ? (
        <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
      ) : (
        <Stack.Screen name="MerchantLogin" component={MerchantLoginScreen} />
      )}
    </Stack.Navigator>
  );
}
