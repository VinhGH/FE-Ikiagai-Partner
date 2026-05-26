import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS, COMMON_STYLES } from '../../../constants/theme';

export default function MerchantHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  // Dữ liệu mockup cho đơn hàng đang chờ chế biến
  const mockOrders = [
    { id: '#ORD-8822', items: '2x Combo Sushi Family, 1x Coca Cola', note: 'Ít nước tương', time: '5 phút trước', total: '280.000đ' },
    { id: '#ORD-1152', items: '1x Salmon Sashimi Deluxe', note: 'Không lấy mù tạt', time: '10 phút trước', total: '150.000đ' },
  ];

  return (
    <ScrollView style={COMMON_STYLES.container}>
      {/* Khối trạng thái nhà hàng */}
      <View style={[styles.statusCard, { backgroundColor: isOpen ? COLORS.merchant : COLORS.white }]}>
        <View style={COMMON_STYLES.row}>
          <Text style={[styles.statusTitle, { color: isOpen ? COLORS.white : COLORS.text }]}>
            {isOpen ? 'CỬA HÀNG ĐANG MỞ' : 'CỬA HÀNG ĐANG ĐÓNG'}
          </Text>
        </View>
        <Switch
          value={isOpen}
          onValueChange={setIsOpen}
          trackColor={{ false: COLORS.border, true: COLORS.merchantLight }}
          thumbColor={isOpen ? COLORS.merchantDark : COLORS.textLight}
        />
      </View>

      <View style={styles.content}>
        {/* Lời chào & Tổng quan nhà hàng */}
        <Text style={styles.welcomeText}>Xin chào, {user?.name || 'Nhà hàng'} 👋</Text>
        
        <View style={styles.statsContainer}>
          <View style={[COMMON_STYLES.card, styles.statBox]}>
            <Text style={styles.statLabel}>Doanh thu hôm nay</Text>
            <Text style={[styles.statValue, { color: COLORS.merchant }]}>1.450.000đ</Text>
          </View>
          <View style={[COMMON_STYLES.card, styles.statBox]}>
            <Text style={styles.statLabel}>Đơn hoàn thành</Text>
            <Text style={styles.statValue}>12 đơn</Text>
          </View>
        </View>

        {/* Danh sách đơn hàng đang cần chuẩn bị */}
        <Text style={styles.sectionTitle}>Đơn hàng mới ({mockOrders.length})</Text>

        {!isOpen ? (
          <View style={[COMMON_STYLES.card, styles.inactiveNotice, COMMON_STYLES.center]}>
            <Text style={{ fontSize: 32, marginBottom: SPACING.sm }}>🏪</Text>
            <Text style={styles.noticeText}>Vui lòng mở trạng thái hoạt động cửa hàng để nhận đơn từ khách hàng.</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {mockOrders.map((order) => (
              <View key={order.id} style={[COMMON_STYLES.card, styles.orderCard]}>
                <View style={[COMMON_STYLES.row, COMMON_STYLES.justifyBetween, styles.orderHeader]}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderTime}>{order.time}</Text>
                </View>
                
                <Text style={styles.itemsText}>📦 {order.items}</Text>
                {order.note ? <Text style={styles.noteText}>📝 Ghi chú: {order.note}</Text> : null}
                
                <View style={[COMMON_STYLES.row, COMMON_STYLES.justifyBetween, styles.orderFooter]}>
                  <Text style={styles.totalText}>Tổng cộng: <Text style={{ fontWeight: 'bold', color: COLORS.text }}>{order.total}</Text></Text>
                  <View style={styles.actionGroup}>
                    <TouchableOpacity style={[styles.actionBtn, styles.declineBtn]}>
                      <Text style={styles.declineText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]}>
                      <Text style={styles.acceptText}>Nhận đơn</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    margin: SPACING.md,
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statusTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: SPACING.md,
  },
  welcomeText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  inactiveNotice: {
    padding: SPACING.xl,
    marginTop: SPACING.sm,
  },
  noticeText: {
    fontSize: SIZES.body - 2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ordersList: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  orderId: {
    fontSize: SIZES.body - 1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderTime: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
  },
  itemsText: {
    fontSize: SIZES.body - 1,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  noteText: {
    fontSize: SIZES.caption + 2,
    color: COLORS.error,
    backgroundColor: '#FEF2F2',
    padding: 6,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  orderFooter: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    alignItems: 'center',
  },
  totalText: {
    fontSize: SIZES.caption + 2,
    color: COLORS.textSecondary,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.caption + 1,
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: COLORS.merchant,
  },
  acceptText: {
    color: COLORS.white,
    fontSize: SIZES.caption + 1,
    fontWeight: 'bold',
  },
});
