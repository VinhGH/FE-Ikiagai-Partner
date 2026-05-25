import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES } from '../../constants/theme';

export type DeliveryStatus = 'completed' | 'cancelled' | 'reimbursed';

export interface DeliveryHistoryItem {
  id: string;
  orderId: string;
  storeName: string;
  deliveryAddress: string;
  earning: number;
  distance: string;
  status: DeliveryStatus;
  completedAt: string;
  rating?: number;
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  completed: { label: 'Hoàn thành', color: COLORS.driver, bg: COLORS.driverLight },
  cancelled: { label: 'Đã huỷ', color: COLORS.error, bg: '#FEE2E2' },
  reimbursed: { label: 'Bồi hoàn', color: '#1D4ED8', bg: '#DBEAFE' },
};

interface DeliveryHistoryItemProps {
  item: DeliveryHistoryItem;
  onPress?: (item: DeliveryHistoryItem) => void;
}

export default function DeliveryHistoryItemComp({ item, onPress }: DeliveryHistoryItemProps) {
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: statusCfg.bg }]}>
          <MaterialIcons name="motorcycle" size={22} color={statusCfg.color} />
        </View>
      </View>
      <View style={styles.center}>
        <View style={styles.topRow}>
          <Text style={styles.storeName} numberOfLines={1}>{item.storeName}</Text>
          <Text style={[styles.earning, { color: item.status === 'cancelled' ? COLORS.textSecondary : COLORS.driver }]}>
            {item.status === 'cancelled' ? '—' : `+${item.earning.toLocaleString('vi-VN')}đ`}
          </Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>{item.deliveryAddress}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{item.completedAt} · {item.distance}</Text>
          <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
          </View>
        </View>
        {item.rating !== undefined && (
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Text key={s} style={{ fontSize: 11, color: s <= item.rating! ? '#F59E0B' : COLORS.border }}>★</Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {},
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
  center: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  storeName: {
    flex: 1,
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  earning: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
  },
  address: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
