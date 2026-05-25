import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import MerchantHomeScreen from '../screens/merchant/MerchantHomeScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

// Màn hình mock cho Thực đơn
function MerchantMenuScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>Quản lý danh sách món ăn & Menu</Text>
    </View>
  );
}

// Màn hình mock cho Profile
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import Button from '../components/shared/Button';

function MerchantProfileScreen() {
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 }}>Cửa hàng của tôi</Text>
      <Button 
        title="Đăng xuất" 
        onPress={() => dispatch(logout())} 
        variant="danger" 
      />
    </View>
  );
}

export default function MerchantNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.merchant,
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
          backgroundColor: COLORS.merchant,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="MerchantHome" 
        component={MerchantHomeScreen} 
        options={{ title: 'Tổng quan' }}
      />
      <Tab.Screen 
        name="MerchantMenu" 
        component={MerchantMenuScreen} 
        options={{ title: 'Món ăn' }}
      />
      <Tab.Screen 
        name="MerchantProfile" 
        component={MerchantProfileScreen} 
        options={{ title: 'Đối tác' }}
      />
    </Tab.Navigator>
  );
}
