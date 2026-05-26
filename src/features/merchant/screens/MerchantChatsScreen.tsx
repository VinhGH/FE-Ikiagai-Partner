import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatThread {
  id: string;          // Order ID
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;      // unread message count (0 = read)
  role: 'customer' | 'driver';
  orderStatus: 'new' | 'preparing' | 'ready' | 'completed';
}

type SectionTab = 'customer' | 'driver';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_THREADS: ChatThread[] = [
  // ── Customers ──
  {
    id: 'IKG-8822',
    name: 'Trần Thị B',
    avatar: 'B',
    lastMsg: 'Dạ, bếp nhà hàng đang tiến hành làm rồi ạ. Khoảng 5-10 phút nữa là xong...',
    time: '10:23',
    unread: 2,
    role: 'customer',
    orderStatus: 'new',
  },
  {
    id: 'IKG-1152',
    name: 'Nguyễn Văn C',
    avatar: 'C',
    lastMsg: 'Dạ được ạ, quán đã xếp thêm đũa vào túi hàng cho bạn rồi nhé.',
    time: '10:16',
    unread: 0,
    role: 'customer',
    orderStatus: 'preparing',
  },
  {
    id: 'IKG-7710',
    name: 'Lê Hồng Ánh',
    avatar: 'A',
    lastMsg: 'Quán ơi, đơn của mình có thể nhanh thêm một chút không ạ?',
    time: '09:58',
    unread: 1,
    role: 'customer',
    orderStatus: 'new',
  },
  // ── Drivers ──
  {
    id: 'IKG-9801',
    name: 'Nguyễn Văn A',
    avatar: 'A',
    lastMsg: 'Ok quán, mình đang chạy lại rồi, khoảng 3 phút nữa mình tới lấy đơn nhé.',
    time: '09:51',
    unread: 0,
    role: 'driver',
    orderStatus: 'preparing',
  },
  {
    id: 'IKG-5599',
    name: 'Trần Minh Khoa',
    avatar: 'K',
    lastMsg: 'Quán ơi, mình tới rồi, đang đợi ở cổng nhé!',
    time: '09:32',
    unread: 1,
    role: 'driver',
    orderStatus: 'ready',
  },
];

// ─── Status Badge Map ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  new:       { label: 'Mới', bg: '#FEE2E2', color: COLORS.error },
  preparing: { label: 'Đang làm', bg: '#FEF3C7', color: '#D97706' },
  ready:     { label: 'Xong món', bg: COLORS.primaryLight, color: COLORS.primaryDark },
  completed: { label: 'Hoàn thành', bg: '#DCFCE7', color: '#16A34A' },
};

// ─── Thread Card ──────────────────────────────────────────────────────────────

function ThreadCard({
  item,
  onPress,
}: {
  item: ChatThread;
  onPress: () => void;
}) {
  const isDriver = item.role === 'driver';
  const accentColor = isDriver ? COLORS.driver : COLORS.primaryDark;
  const accentLight = isDriver ? COLORS.driverLight : COLORS.primaryLight;
  const statusCfg = STATUS_CONFIG[item.orderStatus];

  return (
    <TouchableOpacity
      style={[styles.card, item.unread > 0 && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Left: Avatar */}
      <View style={[styles.avatarWrapper, { backgroundColor: accentLight }]}>
        <Text style={[styles.avatarText, { color: accentColor }]}>
          {item.avatar}
        </Text>
        {/* Role badge */}
        <View style={[styles.roleBadge, { backgroundColor: accentColor }]}>
          <MaterialIcons
            name={isDriver ? 'motorcycle' : 'person'}
            size={9}
            color={COLORS.white}
          />
        </View>
      </View>

      {/* Right: Content */}
      <View style={styles.cardContent}>
        {/* Row 1: Name + Time */}
        <View style={styles.cardRow}>
          <Text style={[styles.cardName, item.unread > 0 && { color: accentColor }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>

        {/* Row 2: Last message + unread badge */}
        <View style={styles.cardRow}>
          <Text
            style={[styles.cardMsg, item.unread > 0 && styles.cardMsgBold]}
            numberOfLines={1}
          >
            {item.lastMsg}
          </Text>
          {item.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.unreadBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>

        {/* Row 3: Order info + status */}
        <View style={[styles.cardRow, { marginTop: 6 }]}>
          <Text style={styles.orderTag}>#{item.id}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusPillText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Right arrow */}
      <MaterialIcons name="chevron-right" size={20} color={COLORS.textLight} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptySection({ role }: { role: SectionTab }) {
  const isDriver = role === 'driver';
  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: isDriver ? COLORS.driverLight : COLORS.primaryLight }]}>
        <MaterialIcons
          name={isDriver ? 'motorcycle' : 'person'}
          size={36}
          color={isDriver ? COLORS.driver : COLORS.primaryDark}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {isDriver ? 'Chưa có tài xế nào nhắn tin' : 'Chưa có khách hàng nào nhắn tin'}
      </Text>
      <Text style={styles.emptySub}>
        {isDriver
          ? 'Khi tài xế nhận đơn và liên hệ, tin nhắn sẽ hiển thị tại đây.'
          : 'Khi khách hàng gửi tin nhắn hỗ trợ đơn hàng, cuộc hội thoại sẽ xuất hiện tại đây.'}
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MerchantChatsScreen() {
  const [activeTab, setActiveTab] = useState<SectionTab>('customer');

  const customerThreads = MOCK_THREADS.filter((t) => t.role === 'customer');
  const driverThreads   = MOCK_THREADS.filter((t) => t.role === 'driver');
  const customerUnread  = customerThreads.reduce((n, t) => n + t.unread, 0);
  const driverUnread    = driverThreads.reduce((n, t) => n + t.unread, 0);

  const threads = activeTab === 'customer' ? customerThreads : driverThreads;

  const handlePress = (thread: ChatThread) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: thread.id, tab: thread.role },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <MaterialIcons name="chat" size={22} color={COLORS.primaryDark} style={{ marginRight: 8 }} />
        <View>
          <Text style={styles.headerTitle}>Hộp thư</Text>
          <Text style={styles.headerSub}>Hỗ trợ khách hàng &amp; điều phối tài xế</Text>
        </View>
      </View>

      {/* ── Section Tabs ── */}
      <View style={styles.tabRow}>
        {/* Customer Tab */}
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'customer' && styles.tabBtnActiveCustomer,
          ]}
          onPress={() => setActiveTab('customer')}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="person"
            size={18}
            color={activeTab === 'customer' ? COLORS.primaryDark : COLORS.textLight}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'customer' && { color: COLORS.primaryDark, fontWeight: '800' },
          ]}>
            Khách hàng
          </Text>
          {customerUnread > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: COLORS.primaryDark }]}>
              <Text style={styles.tabBadgeText}>{customerUnread}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.tabDivider} />

        {/* Driver Tab */}
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'driver' && styles.tabBtnActiveDriver,
          ]}
          onPress={() => setActiveTab('driver')}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="motorcycle"
            size={18}
            color={activeTab === 'driver' ? COLORS.driver : COLORS.textLight}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'driver' && { color: COLORS.driver, fontWeight: '800' },
          ]}>
            Tài xế
          </Text>
          {driverUnread > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: COLORS.driver }]}>
              <Text style={styles.tabBadgeText}>{driverUnread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Section Label Bar ── */}
      <View style={[
        styles.sectionBar,
        { backgroundColor: activeTab === 'customer' ? COLORS.primaryLight : COLORS.driverLight },
      ]}>
        <MaterialIcons
          name={activeTab === 'customer' ? 'person' : 'motorcycle'}
          size={14}
          color={activeTab === 'customer' ? COLORS.primaryDark : COLORS.driverDark}
        />
        <Text style={[
          styles.sectionBarText,
          { color: activeTab === 'customer' ? COLORS.primaryDark : COLORS.driverDark },
        ]}>
          {activeTab === 'customer'
            ? `${customerThreads.length} cuộc hội thoại với khách hàng`
            : `${driverThreads.length} cuộc hội thoại với tài xế`}
        </Text>
        {(activeTab === 'customer' ? customerUnread : driverUnread) > 0 && (
          <Text style={[
            styles.sectionBarUnread,
            { color: activeTab === 'customer' ? COLORS.primaryDark : COLORS.driver },
          ]}>
            · {activeTab === 'customer' ? customerUnread : driverUnread} chưa đọc
          </Text>
        )}
      </View>

      {/* ── Thread List ── */}
      <FlatList
        key={activeTab}
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThreadCard item={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptySection role={activeTab} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 22,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
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
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActiveCustomer: {
    borderBottomColor: COLORS.primaryDark,
  },
  tabBtnActiveDriver: {
    borderBottomColor: COLORS.driver,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  tabDivider: {
    width: 1,
    marginVertical: 10,
    backgroundColor: COLORS.border,
  },

  // Section info bar
  sectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  sectionBarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionBarUnread: {
    fontSize: 12,
    fontWeight: '700',
  },

  // List
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // Thread Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  cardUnread: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FAFCFF',
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: SPACING.md,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  cardTime: {
    fontSize: 11,
    color: COLORS.textLight,
    flexShrink: 0,
  },
  cardMsg: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: 8,
    marginTop: 3,
  },
  cardMsgBold: {
    color: COLORS.text,
    fontWeight: '700',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  orderTag: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    flex: 1,
  },
  statusPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
