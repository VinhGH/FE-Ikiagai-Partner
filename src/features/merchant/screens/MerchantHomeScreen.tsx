import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/useAuthStore';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const TODAY_STATS = {
  date: 'Thứ Hai, 26/05/2025',
  ordersTotal: 14,
  ordersCompleted: 11,
  ordersCancelled: 2,
  ordersPending: 1,
  revenue: 2_350_000,
  avgOrderValue: 167_857,
  payout: 1_997_500,   // 85% after platform fee
  newCustomers: 3,
};

const HOURLY_DATA = [
  { hour: '8h',  orders: 1 },
  { hour: '9h',  orders: 3 },
  { hour: '10h', orders: 5 },
  { hour: '11h', orders: 4 },
  { hour: '12h', orders: 6 },
  { hour: '13h', orders: 2 },
  { hour: '14h', orders: 1 },
  { hour: '15h', orders: 0 },
];

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;   // 1-5
  comment: string;
  time: string;
}

const FEEDBACKS: Feedback[] = [
  { id: 'f1', orderId: 'IKG-9755', customerName: 'Lê Hoàng E',  rating: 5, comment: 'Cơm gà ăn ngon lắm, đóng gói cẩn thận. Sẽ ủng hộ tiếp!', time: '13:40' },
  { id: 'f2', orderId: 'IKG-8822', customerName: 'Trần Thị B',  rating: 4, comment: 'Combo sushi ổn, nhưng giao hơi lâu một chút. Món ăn vẫn ngon!', time: '10:55' },
  { id: 'f3', orderId: 'IKG-7710', customerName: 'Lê Hồng Ánh', rating: 5, comment: 'Tuyệt vời, quán phục vụ nhiệt tình và đồ ăn rất tươi.', time: '09:32' },
  { id: 'f4', orderId: 'IKG-1152', customerName: 'Nguyễn Văn C', rating: 3, comment: 'Cơm lươn ổn nhưng phần ăn hơi nhỏ so với giá tiền.', time: '08:20' },
];

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  bg: string;
  route?: string;
  action?: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace('.0', '') + ' triệu';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'k';
  return value.toLocaleString('vi-VN') + 'đ';
}

function formatFullCurrency(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialIcons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={13}
          color={s <= rating ? '#F59E0B' : COLORS.border}
        />
      ))}
    </View>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Compact stat card */
function StatCard({
  label, value, sub, icon, iconBg, iconColor, large,
}: {
  label: string; value: string; sub?: string;
  icon: string; iconBg: string; iconColor: string; large?: boolean;
}) {
  return (
    <View style={[sc.card, large && sc.cardLarge]}>
      <View style={[sc.iconBox, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon as any} size={large ? 22 : 18} color={iconColor} />
      </View>
      <Text style={sc.label}>{label}</Text>
      <Text style={[sc.value, large && { fontSize: 22 }]}>{value}</Text>
      {sub ? <Text style={sc.sub}>{sub}</Text> : null}
    </View>
  );
}

/** Sparkline mini bar chart */
function HourlyChart() {
  const max = Math.max(...HOURLY_DATA.map((d) => d.orders));
  const BAR_H = 60;
  return (
    <View style={chart.container}>
      <View style={chart.bars}>
        {HOURLY_DATA.map((d) => (
          <View key={d.hour} style={chart.barCol}>
            <Text style={chart.barVal}>{d.orders > 0 ? d.orders : ''}</Text>
            <View style={chart.barTrack}>
              <View
                style={[
                  chart.barFill,
                  {
                    height: max > 0 ? (d.orders / max) * BAR_H : 0,
                    backgroundColor: d.orders === max ? COLORS.driver : COLORS.primaryLight,
                  },
                ]}
              />
            </View>
            <Text style={chart.barHour}>{d.hour}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Order breakdown donut-style progress row */
function OrderBreakdown() {
  const { ordersTotal, ordersCompleted, ordersCancelled, ordersPending } = TODAY_STATS;
  const rows = [
    { label: 'Hoàn thành', count: ordersCompleted, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Đã hủy',     count: ordersCancelled, color: COLORS.error, bg: '#FEE2E2' },
    { label: 'Đang xử lý', count: ordersPending,   color: '#D97706', bg: '#FEF3C7' },
  ];
  return (
    <View style={bd.container}>
      {rows.map((r) => (
        <View key={r.label} style={bd.row}>
          <View style={[bd.dot, { backgroundColor: r.color }]} />
          <Text style={bd.label}>{r.label}</Text>
          <View style={bd.barWrapper}>
            <View
              style={[
                bd.barFill,
                {
                  width: `${(r.count / ordersTotal) * 100}%` as any,
                  backgroundColor: r.color,
                },
              ]}
            />
          </View>
          <View style={[bd.badge, { backgroundColor: r.bg }]}>
            <Text style={[bd.badgeText, { color: r.color }]}>{r.count}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Marketing / promo modal */
function MarketingModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const PROMOTIONS = [
    {
      id: 'promo1',
      icon: 'local-offer',
      title: 'Mã giảm giá',
      desc: 'Tạo mã khuyến mãi FREESHIP hoặc % giảm giá',
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      id: 'promo2',
      icon: 'campaign',
      title: 'Quảng cáo nổi bật',
      desc: 'Đẩy quán lên đầu danh sách tìm kiếm trong app',
      color: COLORS.primaryDark,
      bg: COLORS.primaryLight,
    },
    {
      id: 'promo3',
      icon: 'card-giftcard',
      title: 'Combo khuyến mãi',
      desc: 'Kết hợp các món để tạo combo giá hấp dẫn',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      id: 'promo4',
      icon: 'flash-on',
      title: 'Flash Sale',
      desc: 'Giảm giá sốc trong khung giờ vàng (11h-13h)',
      color: COLORS.error,
      bg: '#FEE2E2',
    },
    {
      id: 'promo5',
      icon: 'star',
      title: 'Chương trình tích điểm',
      desc: 'Thưởng điểm tích lũy cho khách hàng thân thiết',
      color: '#F59E0B',
      bg: '#FEF9C3',
    },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mkt.overlay}>
        <View style={mkt.sheet}>
          <View style={mkt.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MaterialIcons name="campaign" size={22} color={COLORS.primaryDark} style={{ marginRight: 8 }} />
            <Text style={mkt.title}>Công cụ Marketing</Text>
          </View>
          <Text style={mkt.sub}>Tăng doanh thu với các chiến dịch khuyến mãi</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {PROMOTIONS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={mkt.item}
                activeOpacity={0.75}
                onPress={() => {
                  onClose();
                  Alert.alert(p.title, `Tính năng "${p.title}" sẽ sớm ra mắt trong phiên bản tiếp theo. Cảm ơn bạn đã quan tâm!`);
                }}
              >
                <View style={[mkt.itemIcon, { backgroundColor: p.bg }]}>
                  <MaterialIcons name={p.icon as any} size={24} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={mkt.itemTitle}>{p.title}</Text>
                  <Text style={mkt.itemDesc}>{p.desc}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={mkt.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={mkt.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MerchantHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const [mktVisible, setMktVisible] = useState(false);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 11 ? 'Chào buổi sáng' :
    greetingHour < 14 ? 'Chào buổi trưa' :
    greetingHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const QUICK_ACTIONS: QuickAction[] = [
    {
      id: 'q1', icon: 'receipt', label: 'Đơn hàng',
      color: COLORS.primaryDark, bg: COLORS.primaryLight,
      action: () => router.push('/merchant-orders'),
    },
    {
      id: 'q2', icon: 'restaurant-menu', label: 'Thực đơn',
      color: '#7C3AED', bg: '#EDE9FE',
      action: () => router.push('/menu'),
    },
    {
      id: 'q3', icon: 'campaign', label: 'Marketing',
      color: '#D97706', bg: '#FEF3C7',
      action: () => setMktVisible(true),
    },
    {
      id: 'q4', icon: 'bar-chart', label: 'Doanh thu',
      color: '#16A34A', bg: '#DCFCE7',
      action: () => router.push('/analytics'),
    },
    {
      id: 'q5', icon: 'chat', label: 'Tin nhắn',
      color: COLORS.driver, bg: COLORS.driverLight,
      action: () => router.push('/chats'),
    },
    {
      id: 'q6', icon: 'storefront', label: 'Cửa hàng',
      color: COLORS.merchantDark, bg: COLORS.merchantLight,
      action: () => router.push('/settings'),
    },
  ];

  const avgRating = (FEEDBACKS.reduce((s, f) => s + f.rating, 0) / FEEDBACKS.length).toFixed(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Greeting Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.shopName}>{user?.name ?? 'Ikigai Restaurant'}</Text>
            <Text style={styles.dateText}>{TODAY_STATS.date}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => Alert.alert('Thông báo', 'Bạn có 2 đơn hàng mới chờ xử lý!')}
            >
              <MaterialIcons name="notifications" size={22} color={COLORS.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: COLORS.primaryLight }]}
              onPress={() => router.push('/settings')}
            >
              <MaterialIcons name="storefront" size={22} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Revenue Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Doanh thu hôm nay</Text>
              <Text style={styles.heroRevenue}>{formatFullCurrency(TODAY_STATS.revenue)}</Text>
              <View style={styles.heroPayout}>
                <MaterialIcons name="account-balance-wallet" size={13} color={COLORS.driverLight} />
                <Text style={styles.heroPayoutText}>
                  Về ví quán: {formatFullCurrency(TODAY_STATS.payout)}
                </Text>
              </View>
            </View>
            <View style={styles.heroOrders}>
              <Text style={styles.heroOrdersNum}>{TODAY_STATS.ordersTotal}</Text>
              <Text style={styles.heroOrdersLabel}>đơn{'\n'}hôm nay</Text>
            </View>
          </View>

          {/* Growth indicator */}
          <View style={styles.heroGrowth}>
            <MaterialIcons name="trending-up" size={16} color={COLORS.driverLight} />
            <Text style={styles.heroGrowthText}>+23% so với hôm qua</Text>
            <View style={styles.heroDivider} />
            <MaterialIcons name="person-add" size={14} color={COLORS.driverLight} />
            <Text style={styles.heroGrowthText}>{TODAY_STATS.newCustomers} khách mới</Text>
          </View>
        </View>

        {/* ── Stat Cards Row ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Giá trị TB/đơn"
            value={formatCurrency(TODAY_STATS.avgOrderValue)}
            icon="attach-money" iconBg="#DCFCE7" iconColor="#16A34A"
          />
          <StatCard
            label="Đơn hoàn thành"
            value={`${TODAY_STATS.ordersCompleted}/${TODAY_STATS.ordersTotal}`}
            icon="check-circle" iconBg={COLORS.primaryLight} iconColor={COLORS.primaryDark}
          />
          <StatCard
            label="Đã huỷ"
            value={`${TODAY_STATS.ordersCancelled}`}
            icon="cancel" iconBg="#FEE2E2" iconColor={COLORS.error}
          />
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={styles.quickCard}
                onPress={q.action}
                activeOpacity={0.75}
              >
                <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
                  <MaterialIcons name={q.icon as any} size={24} color={q.color} />
                </View>
                <Text style={styles.quickLabel}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Hourly Orders Chart ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn theo giờ</Text>
            <Text style={styles.sectionSub}>Hôm nay · {TODAY_STATS.ordersTotal} đơn</Text>
          </View>
          <View style={styles.card}>
            <HourlyChart />
          </View>
        </View>

        {/* ── Order Breakdown ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Phân tích đơn hàng</Text>
            <TouchableOpacity onPress={() => router.push('/analytics')}>
              <Text style={styles.seeAll}>Xem chi tiết →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <OrderBreakdown />
          </View>
        </View>

        {/* ── Feedback Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.avgRating}>{avgRating}</Text>
                <StarRating rating={Math.round(parseFloat(avgRating))} />
                <Text style={styles.ratingCount}>({FEEDBACKS.length} hôm nay)</Text>
              </View>
            </View>
          </View>

          {FEEDBACKS.map((fb) => (
            <View key={fb.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                {/* Avatar */}
                <View style={[
                  styles.feedbackAvatar,
                  { backgroundColor: fb.rating >= 4 ? COLORS.primaryLight : '#FEF3C7' },
                ]}>
                  <Text style={[
                    styles.feedbackAvatarText,
                    { color: fb.rating >= 4 ? COLORS.primaryDark : '#D97706' },
                  ]}>
                    {fb.customerName.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.feedbackName}>{fb.customerName}</Text>
                    <Text style={styles.feedbackTime}>{fb.time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <StarRating rating={fb.rating} />
                    <View style={styles.orderTag}>
                      <MaterialIcons name="receipt" size={10} color={COLORS.textLight} />
                      <Text style={styles.orderTagText}>#{fb.orderId}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.feedbackComment}>"{fb.comment}"</Text>
            </View>
          ))}
        </View>

        {/* ── Marketing Banner ── */}
        <TouchableOpacity
          style={styles.mktBanner}
          onPress={() => setMktVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.mktBannerLeft}>
            <Text style={styles.mktBannerTitle}>🚀 Tăng doanh thu ngay!</Text>
            <Text style={styles.mktBannerSub}>
              Tạo mã giảm giá, flash sale và quảng cáo nổi bật
            </Text>
          </View>
          <View style={styles.mktBannerBtn}>
            <Text style={styles.mktBannerBtnText}>Khám phá</Text>
            <MaterialIcons name="arrow-forward" size={14} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* ── Tips Card ── */}
        <View style={[styles.card, styles.tipsCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MaterialIcons name="lightbulb" size={18} color="#F59E0B" />
            <Text style={styles.tipsTitle}>Mẹo hôm nay</Text>
          </View>
          {[
            'Giờ cao điểm 11h-13h: đảm bảo đủ nguyên liệu và nhân lực.',
            'Trả lời đánh giá khách hàng giúp tăng tỷ lệ quay lại 30%.',
            'Kích hoạt Flash Sale lúc 10h để tăng đơn buổi trưa.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Marketing Modal */}
      <MarketingModal visible={mktVisible} onClose={() => setMktVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting:  { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  shopName:  { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  dateText:  { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.white,
  },

  // Hero Revenue Card
  heroCard: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    padding: SPACING.md + 4,
    ...SHADOWS.heavy,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 12, color: '#BAE6FD', fontWeight: '600', marginBottom: 4 },
  heroRevenue: { fontSize: 28, fontWeight: '900', color: COLORS.white, letterSpacing: -0.5 },
  heroPayout: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroPayoutText: { fontSize: 11, color: '#BAE6FD' },
  heroOrders: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: SPACING.md, minWidth: 70 },
  heroOrdersNum: { fontSize: 32, fontWeight: '900', color: COLORS.white },
  heroOrdersLabel: { fontSize: 11, color: '#BAE6FD', textAlign: 'center', lineHeight: 15 },
  heroGrowth: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SPACING.md, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)',
  },
  heroGrowthText: { fontSize: 11, color: '#BAE6FD', flex: 1 },
  heroDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },

  // Quick Actions
  section: { marginHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: SIZES.body - 1, fontWeight: '800', color: COLORS.text },
  sectionSub:   { fontSize: 11, color: COLORS.textSecondary },
  seeAll:       { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickCard: {
    width: (SCREEN_W - SPACING.md * 2 - SPACING.sm * 2) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  quickIcon: {
    width: 50, height: 50, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },

  // Card wrapper
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },

  // Feedback
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  avgRating: { fontSize: 18, fontWeight: '900', color: '#F59E0B' },
  ratingCount: { fontSize: 11, color: COLORS.textSecondary },
  feedbackCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
    ...SHADOWS.light,
  },
  feedbackHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  feedbackAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  feedbackAvatarText: { fontSize: 16, fontWeight: '800' },
  feedbackName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  feedbackTime: { fontSize: 11, color: COLORS.textLight },
  orderTag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.background, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  orderTagText: { fontSize: 10, fontWeight: '600', color: COLORS.textLight },
  feedbackComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, fontStyle: 'italic' },

  // Marketing banner
  mktBanner: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    borderRadius: 18,
    backgroundColor: COLORS.merchantDark,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOWS.medium,
  },
  mktBannerLeft: { flex: 1 },
  mktBannerTitle: { fontSize: SIZES.body - 1, fontWeight: '800', color: COLORS.white, marginBottom: 3 },
  mktBannerSub:   { fontSize: 11, color: '#FDBA74', lineHeight: 15 },
  mktBannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  mktBannerBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Tips
  tipsCard: { marginHorizontal: SPACING.md, marginTop: SPACING.lg },
  tipsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B', marginTop: 5, flexShrink: 0 },
  tipText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, flex: 1 },
});

// ─── Mini chart styles ──────────────────────────────────────────────────────

const chart = StyleSheet.create({
  container: { paddingVertical: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barVal: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  barTrack: { width: '70%', height: 60, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 4 },
  barHour: { fontSize: 9, color: COLORS.textLight, marginTop: 4 },
});

// ─── Breakdown styles ─────────────────────────────────────────────────────────

const bd = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  label: { fontSize: 12, color: COLORS.textSecondary, width: 90 },
  barWrapper: { flex: 1, height: 8, borderRadius: 4, backgroundColor: COLORS.border, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  badge: { minWidth: 28, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

// ─── Marketing modal styles ───────────────────────────────────────────────────

const mkt = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
    ...SHADOWS.heavy,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.md },
  title: { fontSize: SIZES.h3 - 1, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  itemIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  itemDesc:  { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },
  closeBtn: {
    marginTop: SPACING.md,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
});

// ─── Stat card styles ─────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.sm + 4,
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.light,
    alignItems: 'flex-start',
  },
  cardLarge: { paddingHorizontal: SPACING.md },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 3, lineHeight: 13 },
  value: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  sub:   { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
});
