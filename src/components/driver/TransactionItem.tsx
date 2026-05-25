import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES } from '../../constants/theme';

export type TransactionType = 'delivery' | 'bonus' | 'reimbursement' | 'withdrawal' | 'penalty';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // positive = credit, negative = debit
  timestamp: string;
  orderId?: string;
}

const TYPE_CONFIG: Record<TransactionType, { label: string; iconName: string; color: string }> = {
  delivery: { label: 'Giao hàng', iconName: 'motorcycle', color: COLORS.driver },
  bonus: { label: 'Thưởng', iconName: 'card-giftcard', color: '#F59E0B' },
  reimbursement: { label: 'Bồi hoàn', iconName: 'autorenew', color: COLORS.primary },
  withdrawal: { label: 'Rút tiền', iconName: 'account-balance', color: COLORS.textSecondary },
  penalty: { label: 'Khấu trừ', iconName: 'warning', color: COLORS.error },
};

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const config = TYPE_CONFIG[transaction.type];
  const isCredit = transaction.amount > 0;
  const amountText = `${isCredit ? '+' : ''}${transaction.amount.toLocaleString('vi-VN')}đ`;

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '15' }]}>
        <MaterialIcons name={config.iconName as any} size={22} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.time}>{config.label} · {transaction.timestamp}</Text>
      </View>
      <Text style={[styles.amount, { color: isCredit ? COLORS.driver : COLORS.error }]}>
        {amountText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  desc: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: SIZES.body,
    fontWeight: '700',
  },
});
