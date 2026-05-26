import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { SIZES } from '../../../constants/theme';
import CurrentDeliveryScreen from './CurrentDeliveryScreen';
import DeliveryHistoryScreen from './DeliveryHistoryScreen';

function OrdersTabBar({ activeTab, onChange }: { activeTab: string; onChange: (t: string) => void }) {
  const tabs = [
    { key: 'CurrentDelivery', label: 'Đang giao' },
    { key: 'DeliveryHistory', label: 'Lịch sử' },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[styles.tab, activeTab === t.key && styles.tabActive]}
          onPress={() => onChange(t.key)}
        >
          <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function DriverOrdersScreen() {
  const [activeTab, setActiveTab] = useState('CurrentDelivery');

  return (
    <View style={styles.container}>
      <OrdersTabBar activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'CurrentDelivery' ? (
        <CurrentDeliveryScreen />
      ) : (
        <DeliveryHistoryScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.driver,
  },
  tabText: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.driver,
    fontWeight: '700',
  },
});
