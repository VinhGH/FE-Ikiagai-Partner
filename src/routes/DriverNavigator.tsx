import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

// Màn hình mock cho Đơn hàng
function DriverOrdersScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>Lịch sử giao hàng & Đơn nhận</Text>
    </View>
  );
}

// Màn hình mock cho Profile
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import Button from '../components/shared/Button';

function DriverProfileScreen() {
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 }}>Tài khoản Tài xế</Text>
      <Button 
        title="Đăng xuất" 
        onPress={() => dispatch(logout())} 
        variant="danger" 
      />
    </View>
  );
}

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.driver,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.driver,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="DriverHome" 
        component={DriverHomeScreen} 
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="DriverOrders" 
        component={DriverOrdersScreen} 
        options={{ title: 'Đơn hàng' }}
      />
      <Tab.Screen 
        name="DriverProfile" 
        component={DriverProfileScreen} 
        options={{ title: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
}
