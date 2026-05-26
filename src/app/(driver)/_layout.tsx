import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function DriverTabsLayout() {
  return (
    <Tabs
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Trang chủ',
          headerTitle: 'Ikigai Partner',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="driver-orders"
        options={{
          title: 'Đơn hàng',
          headerTitle: 'Đơn hàng',
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Thu nhập',
          headerTitle: 'Thu nhập & Ví',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-balance-wallet" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          headerTitle: 'Tài khoản',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reimbursement"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
