import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

interface Incident {
  id: string;
  orderId: string;
  customerName: string;
  time: string;
  type: 'missing_item' | 'wrong_item' | 'bad_quality' | 'delivery_issue';
  typeLabel: string;
  description: string;
  refundAmount: number;
  status: 'pending' | 'refunded' | 'disputed';
  aiSuggestion: string;
  aiAction: 'refund' | 'dispute';
  evidenceImg?: string;
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-1024',
    orderId: 'IKG-9755',
    customerName: 'Lê Hoàng E',
    time: '14:20 - Hôm nay',
    type: 'missing_item',
    typeLabel: 'Quên làm món / Thiếu món',
    description: 'Đơn hàng giao thiếu 1 phần Đùi gà chiên xù trị giá 45.000đ trong combo ăn gia đình.',
    refundAmount: 45000,
    status: 'pending',
    aiSuggestion: 'Lịch sử đơn bếp ghi nhận món "Đùi gà chiên xù" hoàn thành muộn hơn các món khác 8 phút. Camera đóng gói cho thấy túi hàng được dán băng keo trước khi món này ra lò. Bếp của bạn đã sơ suất bỏ quên món. Khuyên dùng: CHẤP NHẬN HOÀN TIỀN.',
    aiAction: 'refund',
    evidenceImg: 'bill_photo.jpg',
  },
  {
    id: 'INC-2048',
    orderId: 'IKG-8822',
    customerName: 'Trần Thị B',
    time: '11:15 - Hôm nay',
    type: 'wrong_item',
    typeLabel: 'Làm sai món / Lộn món',
    description: 'Mình đặt Combo Sushi đặc biệt (cá hồi sống) nhưng quán giao lộn Sushi chín (trứng cuộn & tôm chín).',
    refundAmount: 120000,
    status: 'pending',
    aiSuggestion: 'Đơn hàng được dán nhãn chuẩn bị lúc 12:05 (đỉnh điểm giờ cao điểm, có 12 đơn đang chế biến cùng lúc). Hệ thống phát hiện hai đơn IKG-8822 và IKG-8823 có cùng khối lượng và ra lò cách nhau 30 giây. Bếp đã dán nhầm nhãn đơn. Khuyên dùng: CHẤP NHẬN HOÀN TIỀN + TẶNG VOUCHER XIN LỖI.',
    aiAction: 'refund',
    evidenceImg: 'sushi_photo.jpg',
  },
  {
    id: 'INC-3072',
    orderId: 'IKG-7710',
    customerName: 'Lê Hồng Ánh',
    time: '09:45 - Hôm nay',
    type: 'bad_quality',
    typeLabel: 'Đồ ăn bị hỏng / Nguội tanh',
    description: 'Canh Miso bị đổ hết ra ngoài làm ướt hộp giấy, đồ ăn giao đến nguội lạnh hoàn toàn không ăn được.',
    refundAmount: 70000,
    status: 'pending',
    aiSuggestion: 'Thời gian chuẩn bị món của quán là 10 phút (đúng hẹn). Tuy nhiên, tài xế nhận hàng lúc 10:10 nhưng đến tận 10:45 mới giao tới khách hàng (quá trình di chuyển mất 35 phút cho quãng đường 2km). Lỗi thuộc về khâu vận chuyển của tài xế. Khuyên dùng: KHIẾU NẠI LÊN IKIGAI để được bồi hoàn.',
    aiAction: 'dispute',
  },
];

function formatPrice(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}

export default function MerchantIncidentsScreen() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeFilter, setActiveFilter] = useState<'pending' | 'refunded' | 'disputed'>('pending');

  const filteredIncidents = incidents.filter((i) => i.status === activeFilter);

  const handleRefund = (id: string) => {
    Alert.alert(
      'Xác nhận hoàn tiền',
      'Bạn đồng ý rằng lỗi thuộc về phía quán và chấp nhận hoàn trả số tiền này cho khách hàng?',
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Đồng ý hoàn tiền',
          style: 'destructive',
          onPress: () => {
            setIncidents((prev) =>
              prev.map((i) => (i.id === id ? { ...i, status: 'refunded' } : i))
            );
            Alert.alert('Thành công', 'Đã duyệt hoàn tiền cho khách hàng. Số tiền sẽ được cấn trừ vào ví doanh thu.');
          },
        },
      ]
    );
  };

  const handleAppeal = (id: string) => {
    Alert.alert(
      'Yêu cầu Ikigai phân xử',
      'Bạn muốn chuyển sự cố này lên bộ phận hỗ trợ của Ikigai để khiếu nại tài xế hoặc lỗi hệ thống?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi khiếu nại',
          onPress: () => {
            setIncidents((prev) =>
              prev.map((i) => (i.id === id ? { ...i, status: 'disputed' } : i))
            );
            Alert.alert('Đã gửi khiếu nại', 'Đã chuyển thông tin và lịch sử đơn hàng cho bộ phận hỗ trợ Ikigai giải quyết. Chúng tôi sẽ phản hồi kết quả trong vòng 24 giờ.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Quản lý Sự cố đơn hàng</Text>
          <Text style={styles.headerSub}>Xem báo cáo từ khách hàng &amp; Phản hồi xử lý bồi hoàn</Text>
        </View>
      </View>

      {/* ── Status Tabs ── */}
      <View style={styles.tabRow}>
        {[
          { key: 'pending', label: 'Chờ xử lý', icon: 'pending-actions', color: COLORS.warning },
          { key: 'refunded', label: 'Đã hoàn tiền', icon: 'check-circle', color: '#16A34A' },
          { key: 'disputed', label: 'Đang khiếu nại', icon: 'gavel', color: COLORS.primaryDark },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabBtn,
              activeFilter === tab.key && { borderBottomColor: tab.color },
            ]}
            onPress={() => setActiveFilter(tab.key as any)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={18}
              color={activeFilter === tab.key ? tab.color : COLORS.textLight}
            />
            <Text style={[
              styles.tabLabel,
              activeFilter === tab.key && { color: tab.color, fontWeight: '800' },
            ]}>
              {tab.label} ({incidents.filter((i) => i.status === tab.key).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Incidents list ── */}
      <FlatList
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="verified" size={56} color="#DCFCE7" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Không có sự cố nào trong mục này</Text>
            <Text style={styles.emptySub}>Chúc mừng! Cửa hàng đang hoạt động rất tốt, không xảy ra sai sót.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.incidentId}>{item.id}</Text>
                <Text style={styles.orderIdText}>Mã đơn: #{item.orderId}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: item.type === 'missing_item' ? '#FEE2E2' : '#FFEDD5' }]}>
                <Text style={[styles.typeBadgeText, { color: item.type === 'missing_item' ? COLORS.error : '#EA580C' }]}>
                  {item.typeLabel}
                </Text>
              </View>
            </View>

            {/* Customer Details */}
            <Text style={styles.customerNameText}>Khách hàng: <Text style={{ fontWeight: '700', color: COLORS.text }}>{item.customerName}</Text> · {item.time}</Text>
            <Text style={styles.description}>{item.description}</Text>

            {/* Evidence attachment */}
            {item.evidenceImg && (
              <View style={styles.evidenceBox}>
                <MaterialIcons name="image" size={16} color={COLORS.textSecondary} />
                <Text style={styles.evidenceText}>Ảnh sự cố từ khách hàng đính kèm</Text>
              </View>
            )}

            {/* Refund Cost */}
            <View style={styles.refundRow}>
              <Text style={styles.refundLabel}>Yêu cầu hoàn trả khách:</Text>
              <Text style={styles.refundValue}>{formatPrice(item.refundAmount)}</Text>
            </View>

            {/* AI Suggestion Box */}
            <View style={[
              styles.aiBox,
              item.aiAction === 'refund' ? styles.aiBoxRefund : styles.aiBoxDispute
            ]}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="bolt" size={18} color="#7C3AED" />
                <Text style={styles.aiTitle}>💡 AI gợi ý cách giải quyết</Text>
              </View>
              <Text style={styles.aiDesc}>{item.aiSuggestion}</Text>
            </View>

            {/* Actions Footer */}
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.appealBtn]}
                  onPress={() => handleAppeal(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="gavel" size={16} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                  <Text style={styles.appealBtnText}>Khiếu nại lên Ikigai</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionBtn, styles.refundBtn]}
                  onPress={() => handleRefund(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="check" size={16} color={COLORS.white} style={{ marginRight: 4 }} />
                  <Text style={styles.refundBtnText}>Đúng, Hoàn tiền</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },

  // List & Cards
  list: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingBottom: 8,
    marginBottom: 8,
  },
  incidentId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  orderIdText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  customerNameText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 10,
  },
  evidenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  evidenceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    marginBottom: 12,
  },
  refundLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  refundValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.error,
  },

  // AI Box Suggestion
  aiBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  aiBoxRefund: {
    backgroundColor: '#FAF5FF', // Light purple
    borderColor: '#7C3AED',
  },
  aiBoxDispute: {
    backgroundColor: '#F0F9FF', // Light blue
    borderColor: COLORS.primaryDark,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  aiDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // Footer buttons
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appealBtn: {
    borderWidth: 1,
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.white,
  },
  appealBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  refundBtn: {
    backgroundColor: COLORS.error,
  },
  refundBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Empty State
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
