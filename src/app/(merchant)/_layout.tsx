import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function MerchantTabsLayout() {
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
        name="home"
        options={{
          title: 'Trang chủ',
          headerTitle: 'Trang chủ quán ăn',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="merchant-orders"
        options={{
          title: 'Đơn hàng',
          headerTitle: 'Đơn hàng của quán',
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Thực đơn',
          headerTitle: 'Thực đơn của quán',
          tabBarIcon: ({ color }) => <MaterialIcons name="restaurant-menu" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Tin nhắn',
          headerTitle: 'Hộp thư tin nhắn',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Cửa hàng',
          headerTitle: 'Cài đặt quán',
          tabBarIcon: ({ color }) => <MaterialIcons name="storefront" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="feedbacks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
