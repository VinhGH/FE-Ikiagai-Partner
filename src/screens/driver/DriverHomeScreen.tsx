import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES, SHADOWS, COMMON_STYLES } from '../../constants/theme';

export default function DriverHomeScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isActive, setIsActive] = useState(false);

  // Dữ liệu mockup cho đơn hàng đang có sẵn
  const mockOrders = [
    { id: '#IKG-9844', store: 'Ikigai Sushi & Sashimi', address: '12 Nguyễn Trãi, Quận 1', distance: '2.5 km', price: '45.000đ' },
    { id: '#IKG-7264', store: 'Phở Lý Quốc Sư', address: '34 Lê Lợi, Quận 1', distance: '1.2 km', price: '25.000đ' },
  ];

  return (
    <ScrollView style={COMMON_STYLES.container}>
      {/* Khối trạng thái hoạt động */}
      <View style={[styles.statusCard, { backgroundColor: isActive ? COLORS.driver : COLORS.white }]}>
        <View style={COMMON_STYLES.row}>
          <Text style={[styles.statusTitle, { color: isActive ? COLORS.white : COLORS.text }]}>
            {isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐANG NGOẠI TUYẾN'}
          </Text>
        </View>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: COLORS.border, true: COLORS.driverLight }}
          thumbColor={isActive ? COLORS.driverDark : COLORS.textLight}
        />
      </View>

      <View style={styles.content}>
        {/* Lời chào & Tổng quan thu nhập */}
        <Text style={styles.welcomeText}>Xin chào, {user?.name || 'Tài xế'} 👋</Text>
        
        <View style={styles.statsContainer}>
          <View style={[COMMON_STYLES.card, styles.statBox]}>
            <Text style={styles.statLabel}>Thu nhập hôm nay</Text>
            <Text style={[styles.statValue, { color: COLORS.driver }]}>320.000đ</Text>
          </View>
          <View style={[COMMON_STYLES.card, styles.statBox]}>
            <Text style={styles.statLabel}>Số đơn đã giao</Text>
            <Text style={styles.statValue}>8 đơn</Text>
          </View>
        </View>

        {/* Danh sách đơn hàng có sẵn */}
        <Text style={styles.sectionTitle}>Đơn hàng khả dụng ({mockOrders.length})</Text>

        {!isActive ? (
          <View style={[COMMON_STYLES.card, styles.inactiveNotice, COMMON_STYLES.center]}>
            <Text style={{ fontSize: 32, marginBottom: SPACING.sm }}>💤</Text>
            <Text style={styles.noticeText}>Vui lòng bật trạng thái hoạt động để bắt đầu nhận đơn hàng mới.</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {mockOrders.map((order) => (
              <View key={order.id} style={[COMMON_STYLES.card, styles.orderCard]}>
                <View style={[COMMON_STYLES.row, COMMON_STYLES.justifyBetween, styles.orderHeader]}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderPrice}>{order.price}</Text>
                </View>
                
                <Text style={styles.storeName}>📍 {order.store}</Text>
                <Text style={styles.address}>🏁 Giao đến: {order.address}</Text>
                
                <View style={[COMMON_STYLES.row, COMMON_STYLES.justifyBetween, styles.orderFooter]}>
                  <Text style={styles.distance}>Khoảng cách: {order.distance}</Text>
                  <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.acceptButtonText}>Chấp nhận đơn</Text>
                  </TouchableOpacity>
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
  orderPrice: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.driver,
  },
  storeName: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  address: {
    fontSize: SIZES.caption + 2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  orderFooter: {
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  distance: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
  },
  acceptButton: {
    backgroundColor: COLORS.driver,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.caption + 1,
  },
});
