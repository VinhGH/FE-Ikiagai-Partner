import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DriverEarningsScreen from '../screens/driver/DriverEarningsScreen';
import DriverReimbursementScreen from '../screens/driver/DriverReimbursementScreen';

const Stack = createNativeStackNavigator();

export default function DriverEarningsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EarningsMain" component={DriverEarningsScreen} />
      <Stack.Screen name="DriverReimbursement" component={DriverReimbursementScreen} />
    </Stack.Navigator>
  );
}
