import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Keyboard, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type Participant = 'customer' | 'driver';

interface Message {
  id: string;
  /** who sent this message */
  from: 'merchant' | 'customer' | 'driver';
  text: string;
  time: string;
}

interface ChatSession {
  orderId: string;
  /** order status affects what's allowed */
  orderStatus: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customer: { name: string; phone: string };
  driver?: { name: string; phone: string };
  customerMessages: Message[];
  driverMessages: Message[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SESSIONS: Record<string, ChatSession> = {
  'IKG-8822': {
    orderId: 'IKG-8822',
    orderStatus: 'new',
    customer: { name: 'Trần Thị B', phone: '0912345678' },
    // No driver yet – order is new
    customerMessages: [
      { id: '1', from: 'customer', text: 'Chào quán, món combo sushi mình ghi chú ít mù tạt nha.', time: '10:20' },
      { id: '2', from: 'merchant', text: 'Dạ vâng ạ, quán đã ghi nhận thông tin ít mù tạt rồi nha bạn!', time: '10:21' },
      { id: '3', from: 'customer', text: 'Cảm ơn quán nhiều nha! Làm nhanh giúp mình nha vì sắp tới giờ ăn trưa.', time: '10:22' },
      { id: '4', from: 'merchant', text: 'Dạ, bếp nhà hàng đang tiến hành làm rồi ạ. Khoảng 5-10 phút nữa là xong nha bạn.', time: '10:23' },
    ],
    driverMessages: [],
  },
  'IKG-1152': {
    orderId: 'IKG-1152',
    orderStatus: 'new',
    customer: { name: 'Nguyễn Văn C', phone: '0934569876' },
    customerMessages: [
      { id: '1', from: 'customer', text: 'Quán ơi, cơm lươn Nhật có thể cho mình xin thêm đũa ăn được không?', time: '10:15' },
      { id: '2', from: 'merchant', text: 'Dạ được ạ, quán đã xếp thêm đũa vào túi hàng cho bạn rồi nhé.', time: '10:16' },
    ],
    driverMessages: [],
  },
  'IKG-9801': {
    orderId: 'IKG-9801',
    orderStatus: 'preparing',
    customer: { name: 'Phạm Minh D', phone: '0978112233' },
    driver: { name: 'Nguyễn Văn A', phone: '0908888888' },
    customerMessages: [
      { id: '1', from: 'customer', text: 'Quán ơi đơn mình khi nào xong vậy?', time: '09:45' },
      { id: '2', from: 'merchant', text: 'Dạ khoảng 10 phút nữa bạn ơi, quán đang chuẩn bị gấp!', time: '09:46' },
    ],
    driverMessages: [
      { id: '1', from: 'merchant', text: 'Chào tài xế, món mì udon xào cay đã làm xong rồi nhé, bạn ghé lấy giúp quán nha.', time: '09:50' },
      { id: '2', from: 'driver', text: 'Ok quán, mình đang chạy lại rồi, khoảng 3 phút nữa mình tới cửa hàng lấy đơn nhé.', time: '09:51' },
    ],
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTab({
  active,
  label,
  icon,
  color,
  badge,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: string;
  color: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sectionTab, active && { borderBottomColor: color, borderBottomWidth: 3 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon as any} size={18} color={active ? color : COLORS.textLight} />
      <Text style={[styles.sectionTabText, active && { color, fontWeight: '700' }]}>{label}</Text>
      {!!badge && (
        <View style={[styles.tabBadge, { backgroundColor: color }]}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface MessageItemProps {
  item: Message;
  participant: Participant;
  participantName: string;
}

function MessageItem({ item, participant, participantName }: MessageItemProps) {
  const isMe = item.from === 'merchant';
  const otherColor = participant === 'driver' ? COLORS.driver : COLORS.primaryDark;

  return (
    <View style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]}>
      {!isMe && (
        <View style={[styles.avatarPlaceholder, { backgroundColor: participant === 'driver' ? COLORS.driverLight : COLORS.primaryLight }]}>
          <Text style={[styles.avatarText, { color: otherColor }]}>
            {participantName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.myBubble : [styles.otherBubble, { borderColor: participant === 'driver' ? COLORS.driverLight : COLORS.border }]]}>
        <Text style={[styles.bubbleText, isMe ? styles.myText : styles.otherText]}>{item.text}</Text>
        <Text style={[styles.timeText, isMe ? styles.myTime : styles.otherTime]}>{item.time}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { id, tab: tabParam } = useLocalSearchParams<{ id: string; tab?: string }>();
  const session = MOCK_SESSIONS[id] || {
    orderId: id || 'Đơn hàng',
    orderStatus: 'new' as const,
    customer: { name: 'Khách hàng', phone: '' },
    customerMessages: [],
    driverMessages: [],
  };

  const [activeTab, setActiveTab] = useState<Participant>(
    tabParam === 'driver' ? 'driver' : 'customer'
  );
  const [customerMsgs, setCustomerMsgs] = useState<Message[]>(session.customerMessages);
  const [driverMsgs, setDriverMsgs] = useState<Message[]>(session.driverMessages);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const messages = activeTab === 'customer' ? customerMsgs : driverMsgs;
  const setMessages = activeTab === 'customer' ? setCustomerMsgs : setDriverMsgs;

  // Can the merchant message the driver? Only if order is accepted (preparing/ready)
  const orderAccepted = session.orderStatus === 'preparing' || session.orderStatus === 'ready';
  const hasDriver = !!session.driver;
  const canMessageDriver = orderAccepted && hasDriver;

  useEffect(() => {
    setTimeout(() => {
      if (flatListRef.current && messages.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 150);
  }, [messages, activeTab]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: String(messages.length + 1),
      from: 'merchant',
      text: inputText.trim(),
      time: getTimeString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    Keyboard.dismiss();
  };

  const handleCall = (phoneNum: string) => {
    const clean = phoneNum.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() =>
      Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi trên thiết bị này.')
    );
  };

  // Header info based on active tab
  const headerName =
    activeTab === 'customer' ? session.customer.name : (session.driver?.name ?? '');
  const headerPhone =
    activeTab === 'customer' ? session.customer.phone : (session.driver?.phone ?? '');
  const headerColor = activeTab === 'driver' ? COLORS.driver : COLORS.primaryDark;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerUserInfo}>
          <View style={styles.headerNameRow}>
            <MaterialIcons
              name={activeTab === 'driver' ? 'motorcycle' : 'person'}
              size={16}
              color={headerColor}
            />
            <Text style={[styles.userName, { color: headerColor }]}>{headerName}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.statusText}>Đơn #{session.orderId}</Text>
          </View>
        </View>
        {/* Call button */}
        {headerPhone ? (
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: activeTab === 'driver' ? COLORS.driverLight : COLORS.primaryLight }]}
            onPress={() => handleCall(headerPhone)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="phone" size={18} color={headerColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Section Tabs ── */}
      <View style={styles.sectionTabs}>
        <SectionTab
          active={activeTab === 'customer'}
          label="Khách hàng"
          icon="person"
          color={COLORS.primaryDark}
          badge={customerMsgs.filter((m) => m.from === 'customer').length > 0 ? undefined : undefined}
          onPress={() => setActiveTab('customer')}
        />
        <SectionTab
          active={activeTab === 'driver'}
          label={hasDriver ? `Tài xế · ${session.driver?.name ?? ''}` : 'Tài xế'}
          icon="motorcycle"
          color={COLORS.driver}
          onPress={() => setActiveTab('driver')}
        />
      </View>

      {/* ── Driver locked notice ── */}
      {activeTab === 'driver' && !canMessageDriver && (
        <View style={styles.lockedNotice}>
          <MaterialIcons name="lock" size={16} color={COLORS.textSecondary} />
          <Text style={styles.lockedText}>
            {hasDriver
              ? 'Chỉ có thể gọi điện cho tài xế khi đơn hàng đang được chuẩn bị.'
              : 'Chưa có tài xế nhận đơn. Khi tài xế nhận đơn, bạn có thể nhắn tin và gọi điện tại đây.'}
          </Text>
        </View>
      )}

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              participant={activeTab}
              participantName={activeTab === 'customer' ? session.customer.name : (session.driver?.name ?? '')}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {activeTab === 'driver' && !hasDriver ? (
                <>
                  <MaterialIcons name="motorcycle" size={56} color={COLORS.textLight} />
                  <Text style={styles.emptyTitle}>Chưa có tài xế</Text>
                  <Text style={styles.emptySub}>
                    Đơn hàng chưa được tài xế nhận. Tin nhắn sẽ xuất hiện khi tài xế đã nhận đơn.
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="chat-bubble-outline" size={56} color={COLORS.textLight} />
                  <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
                  <Text style={styles.emptySub}>Bắt đầu cuộc hội thoại để trao đổi thông tin.</Text>
                </>
              )}
            </View>
          }
        />

        {/* ── Input Bar ── */}
        {(activeTab === 'customer' || canMessageDriver) ? (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={COLORS.textLight}
              multiline={true}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: activeTab === 'driver' ? COLORS.driver : COLORS.primaryDark },
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="send" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : activeTab === 'driver' && hasDriver ? (
          // Can only call driver, not message
          <View style={styles.callOnlyBar}>
            <MaterialIcons name="info-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.callOnlyText}>
              Chỉ có thể gọi điện khi đơn chưa được nhận
            </Text>
            <TouchableOpacity
              style={styles.callOnlyBtn}
              onPress={() => handleCall(session.driver!.phone)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="phone" size={16} color={COLORS.white} />
              <Text style={styles.callOnlyBtnText}>Gọi điện</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: { marginRight: SPACING.md, padding: 4 },
  headerUserInfo: { flex: 1 },
  headerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: SIZES.body, fontWeight: '800' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 11, color: COLORS.textSecondary },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section tabs
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  sectionTabText: {
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
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },

  // Locked notice
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockedText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // Messages
  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },
  listContent: { padding: SPACING.md, paddingBottom: SPACING.lg },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
    maxWidth: '82%',
  },
  myRow: { alignSelf: 'flex-end' },
  otherRow: { alignSelf: 'flex-start' },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: { fontSize: 14, fontWeight: '800' },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOWS.light,
  },
  myBubble: {
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  myText: { color: COLORS.white },
  otherText: { color: COLORS.text },
  timeText: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  myTime: { color: COLORS.white + '99' },
  otherTime: { color: COLORS.textLight },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    paddingBottom: 8,
    maxHeight: 100,
    fontSize: 13,
    color: COLORS.text,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },

  // Call-only bar (when driver exists but order not accepted)
  callOnlyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  callOnlyText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  callOnlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.driver,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  callOnlyBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 18,
  },
});
