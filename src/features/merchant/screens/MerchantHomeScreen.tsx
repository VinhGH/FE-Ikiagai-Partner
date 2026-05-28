import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Dimensions, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/useAuthStore';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Mock Data & Types ─────────────────────────────────────────────────────────

interface HourlyItem {
  hour: string;
  orders: number;
}

interface PeriodStats {
  date: string;
  ordersTotal: number;
  ordersCompleted: number;
  ordersCancelled: number;
  ordersPending: number;
  revenue: number;
  avgOrderValue: number;
  payout: number;
  newCustomers: number;
  growth: string;
  hourly: HourlyItem[];
}

const STATS_DATA: Record<'today' | 'yesterday' | 'week', PeriodStats> = {
  today: {
    date: 'Thứ Năm, 28/05/2026',
    ordersTotal: 14,
    ordersCompleted: 11,
    ordersCancelled: 2,
    ordersPending: 1,
    revenue: 2_350_000,
    avgOrderValue: 167_857,
    payout: 1_997_500,
    newCustomers: 3,
    growth: '+23% so với hôm qua',
    hourly: [
      { hour: '8h',  orders: 1 },
      { hour: '9h',  orders: 3 },
      { hour: '10h', orders: 5 },
      { hour: '11h', orders: 4 },
      { hour: '12h', orders: 6 },
      { hour: '13h', orders: 2 },
      { hour: '14h', orders: 1 },
      { hour: '15h', orders: 0 },
    ],
  },
  yesterday: {
    date: 'Thứ Tư, 27/05/2026',
    ordersTotal: 12,
    ordersCompleted: 10,
    ordersCancelled: 1,
    ordersPending: 1,
    revenue: 1_910_000,
    avgOrderValue: 159_166,
    payout: 1_623_500,
    newCustomers: 2,
    growth: '+15% so với thứ Ba',
    hourly: [
      { hour: '8h',  orders: 0 },
      { hour: '9h',  orders: 2 },
      { hour: '10h', orders: 4 },
      { hour: '11h', orders: 3 },
      { hour: '12h', orders: 5 },
      { hour: '13h', orders: 3 },
      { hour: '14h', orders: 1 },
      { hour: '15h', orders: 0 },
    ],
  },
  week: {
    date: 'Tuần này (22/05 - 28/05)',
    ordersTotal: 98,
    ordersCompleted: 89,
    ordersCancelled: 6,
    ordersPending: 3,
    revenue: 16_840_000,
    avgOrderValue: 171_836,
    payout: 14_314_000,
    newCustomers: 18,
    growth: '+8% so với tuần trước',
    hourly: [
      { hour: 'T2',  orders: 12 },
      { hour: 'T3',  orders: 15 },
      { hour: 'T4',  orders: 12 },
      { hour: 'T5',  orders: 14 },
      { hour: 'T6',  orders: 18 },
      { hour: 'T7',  orders: 21 },
      { hour: 'CN',  orders: 6 },
    ],
  },
};

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
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
  action: () => void;
}

interface ActiveOrder {
  id: string;
  customerName: string;
  time: string;
  status: 'new' | 'preparing' | 'ready';
  total: string;
  itemsCount: number;
}

interface Campaign {
  id: string;
  type: 'coupon' | 'flash_sale' | 'featured';
  title: string;
  code?: string;
  discount: string;
  sub: string;
  performance: string;
  status: 'active' | 'paused';
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

function HourlyChart({ data }: { data: HourlyItem[] }) {
  const max = Math.max(...data.map((d) => d.orders));
  const BAR_H = 60;
  return (
    <View style={chart.container}>
      <View style={chart.bars}>
        {data.map((d) => (
          <View key={d.hour} style={chart.barCol}>
            <Text style={chart.barVal}>{d.orders > 0 ? d.orders : ''}</Text>
            <View style={chart.barTrack}>
              <View
                style={[
                  chart.barFill,
                  {
                    height: max > 0 ? (d.orders / max) * BAR_H : 0,
                    backgroundColor: d.orders === max ? COLORS.driverDark : COLORS.primaryLight,
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

function OrderBreakdown({ stats }: { stats: PeriodStats }) {
  const { ordersTotal, ordersCompleted, ordersCancelled, ordersPending } = stats;
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
                  width: `${ordersTotal > 0 ? (r.count / ordersTotal) * 100 : 0}%` as any,
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

function MarketingModal({
  visible,
  onClose,
  onCreateCampaign,
}: {
  visible: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: Omit<Campaign, 'id' | 'performance' | 'status'>) => void;
}) {
  const [promoType, setPromoType] = useState<'coupon' | 'flash_sale' | 'featured' | null>(null);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponMin, setCouponMin] = useState('');

  const [flashDiscount, setFlashDiscount] = useState('');
  const [flashTime, setFlashTime] = useState('11h - 13h');

  const handleCreateCampaign = () => {
    if (promoType === 'coupon') {
      if (!couponCode.trim() || !couponDiscount.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mã giảm giá và số tiền giảm.');
        return;
      }
      onCreateCampaign({
        type: 'coupon',
        title: `Mã giảm giá ${couponCode.trim().toUpperCase()}`,
        code: couponCode.trim().toUpperCase(),
        discount: couponDiscount.includes('đ') || couponDiscount.includes('%') ? couponDiscount : `${couponDiscount}đ`,
        sub: couponMin ? `Đơn hàng tối thiểu ${couponMin}` : 'Mọi đơn hàng',
      });
      setCouponCode('');
      setCouponDiscount('');
      setCouponMin('');
    } else if (promoType === 'flash_sale') {
      if (!flashDiscount.trim()) {
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập phần trăm giảm giá Flash Sale.');
        return;
      }
      onCreateCampaign({
        type: 'flash_sale',
        title: `Flash Sale Giờ Vàng`,
        discount: `Giảm ${flashDiscount.includes('%') ? flashDiscount : `${flashDiscount}%`}`,
        sub: `Khung giờ ${flashTime}`,
      });
      setFlashDiscount('');
      setFlashTime('11h - 13h');
    } else if (promoType === 'featured') {
      onCreateCampaign({
        type: 'featured',
        title: 'Quảng cáo nổi bật',
        discount: 'Vị trí Top quán ngon',
        sub: 'Hiển thị ưu tiên trong 24 giờ tiếp theo',
      });
    }

    setPromoType(null);
    onClose();
  };

  const PROMOTIONS = [
    {
      id: 'coupon',
      icon: 'local-offer',
      title: 'Mã giảm giá',
      desc: 'Tạo mã khuyến mãi FREESHIP hoặc % giảm giá',
      color: '#D97706',
      bg: '#FEF3C7',
    },
    {
      id: 'flash_sale',
      icon: 'flash-on',
      title: 'Flash Sale',
      desc: 'Giảm giá sốc trong khung giờ vàng (11h-13h)',
      color: COLORS.error,
      bg: '#FEE2E2',
    },
    {
      id: 'featured',
      icon: 'campaign',
      title: 'Quảng cáo nổi bật',
      desc: 'Đẩy quán lên đầu danh sách tìm kiếm trong app',
      color: COLORS.primaryDark,
      bg: COLORS.primaryLight,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mkt.overlay}>
        <View style={mkt.sheet}>
          <View style={mkt.handle} />

          {promoType === null ? (
            <>
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
                    onPress={() => setPromoType(p.id as any)}
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
            </>
          ) : (
            <View style={{ paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <TouchableOpacity onPress={() => setPromoType(null)} style={{ marginRight: 10 }}>
                  <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={mkt.title}>
                  {promoType === 'coupon' ? 'Tạo Mã Giảm Giá' :
                   promoType === 'flash_sale' ? 'Tạo Flash Sale' : 'Đăng Ký Quảng Cáo'}
                </Text>
              </View>

              {promoType === 'coupon' && (
                <View style={form.container}>
                  <Text style={form.label}>Mã giảm giá (Ví dụ: IKIGAI30)</Text>
                  <TextInput
                    style={form.input}
                    placeholder="IKIGAI30"
                    placeholderTextColor={COLORS.textLight}
                    autoCapitalize="characters"
                    value={couponCode}
                    onChangeText={setCouponCode}
                  />

                  <Text style={form.label}>Giá trị giảm (Ví dụ: 30.000đ hoặc 20%)</Text>
                  <TextInput
                    style={form.input}
                    placeholder="30.000đ"
                    placeholderTextColor={COLORS.textLight}
                    value={couponDiscount}
                    onChangeText={setCouponDiscount}
                  />

                  <Text style={form.label}>Giá trị đơn tối thiểu (Tùy chọn)</Text>
                  <TextInput
                    style={form.input}
                    placeholder="120.000đ"
                    placeholderTextColor={COLORS.textLight}
                    value={couponMin}
                    onChangeText={setCouponMin}
                  />
                </View>
              )}

              {promoType === 'flash_sale' && (
                <View style={form.container}>
                  <Text style={form.label}>Mức giảm giá (%)</Text>
                  <TextInput
                    style={form.input}
                    placeholder="20%"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="numeric"
                    value={flashDiscount}
                    onChangeText={setFlashDiscount}
                  />

                  <Text style={form.label}>Khung giờ vàng Flash Sale</Text>
                  <TextInput
                    style={form.input}
                    placeholder="11h - 13h"
                    placeholderTextColor={COLORS.textLight}
                    value={flashTime}
                    onChangeText={setFlashTime}
                  />
                </View>
              )}

              {promoType === 'featured' && (
                <View style={form.container}>
                  <View style={form.featuredBanner}>
                    <MaterialIcons name="bolt" size={32} color="#F59E0B" style={{ marginBottom: 8 }} />
                    <Text style={form.featuredText}>
                      Quán sẽ được hiển thị ở vị trí TOP đầu tìm kiếm và có nhãn "Được tài trợ" nổi bật trên ứng dụng Khách hàng.
                    </Text>
                    <Text style={form.featuredPrice}>Chi phí: 150.000đ / ngày</Text>
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: SPACING.lg }}>
                <TouchableOpacity style={[mkt.closeBtn, { flex: 1, marginTop: 0 }]} onPress={() => setPromoType(null)}>
                  <Text style={mkt.closeBtnText}>Quay lại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[form.submitBtn, { flex: 2 }]} onPress={handleCreateCampaign}>
                  <Text style={form.submitBtnText}>Kích hoạt ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MerchantHomeScreen() {
  const user = useAuthStore((s) => s.user);
  
  // Dashboard Status and Navigation
  const [storeStatus, setStoreStatus] = useState<'open' | 'closed'>('open');
  const [statsPeriod, setStatsPeriod] = useState<'today' | 'yesterday' | 'week'>('today');
  const [mktVisible, setMktVisible] = useState(false);

  // Active / Urgent Orders State
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    { id: 'IKG-8822', customerName: 'Trần Thị B', time: '5m trước', status: 'new', total: '350.000đ', itemsCount: 3 },
    { id: 'IKG-1152', customerName: 'Nguyễn Văn C', time: '12m trước', status: 'new', total: '230.000đ', itemsCount: 2 },
    { id: 'IKG-9801', customerName: 'Lê Văn Khải', time: '25m trước', status: 'preparing', total: '190.000đ', itemsCount: 1 },
  ]);

  // Marketing Campaigns Simulator State
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'c1',
      type: 'coupon',
      title: 'Mã giảm giá khai trương',
      code: 'IKIGAI15',
      discount: 'Giảm 15.000đ',
      sub: 'Đơn tối thiểu 120.000đ',
      performance: 'Đã dùng 24 lần · Doanh thu +540k',
      status: 'active',
    }
  ]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 11 ? 'Chào buổi sáng' :
    greetingHour < 14 ? 'Chào buổi trưa' :
    greetingHour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const currentStats = STATS_DATA[statsPeriod];

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
      id: 'q3', icon: 'star', label: 'Đánh giá',
      color: '#F59E0B', bg: '#FEF9C3',
      action: () => router.push('/feedbacks'),
    },
    {
      id: 'q4', icon: 'bar-chart', label: 'Doanh thu',
      color: '#16A34A', bg: '#DCFCE7',
      action: () => router.push('/analytics'),
    },
    {
      id: 'q5', icon: 'psychology', label: 'Trợ lý AI',
      color: '#7C3AED', bg: '#EDE9FE',
      action: () => router.push('/ai-assistant'),
    },
    {
      id: 'q6', icon: 'campaign', label: 'Marketing',
      color: '#D97706', bg: '#FEF3C7',
      action: () => setMktVisible(true),
    },
    {
      id: 'q7', icon: 'report-problem', label: 'Sự cố',
      color: COLORS.error, bg: '#FEE2E2',
      action: () => router.push('/incidents'),
    },
    {
      id: 'q8', icon: 'storefront', label: 'Cửa hàng',
      color: COLORS.merchantDark, bg: COLORS.merchantLight,
      action: () => router.push('/settings'),
    },
  ];

  const avgRating = (FEEDBACKS.reduce((s, f) => s + f.rating, 0) / FEEDBACKS.length).toFixed(1);

  // Handlers
  const handleToggleStatus = () => {
    if (storeStatus === 'open') {
      Alert.alert(
        'Xác nhận tạm đóng cửa',
        'Khách hàng sẽ không thể đặt món trong thời gian quán đóng cửa. Bạn có chắc chắn?',
        [
          { text: 'Bỏ qua', style: 'cancel' },
          { text: 'Tạm đóng', style: 'destructive', onPress: () => {
            setStoreStatus('closed');
            Alert.alert('Thành công', 'Quán đã được chuyển sang trạng thái Tạm nghỉ.');
          }}
        ]
      );
    } else {
      setStoreStatus('open');
      Alert.alert('Thành công', 'Quán đã mở cửa hoạt động trở lại.');
    }
  };

  const handleOrderPress = (order: ActiveOrder) => {
    router.push({
      pathname: '/merchant-orders',
      params: { tab: order.status === 'new' ? 'new' : 'preparing' }
    });
  };

  const handleCreateCampaign = (newC: Omit<Campaign, 'id' | 'performance' | 'status'>) => {
    const freshCampaign: Campaign = {
      ...newC,
      id: 'c_' + Date.now(),
      performance: 'Đã dùng 0 lần · Doanh thu +0đ',
      status: 'active',
    };
    setCampaigns(prev => [freshCampaign, ...prev]);
    Alert.alert('Tạo chiến dịch thành công', `Chiến dịch "${freshCampaign.title}" đã bắt đầu hoạt động.`);
  };

  const handleCampaignPause = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleCampaignDelete = (id: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa chiến dịch marketing này?', [
      { text: 'Không', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => {
        setCampaigns(prev => prev.filter(c => c.id !== id));
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Greeting Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.shopName} numberOfLines={1}>{user?.name ?? 'Ikigai Restaurant'}</Text>
            <Text style={styles.dateText}>{currentStats.date}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => Alert.alert('Thông báo', 'Bạn có 2 đơn hàng mới chờ xử lý!')}
            >
              <MaterialIcons name="notifications" size={22} color={COLORS.text} />
              {activeOrders.filter(o => o.status === 'new').length > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: COLORS.primaryLight }]}
              onPress={() => router.push('/settings')}
            >
              <MaterialIcons name="storefront" size={22} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Operational Status Banner ── */}
        <View style={[styles.statusBanner, storeStatus === 'closed' && styles.statusBannerClosed]}>
          <View style={styles.statusBannerLeft}>
            <View style={[styles.statusIndicator, { backgroundColor: storeStatus === 'open' ? COLORS.success : COLORS.error }]} />
            <Text style={styles.statusBannerText}>
              Trạng thái hoạt động: <Text style={{ fontWeight: '800' }}>{storeStatus === 'open' ? 'MỞ CỬA' : 'TẠM NGHỈ'}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.statusToggleBtn, storeStatus === 'closed' && styles.statusToggleBtnClosed]}
            onPress={handleToggleStatus}
            activeOpacity={0.7}
          >
            <Text style={styles.statusToggleText}>Đổi trạng thái</Text>
          </TouchableOpacity>
        </View>

        {/* ── Stats Period Switcher Tabs ── */}
        <View style={styles.periodTabs}>
          {(['today', 'yesterday', 'week'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTabBtn, statsPeriod === p && styles.periodTabBtnActive]}
              onPress={() => setStatsPeriod(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodTabLabel, statsPeriod === p && styles.periodTabLabelActive]}>
                {p === 'today' ? 'Hôm nay' : p === 'yesterday' ? 'Hôm qua' : '7 ngày qua'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Dashboard Row (Revenue + Urgent Orders side-by-side) ── */}
        <View style={styles.dashboardRow}>
          {/* Left Col: Doanh thu (Revenue Card) */}
          <View style={styles.dashboardColLeft}>
            <View style={styles.heroCardCompact}>
              <View>
                <Text style={styles.heroLabelCompact}>
                  Doanh thu {statsPeriod === 'today' ? 'hôm nay' : statsPeriod === 'yesterday' ? 'hôm qua' : '7 ngày'}
                </Text>
                <Text style={styles.heroRevenueCompact}>{formatCurrency(currentStats.revenue)}</Text>
              </View>
              <View style={styles.heroDividerCompact} />
              <View style={{ gap: 2 }}>
                <View style={styles.heroRowCompact}>
                  <MaterialIcons name="receipt" size={11} color="#BAE6FD" />
                  <Text style={styles.heroTextCompact}>{currentStats.ordersTotal} đơn hàng</Text>
                </View>
                <View style={styles.heroRowCompact}>
                  <MaterialIcons name="account-balance-wallet" size={11} color="#BAE6FD" />
                  <Text style={styles.heroTextCompact} numberOfLines={1}>{formatCurrency(currentStats.payout)} về ví</Text>
                </View>
                <View style={styles.heroRowCompact}>
                  <MaterialIcons name="trending-up" size={11} color="#BAE6FD" />
                  <Text style={styles.heroTextCompact} numberOfLines={1}>{statsPeriod === 'week' ? '+8% tuần qua' : '+23% so hôm qua'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Col: Đơn hàng cần chuẩn bị gấp */}
          <View style={styles.dashboardColRight}>
            <View style={styles.urgentCardCompact}>
              <View style={styles.urgentHeaderCompact}>
                <Text style={styles.urgentTitleCompact}>Chuẩn bị gấp 🔥</Text>
                <TouchableOpacity onPress={() => router.push('/merchant-orders')}>
                  <Text style={styles.urgentSeeAllCompact}>Đơn ({activeOrders.length}) ›</Text>
                </TouchableOpacity>
              </View>

              {activeOrders.length === 0 ? (
                <View style={styles.urgentEmptyCompact}>
                  <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
                  <Text style={styles.urgentEmptyTextCompact}>Đã xong sạch đơn</Text>
                </View>
              ) : (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  {activeOrders.slice(0, 3).map((o) => {
                    const isNew = o.status === 'new';
                    return (
                      <TouchableOpacity
                        key={o.id}
                        style={styles.urgentItemCompact}
                        onPress={() => handleOrderPress(o)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.urgentItemIdCompact}>#{o.id}</Text>
                          <View style={[styles.urgentStatusPillCompact, { backgroundColor: isNew ? '#FEE2E2' : '#FEF3C7' }]}>
                            <Text style={[styles.urgentStatusTextCompact, { color: isNew ? COLORS.error : '#D97706' }]}>
                              {isNew ? 'Mới' : 'Làm'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.urgentItemDescCompact} numberOfLines={1}>
                          {o.customerName} · {o.itemsCount} món ({o.time})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        </View>

        {/* ── Stat Cards Row ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Giá trị TB/đơn"
            value={formatCurrency(currentStats.avgOrderValue)}
            icon="attach-money" iconBg="#DCFCE7" iconColor="#16A34A"
          />
          <StatCard
            label="Hoàn thành"
            value={`${currentStats.ordersCompleted}/${currentStats.ordersTotal}`}
            icon="check-circle" iconBg={COLORS.primaryLight} iconColor={COLORS.primaryDark}
          />
          <StatCard
            label="Đã huỷ"
            value={`${currentStats.ordersCancelled}`}
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
                  <MaterialIcons name={q.icon as any} size={20} color={q.color} />
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
            <Text style={styles.sectionSub}>Hôm nay · {currentStats.ordersTotal} đơn</Text>
          </View>
          <View style={styles.card}>
            <HourlyChart data={currentStats.hourly} />
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
            <OrderBreakdown stats={currentStats} />
          </View>
        </View>

        {/* ── Active Campaigns Widget ── */}
        {campaigns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Chiến dịch Marketing đang chạy</Text>
              <TouchableOpacity onPress={() => setMktVisible(true)}>
                <Text style={styles.seeAll}>+ Tạo thêm</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              {campaigns.map((c) => (
                <View key={c.id} style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View style={[styles.campaignIconBox, { backgroundColor: c.type === 'coupon' ? '#FEF3C7' : c.type === 'flash_sale' ? '#FEE2E2' : '#E0F7FE' }]}>
                      <MaterialIcons
                        name={c.type === 'coupon' ? 'local-offer' : c.type === 'flash_sale' ? 'flash-on' : 'campaign'}
                        size={18}
                        color={c.type === 'coupon' ? '#D97706' : c.type === 'flash_sale' ? COLORS.error : COLORS.primaryDark}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.campaignTitle}>{c.title}</Text>
                        <View style={[styles.campaignStatusPill, { backgroundColor: c.status === 'active' ? '#DCFCE7' : '#F1F5F9' }]}>
                          <Text style={[styles.campaignStatusLabel, { color: c.status === 'active' ? '#16A34A' : COLORS.textSecondary }]}>
                            {c.status === 'active' ? 'Đang chạy' : 'Đã dừng'}
                          </Text>
                        </View>
                      </View>
                      {c.code && <Text style={styles.campaignCode}>Mã: {c.code}</Text>}
                      <Text style={styles.campaignDiscount}>{c.discount} · {c.sub}</Text>
                    </View>
                  </View>
                  <View style={styles.campaignFooter}>
                    <Text style={styles.campaignPerformance}>{c.performance}</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={() => handleCampaignPause(c.id)}>
                        <Text style={[styles.campaignActionBtnText, { color: COLORS.primaryDark }]}>
                          {c.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleCampaignDelete(c.id)}>
                        <Text style={[styles.campaignActionBtnText, { color: COLORS.error }]}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Feedback Summary Card Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá & Phản hồi ⭐</Text>
            <TouchableOpacity onPress={() => router.push('/feedbacks')}>
              <Text style={styles.seeAll}>Chi tiết →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.ratingSummaryCard}
            onPress={() => router.push('/feedbacks')}
            activeOpacity={0.8}
          >
            <View style={styles.ratingSummaryLeft}>
              <Text style={styles.ratingSummaryBig}>{avgRating}</Text>
              <StarRating rating={Math.round(parseFloat(avgRating))} />
              <Text style={styles.ratingSummaryCount}>Tất cả {FEEDBACKS.length} đánh giá</Text>
            </View>
            <View style={styles.ratingSummaryDivider} />
            <View style={styles.ratingSummaryRight}>
              <Text style={styles.ratingSummaryHeading}>Phản hồi khách hàng</Text>
              <Text style={styles.ratingSummarySub}>
                Trả lời các đánh giá của khách giúp nâng cao uy tín và tỷ lệ quay lại của quán.
              </Text>
              <View style={styles.ratingSummaryBtn}>
                <Text style={styles.ratingSummaryBtnText}>Quản lý đánh giá</Text>
                <MaterialIcons name="chevron-right" size={16} color={COLORS.primaryDark} />
              </View>
            </View>
          </TouchableOpacity>
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
            <Text style={styles.tipsTitle}>Mẹo hoạt động hôm nay</Text>
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

      {/* Marketing Tools modal */}
      <MarketingModal
        visible={mktVisible}
        onClose={() => setMktVisible(false)}
        onCreateCampaign={handleCreateCampaign}
      />

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
    alignItems: 'center',
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
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.white,
  },

  // Operational Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DCFCE7', // Light green
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statusBannerClosed: {
    backgroundColor: '#FEE2E2', // Light red
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8, height: 8,
    borderRadius: 4,
  },
  statusBannerText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusToggleBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusToggleBtnClosed: {
    backgroundColor: COLORS.error,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Stats Period Switcher Tabs
  periodTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 2,
  },
  periodTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  periodTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTabLabelActive: {
    color: COLORS.text,
    fontWeight: '800',
  },

  // Side-by-Side Dashboard Row
  dashboardRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  dashboardColLeft: {
    flex: 1,
  },
  dashboardColRight: {
    flex: 1,
  },

  // Compact cards
  heroCardCompact: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: SPACING.md,
    ...SHADOWS.medium,
    height: 165,
    justifyContent: 'space-between',
  },
  heroLabelCompact: {
    fontSize: 9,
    color: '#BAE6FD',
    fontWeight: '600',
  },
  heroRevenueCompact: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 2,
  },
  heroDividerCompact: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },
  heroRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroTextCompact: {
    fontSize: 10,
    color: '#BAE6FD',
    fontWeight: '500',
  },

  urgentCardCompact: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.light,
    height: 165,
  },
  urgentHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  urgentTitleCompact: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  urgentSeeAllCompact: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  urgentEmptyCompact: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  urgentEmptyTextCompact: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  urgentItemCompact: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingVertical: 5,
  },
  urgentItemIdCompact: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },
  urgentStatusPillCompact: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  urgentStatusTextCompact: {
    fontSize: 8,
    fontWeight: '800',
  },
  urgentItemDescCompact: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

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
    width: (SCREEN_W - SPACING.md * 2 - SPACING.sm * 3) / 4,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  quickIcon: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontSize: 10, fontWeight: '700', color: COLORS.text, textAlign: 'center' },

  // Card wrapper
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },

  // Campaigns
  campaignCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  campaignIconBox: {
    width: 36, height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  campaignStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  campaignStatusLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
  campaignCode: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  campaignDiscount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 10,
    paddingTop: 8,
  },
  campaignPerformance: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  campaignActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Feedback Summary Card (Homepage new style)
  ratingSummaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
    gap: 12,
  },
  ratingSummaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  ratingSummaryBig: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 34,
  },
  ratingSummaryCount: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  ratingSummaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  ratingSummaryRight: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingSummaryHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  ratingSummarySub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  ratingSummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingSummaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

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

const chart = StyleSheet.create({
  container: { paddingVertical: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barVal: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  barTrack: { width: '70%', height: 60, justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 4, minHeight: 4 },
  barHour: { fontSize: 9, color: COLORS.textLight, marginTop: 4 },
});

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

const form = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  submitBtn: {
    marginTop: SPACING.md,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredBanner: {
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF08A',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 13,
    color: '#713F12',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A16207',
    marginTop: 12,
  },
});
