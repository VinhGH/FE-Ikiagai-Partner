import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverOrdersNavigator from './DriverOrdersNavigator';
import DriverEarningsNavigator from './DriverEarningsNavigator';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

const Tab = createBottomTabNavigator();

/* ─── SVG Tab Icons ─────────────────────────── */
function IconHome({ color }: { color: string; focused: boolean }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="home" size={24} color={color} />
    </View>
  );
}

function IconOrders({ color }: { color: string; focused: boolean }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="receipt" size={24} color={color} />
    </View>
  );
}

function IconEarnings({ color }: { color: string; focused: boolean }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="account-balance-wallet" size={24} color={color} />
    </View>
  );
}

function IconProfile({ color }: { color: string; focused: boolean }) {
  return (
    <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="person" size={24} color={color} />
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
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: COLORS.text,
        },
      }}
    >
      <Tab.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{
          title: 'Trang chủ',
          headerTitle: 'Ikigai Partner',
          tabBarIcon: ({ color, focused }) => <IconHome color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DriverOrders"
        component={DriverOrdersNavigator}
        options={{
          title: 'Đơn hàng',
          headerTitle: 'Đơn hàng',
          tabBarIcon: ({ color, focused }) => <IconOrders color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DriverEarnings"
        component={DriverEarningsNavigator}
        options={{
          title: 'Thu nhập',
          headerTitle: 'Thu nhập & Ví',
          tabBarIcon: ({ color, focused }) => <IconEarnings color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{
          title: 'Cá nhân',
          headerTitle: 'Tài khoản',
          tabBarIcon: ({ color, focused }) => <IconProfile color={color} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
