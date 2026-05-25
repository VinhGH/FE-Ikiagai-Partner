import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES } from '../../constants/theme';

export type ReimbursementStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'paid';
export type ReimbursementType =
  | 'parking_fee'
  | 'toll_fee'
  | 'undeliverable'
  | 'system_error'
  | 'accident'
  | 'other';

export interface Reimbursement {
  id: string;
  type: ReimbursementType;
  status: ReimbursementStatus;
  amount: number;
  description: string;
  submittedAt: string;
  orderId?: string;
}

const TYPE_LABELS: Record<ReimbursementType, string> = {
  parking_fee: 'Phí gửi xe / cầu đường',
  toll_fee: 'Phí cầu đường',
  undeliverable: 'Không thể giao hàng',
  system_error: 'Lỗi hệ thống',
  accident: 'Sự cố tai nạn',
  other: 'Lý do khác',
};

const STATUS_CONFIG: Record<ReimbursementStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Đang gửi', color: COLORS.textSecondary, bg: COLORS.border },
  reviewing: { label: 'Đang xem xét', color: '#92400E', bg: '#FEF3C7' },
  approved: { label: 'Đã duyệt', color: COLORS.driver, bg: COLORS.driverLight },
  rejected: { label: 'Từ chối', color: COLORS.error, bg: '#FEE2E2' },
  paid: { label: 'Đã thanh toán', color: '#1D4ED8', bg: '#DBEAFE' },
};

interface ReimbursementCardProps {
  item: Reimbursement;
  onPress?: (item: Reimbursement) => void;
}

export default function ReimbursementCard({ item, onPress }: ReimbursementCardProps) {
  const statusCfg = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text style={styles.type}>{TYPE_LABELS[item.type]}</Text>
          {item.orderId && (
            <Text style={styles.orderId}>Đơn #{item.orderId}</Text>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.badgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.bottom}>
        <Text style={styles.date}>{item.submittedAt}</Text>
        <Text style={styles.amount}>{item.amount.toLocaleString('vi-VN')}đ</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topLeft: { flex: 1, marginRight: SPACING.sm },
  type: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  date: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  amount: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
