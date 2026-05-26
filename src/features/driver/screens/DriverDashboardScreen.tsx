import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import KPICard from '../../../components/driver/KPICard';
import OrderIncomingCard, { IncomingOrder } from '../../../components/driver/OrderIncomingCard';

const MOCK_INCOMING_ORDER: IncomingOrder = {
  id: 'ord_001',
  store: 'Ikigai Sushi & Sashimi',
  storeAddress: '12 Nguyễn Trãi, Q.1',
  deliveryAddress: '56 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
  distance: '2.5 km',
  estimatedEarning: '35.000đ',
  estimatedTime: '~18 phút',
  items: 3,
};

const MOCK_BONUS = {
  target: 5,
  current: 3,
  reward: '20.000đ',
  deadline: '12:00',
};

export default function DriverDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<IncomingOrder | null>(null);
  const [todayStats] = useState({ earnings: 320000, orders: 8, km: 34.2, rating: 4.8 });

  const bgAnim = useRef(new Animated.Value(0)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = () => {
    const next = !isOnline;
    setIsOnline(next);
    if (next) {
      // Simulate incoming order after 2s when going online
      setTimeout(() => setCurrentOrder(MOCK_INCOMING_ORDER), 2000);
    } else {
      setCurrentOrder(null);
    }
    Animated.timing(bgAnim, {
      toValue: next ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
    Animated.spring(toggleAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: false,
      tension: 80,
      friction: 8,
    }).start();
  };

  const handleAccept = (order: IncomingOrder) => {
    setCurrentOrder(null);
    alert(`Đã nhận đơn ${order.id}! Đến lấy hàng tại ${order.store}`);
  };

  const handleDecline = (_order: IncomingOrder) => {
    setCurrentOrder(null);
  };

  const headerBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.card, COLORS.driver],
  });
  const textColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.textSecondary, COLORS.white],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={isOnline ? 'light-content' : 'dark-content'} />

      {/* Online/Offline Toggle */}
      <Animated.View style={[styles.statusBar, { backgroundColor: headerBg }]}>
        <View style={styles.statusContent}>
          <View>
            <Animated.Text style={[styles.statusTitle, { color: textColor }]}>
              {isOnline ? '● ĐANG NHẬN ĐƠN' : '○ NGOẠI TUYẾN'}
            </Animated.Text>
            <Animated.Text style={[styles.statusSub, { color: textColor }]}>
              {isOnline ? 'Bạn đang hiển thị với khách hàng' : 'Bật để bắt đầu nhận đơn mới'}
            </Animated.Text>
          </View>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: isOnline ? COLORS.driverDark : COLORS.driver }]}
            onPress={handleToggle}
            activeOpacity={0.85}
          >
            <Text style={styles.toggleBtnText}>{isOnline ? 'Tắt' : 'Bật'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetText}>Xin chào, {user?.name?.split(' ').pop() || 'Tài xế'} 👋</Text>
          <Text style={styles.greetSub}>Thứ 2, 26/05/2025</Text>
        </View>

        {/* KPI Row */}
        <View style={styles.kpiRow}>
          <KPICard
            label="Thu nhập"
            value={`${(todayStats.earnings / 1000).toFixed(0)}k đ`}
            subValue="hôm nay"
            color={COLORS.driver}
            icon={<MaterialIcons name="monetization-on" size={20} color={COLORS.driver} />}
          />
          <KPICard
            label="Đơn đã giao"
            value={`${todayStats.orders}`}
            subValue="đơn"
            color={COLORS.primary}
            icon={<MaterialIcons name="local-shipping" size={20} color={COLORS.primary} />}
          />
          <KPICard
            label="Quãng đường"
            value={`${todayStats.km}`}
            subValue="km"
            color="#F97316"
            icon={<MaterialIcons name="motorcycle" size={20} color="#F97316" />}
          />
          <KPICard
            label="Đánh giá"
            value={`${todayStats.rating}`}
            subValue="sao"
            color="#F59E0B"
            icon={<MaterialIcons name="star" size={20} color="#F59E0B" />}
          />
        </View>

        {/* Bonus Banner */}
        <View style={styles.bonusBanner}>
          <View style={styles.bonusLeft}>
            <Text style={styles.bonusTitle}>🎯 Thưởng hôm nay</Text>
            <Text style={styles.bonusDesc}>
              Hoàn thành <Text style={styles.bonusHighlight}>{MOCK_BONUS.target} đơn</Text> trước{' '}
              {MOCK_BONUS.deadline} → +{MOCK_BONUS.reward}
            </Text>
          </View>
          <View style={styles.bonusProgress}>
            <Text style={styles.bonusProgressText}>{MOCK_BONUS.current}/{MOCK_BONUS.target}</Text>
            <View style={styles.bonusProgressBar}>
              <View
                style={[
                  styles.bonusProgressFill,
                  { width: `${(MOCK_BONUS.current / MOCK_BONUS.target) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Incoming Order Card */}
        {isOnline && currentOrder && (
          <>
            <Text style={styles.sectionTitle}>Đơn hàng mới</Text>
            <OrderIncomingCard
              order={currentOrder}
              onAccept={handleAccept}
              onDecline={handleDecline}
              timeoutSeconds={30}
            />
          </>
        )}

        {isOnline && !currentOrder && (
          <View style={styles.waitingCard}>
            <MaterialIcons name="search" size={48} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.waitingTitle}>Đang tìm đơn hàng...</Text>
            <Text style={styles.waitingDesc}>Vui lòng giữ ứng dụng mở để nhận đơn nhanh nhất</Text>
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineCard}>
            <MaterialIcons name="power-settings-new" size={48} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.offlineTitle}>Bạn đang ngoại tuyến</Text>
            <Text style={styles.offlineDesc}>Bật trạng thái để bắt đầu nhận đơn hàng mới</Text>
            <TouchableOpacity
              style={styles.goOnlineBtn}
              onPress={handleToggle}
              activeOpacity={0.85}
            >
              <Text style={styles.goOnlineBtnText}>Bắt đầu nhận đơn</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, backgroundColor: COLORS.background },
  statusBar: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: SIZES.body,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.85,
  },
  toggleBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: 50,
  },
  toggleBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.body - 1,
  },
  greeting: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greetText: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: COLORS.text,
  },
  greetSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  bonusBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bonusLeft: { flex: 1, marginRight: SPACING.sm },
  bonusTitle: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  bonusDesc: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  bonusHighlight: {
    fontWeight: '700',
    color: '#D97706',
  },
  bonusProgress: { alignItems: 'center' },
  bonusProgressText: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 4,
  },
  bonusProgressBar: {
    width: 60,
    height: 6,
    backgroundColor: '#FDE68A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bonusProgressFill: {
    height: 6,
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  waitingCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.light,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  waitingTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  waitingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  offlineCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  offlineTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  offlineDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  goOnlineBtn: {
    backgroundColor: COLORS.driver,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: 50,
  },
  goOnlineBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZES.body,
  },
});
