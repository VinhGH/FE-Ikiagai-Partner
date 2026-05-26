import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import EarningsChart from '../../../components/driver/EarningsChart';
import TransactionItem, { Transaction } from '../../../components/driver/TransactionItem';
import { router } from 'expo-router';

type Period = '7d' | '30d' | 'last';

const CHART_DATA: Record<Period, { label: string; value: number }[]> = {
  '7d': [
    { label: 'T2', value: 180000 },
    { label: 'T3', value: 245000 },
    { label: 'T4', value: 310000 },
    { label: 'T5', value: 0 },
    { label: 'T6', value: 420000 },
    { label: 'T7', value: 520000 },
    { label: 'CN', value: 320000 },
  ],
  '30d': [
    { label: 'T1', value: 2100000 },
    { label: 'T2', value: 1800000 },
    { label: 'T3', value: 2400000 },
    { label: 'T4', value: 3100000 },
  ],
  'last': [
    { label: 'T1', value: 1900000 },
    { label: 'T2', value: 2200000 },
    { label: 'T3', value: 1500000 },
    { label: 'T4', value: 2800000 },
  ],
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'delivery', description: 'Giao hàng đơn #IKG-9844', amount: 38000, timestamp: 'Hôm nay 10:32', orderId: 'IKG-9844' },
  { id: 't2', type: 'delivery', description: 'Giao hàng đơn #IKG-9820', amount: 24000, timestamp: 'Hôm nay 09:15', orderId: 'IKG-9820' },
  { id: 't3', type: 'bonus', description: 'Thưởng hoàn thành 5 đơn trước 12h', amount: 20000, timestamp: 'Hôm nay 12:01' },
  { id: 't4', type: 'reimbursement', description: 'Bồi hoàn phí gửi xe - đơn #IKG-9801', amount: 15000, timestamp: 'Hôm qua 18:00' },
  { id: 't5', type: 'withdrawal', description: 'Rút tiền về MB Bank *1234', amount: -500000, timestamp: '22/05 08:00' },
  { id: 't6', type: 'delivery', description: 'Giao hàng đơn #IKG-9789', amount: 18000, timestamp: '22/05 07:50', orderId: 'IKG-9789' },
];

const PERIOD_LABELS: Record<Period, string> = {
  '7d': '7 ngày',
  '30d': 'Tháng này',
  'last': 'Tháng trước',
};

export default function DriverEarningsScreen() {
  const [period, setPeriod] = useState<Period>('7d');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const chartData = CHART_DATA[period];
  const total = chartData.reduce((s, d) => s + d.value, 0);
  const balance = 1_995_000;
  const pending = 112_000;

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount.replace(/\D/g, ''));
    if (!amount || amount < 50000) {
      Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 50.000đ');
      return;
    }
    if (amount > balance) {
      Alert.alert('Lỗi', 'Số dư không đủ');
      return;
    }
    Alert.alert('Thành công', `Yêu cầu rút ${amount.toLocaleString('vi-VN')}đ đã được gửi. Tiền sẽ về trong 1-2 ngày làm việc.`);
    setShowWithdraw(false);
    setWithdrawAmount('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>Số dư khả dụng</Text>
              <Text style={styles.walletBalance}>{balance.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.walletPending}>Đang chờ xử lý: {pending.toLocaleString('vi-VN')}đ</Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => setShowWithdraw(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.withdrawBtnText}>Rút tiền</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.walletActions}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/reimbursement')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="autorenew" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Bồi hoàn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <MaterialIcons name="bar-chart" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Báo cáo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <MaterialIcons name="account-balance" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Ngân hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIcon}>
                <MaterialIcons name="card-giftcard" size={22} color={COLORS.white} />
              </View>
              <Text style={styles.actionLabel}>Ưu đãi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Earnings Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Thu nhập</Text>
              <Text style={styles.chartTotal}>{total.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.periodTabs}>
              {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodTab, period === p && styles.periodTabActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                    {PERIOD_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <EarningsChart data={chartData} />
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          {MOCK_TRANSACTIONS.map((t, i) => (
            <React.Fragment key={t.id}>
              <TransactionItem transaction={t} />
              {i < MOCK_TRANSACTIONS.length - 1 && <View style={styles.txDivider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdraw}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWithdraw(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rút tiền</Text>
            <TouchableOpacity onPress={() => setShowWithdraw(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.bankInfo}>
              <Text style={styles.bankLabel}>Tài khoản nhận</Text>
              <Text style={styles.bankValue}>MB Bank · **** 1234</Text>
              <Text style={styles.bankName}>Nguyễn Văn Tài xế</Text>
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
              <Text style={styles.balanceValue}>{balance.toLocaleString('vi-VN')}đ</Text>
            </View>
            <Text style={styles.inputLabel}>Số tiền muốn rút (tối thiểu 50.000đ)</Text>
            <TextInput
              style={styles.amountInput}
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              placeholder="0đ"
              keyboardType="numeric"
              placeholderTextColor={COLORS.textLight}
            />
            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {[100000, 200000, 500000, 1000000].map(a => (
                <TouchableOpacity
                  key={a}
                  style={styles.quickAmountBtn}
                  onPress={() => setWithdrawAmount(a.toString())}
                >
                  <Text style={styles.quickAmountText}>{(a / 1000).toFixed(0)}k</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.withdrawNote}>
              ⏱ Thời gian xử lý: 1-2 ngày làm việc
            </Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleWithdraw} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Xác nhận rút tiền</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  walletCard: {
    margin: SPACING.md,
    borderRadius: 24,
    padding: SPACING.lg,
    backgroundColor: COLORS.driver,
    ...SHADOWS.heavy,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  walletLabel: { fontSize: 13, color: COLORS.white + 'CC', marginBottom: 4 },
  walletBalance: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  walletPending: { fontSize: 12, color: COLORS.white + '99', marginTop: 4 },
  withdrawBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 50,
  },
  withdrawBtnText: { color: COLORS.driver, fontWeight: '700', fontSize: 14 },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionItem: { alignItems: 'center', gap: SPACING.xs },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { fontSize: 11, color: COLORS.white + 'CC', fontWeight: '600' },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  chartTotal: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.driver, marginTop: 2 },
  periodTabs: { flexDirection: 'row', gap: 4 },
  periodTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  periodTabActive: { backgroundColor: COLORS.driver },
  periodText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  periodTextActive: { color: COLORS.white },
  txDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  // Withdraw Modal
  modalSafe: { flex: 1, backgroundColor: COLORS.card },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: 20, color: COLORS.textSecondary, padding: 4 },
  modalBody: { flex: 1, padding: SPACING.md },
  bankInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bankLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  bankValue: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  bankName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceLabel: { fontSize: 14, color: COLORS.textSecondary },
  balanceValue: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.driver },
  inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  amountInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.driverLight,
    alignItems: 'center',
  },
  quickAmountText: { fontSize: 13, fontWeight: '700', color: COLORS.driver },
  withdrawNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  confirmBtn: {
    backgroundColor: COLORS.driver,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  confirmBtnText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '700' },
});
