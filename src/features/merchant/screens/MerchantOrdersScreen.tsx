import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, FlatList, Modal, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/useAuthStore';
import { router } from 'expo-router';

interface OrderItem {
  name: string;
  qty: number;
  price: string;
}

interface MerchantOrder {
  id: string;
  customerName: string;
  phone: string;
  time: string;
  items: OrderItem[];
  note?: string;
  total: string;
  payout: string;
  status: 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  driverName?: string;
  driverPhone?: string;
  declineReason?: string;
}

const INITIAL_ORDERS: MerchantOrder[] = [
  {
    id: 'IKG-8822',
    customerName: 'Trần Thị B',
    phone: '0912345678',
    time: '5 phút trước',
    items: [
      { name: 'Combo Sushi Gia Đình (24 miếng)', qty: 1, price: '245.000đ' },
      { name: 'Nước ép cam nguyên chất', qty: 2, price: '70.000đ' },
      { name: 'Súp miso nóng', qty: 1, price: '35.000đ' },
    ],
    note: 'Ít mù tạt, thêm đũa ăn',
    total: '350.000đ',
    payout: '297.500đ', // 85% payout after 15% platform commission
    status: 'new',
  },
  {
    id: 'IKG-1152',
    customerName: 'Nguyễn Văn C',
    phone: '0934569876',
    time: '12 phút trước',
    items: [
      { name: 'Cơm lươn Nhật Bản đặc biệt', qty: 1, price: '185.000đ' },
      { name: 'Trà xanh sữa đá', qty: 1, price: '45.000đ' },
    ],
    status: 'new',
    total: '230.000đ',
    payout: '195.500đ',
  },
  {
    id: 'IKG-9801',
    customerName: 'Phạm Minh D',
    phone: '0978112233',
    time: '25 phút trước',
    items: [
      { name: 'Mì Udon hải sản xào cay', qty: 2, price: '190.000đ' },
    ],
    note: 'Làm cực cay',
    total: '190.000đ',
    payout: '161.500đ',
    status: 'preparing',
    driverName: 'Tài xế Nguyễn Văn A',
    driverPhone: '0908888888',
  },
  {
    id: 'IKG-9755',
    customerName: 'Lê Hoàng E',
    phone: '0961122334',
    time: '1 giờ trước',
    items: [
      { name: 'Cơm gà sốt Teriyaki', qty: 1, price: '75.000đ' },
    ],
    total: '75.000đ',
    payout: '63.750đ',
    status: 'completed',
  },
];

type OrderTab = 'new' | 'preparing' | 'history';

export default function MerchantOrdersScreen() {
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<MerchantOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<OrderTab>('new');

  // New action states
  const [declineOrderId, setDeclineOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<MerchantOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'new';
    if (activeTab === 'preparing') return o.status === 'preparing' || o.status === 'ready';
    return o.status === 'completed' || o.status === 'cancelled';
  });

  // Price calculation helpers
  const parsePrice = (priceStr: string): number => {
    const numericStr = priceStr.replace(/\D/g, '');
    return parseInt(numericStr, 10) || 0;
  };

  const formatPrice = (value: number): string => {
    return value.toLocaleString('vi-VN') + 'đ';
  };

  // Mask phone number for UI display (e.g. 0912345678 -> 091 *** 5678)
  const maskPhone = (phoneNum: string): string => {
    if (phoneNum.length < 7) return phoneNum;
    return phoneNum.slice(0, 3) + ' *** ' + phoneNum.slice(-4);
  };

  // Communication actions
  const handleCall = (phoneNum: string) => {
    const cleanPhone = phoneNum.replace(/[^\d+]/g, '');
    const url = `tel:${cleanPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi trên thiết bị này');
        }
      })
      .catch((err) => console.error('Error calling', err));
  };

  const handleMessage = (orderId: string, tab: 'customer' | 'driver' = 'customer') => {
    router.push({ pathname: '/chat/[id]', params: { id: orderId, tab } });
  };

  const handleAccept = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'preparing',
              driverName: 'Tài xế Nguyễn Văn A',
              driverPhone: '0908888888',
            }
          : o
      )
    );
    Alert.alert('Thành công', `Đã nhận đơn #${orderId}. Vui lòng chế biến món ăn.`);
  };

  const handleOpenDecline = (orderId: string) => {
    setDeclineOrderId(orderId);
  };

  const handleConfirmDecline = (reason: string) => {
    if (!declineOrderId) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === declineOrderId
          ? { ...o, status: 'cancelled', declineReason: reason }
          : o
      )
    );
    setDeclineOrderId(null);
    Alert.alert('Từ chối đơn hàng', `Đã từ chối đơn hàng #${declineOrderId} với lý do: ${reason}`);
  };

  // Order editor actions
  const handleStartEdit = (order: MerchantOrder) => {
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  const handleRemoveItemFromEditing = (index: number) => {
    if (!editingOrder) return;
    const newItems = editingOrder.items.filter((_, i) => i !== index);
    
    // Recalculate total and payout
    const newTotal = newItems.reduce((acc, item) => acc + parsePrice(item.price), 0);
    const newPayout = Math.round(newTotal * 0.85);

    setEditingOrder({
      ...editingOrder,
      items: newItems,
      total: formatPrice(newTotal),
      payout: formatPrice(newPayout),
    });
  };

  const handleSaveEdit = () => {
    if (!editingOrder) return;
    if (editingOrder.items.length === 0) {
      Alert.alert('Lỗi', 'Đơn hàng không thể rỗng. Hãy chọn Từ chối đơn hàng nếu muốn hủy toàn bộ.');
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
    );
    setEditingOrder(null);
    Alert.alert('Thành công', `Đã cập nhật các món ăn của đơn #${editingOrder.id}.`);
  };

  const handleReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' } : o))
    );
    Alert.alert('Thành công', `Đơn #${orderId} đã chế biến xong. Tài xế đang đến nhận hàng.`);
  };

  const handleCompleteSimulation = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );
    Alert.alert('Giả lập giao hàng', `Tài xế đã giao thành công đơn #${orderId} cho khách hàng.`);
  };

  const renderOrderItem = ({ item }: { item: MerchantOrder }) => (
    <View style={styles.orderCard}>
      {/* Card Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{item.id}</Text>
          <Text style={styles.orderTime}>{item.time}</Text>
        </View>
        <View style={styles.statusBadgeContainer}>
          {item.status === 'new' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity 
                style={styles.editDishesBtn} 
                onPress={() => handleStartEdit(item)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={14} color="#6B7280" />
                <Text style={styles.editDishesBtnText}>Sửa món</Text>
              </TouchableOpacity>
              <View style={styles.pulseNode}>
                <Text style={styles.badgeNewText}>MỚI</Text>
              </View>
            </View>
          )}
          {item.status === 'preparing' && (
            <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '700' }}>ĐANG CHẾ BIẾN</Text>
            </View>
          )}
          {item.status === 'ready' && (
            <View style={[styles.statusBadge, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={{ color: COLORS.primaryDark, fontSize: 11, fontWeight: '700' }}>CHỜ TÀI XẾ</Text>
            </View>
          )}
          {item.status === 'completed' && (
            <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: '700' }}>HOÀN THÀNH</Text>
            </View>
          )}
          {item.status === 'cancelled' && (
            <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
              <Text style={{ color: COLORS.error, fontSize: 11, fontWeight: '700' }}>ĐÃ HUỶ</Text>
            </View>
          )}
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerRow}>
        <MaterialIcons name="person-outline" size={18} color={COLORS.textSecondary} />
        <Text style={styles.customerText}>
          Khách: {item.customerName} · {maskPhone(item.phone)}
        </Text>
        <View style={styles.communicationIcons}>
          <TouchableOpacity 
            style={styles.commIconBtn} 
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="phone" size={15} color={COLORS.driver} />
          </TouchableOpacity>
          {item.status !== 'new' && (
            <TouchableOpacity 
              style={styles.commIconBtn} 
              onPress={() => handleMessage(item.id, 'customer')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="sms" size={15} color="#0EA5E9" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Driver info if assigned */}
      {(item.status === 'preparing' || item.status === 'ready') && item.driverName && (
        <View style={styles.driverRow}>
          <MaterialIcons name="motorcycle" size={18} color={COLORS.driver} />
          <Text style={styles.driverText}>
            {item.driverName} ({item.driverPhone ? maskPhone(item.driverPhone) : ''})
          </Text>
          <View style={styles.communicationIcons}>
            {item.driverPhone && (
              <TouchableOpacity 
                style={styles.commIconBtn} 
                onPress={() => handleCall(item.driverPhone!)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="phone" size={15} color={COLORS.driver} />
              </TouchableOpacity>
            )}
            {/* Message driver – allowed because order is accepted */}
            <TouchableOpacity 
              style={styles.commIconBtn} 
              onPress={() => handleMessage(item.id, 'driver')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="sms" size={15} color={COLORS.driver} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dishes List */}
      <View style={styles.dishesBox}>
        {item.items.map((dish, idx) => (
          <View key={idx} style={styles.dishItem}>
            <Text style={styles.dishQty}>{dish.qty}x</Text>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.dishPrice}>{dish.price}</Text>
          </View>
        ))}
      </View>

      {/* Notes */}
      {item.note && (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>📝 Ghi chú: {item.note}</Text>
        </View>
      )}

      {/* Decline Reason Display */}
      {item.status === 'cancelled' && item.declineReason && (
        <View style={styles.declineReasonBox}>
          <Text style={styles.declineReasonText}>❌ Lý do từ chối: {item.declineReason}</Text>
        </View>
      )}

      {/* Footer Pricing & Actions */}
      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>Khách trả: <Text style={styles.totalVal}>{item.total}</Text></Text>
          <Text style={styles.payoutLabel}>Doanh thu của quán: <Text style={styles.payoutVal}>{item.payout}</Text></Text>
        </View>

        <View style={styles.actionsContainer}>
          {item.status === 'new' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.declineBtn]}
                onPress={() => handleOpenDecline(item.id)}
              >
                <Text style={styles.declineText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleAccept(item.id)}
              >
                <Text style={styles.acceptText}>Nhận đơn</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'preparing' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.readyBtn]}
              onPress={() => handleReady(item.id)}
            >
              <Text style={styles.readyText}>Báo chuẩn bị xong</Text>
            </TouchableOpacity>
          )}

          {item.status === 'ready' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.simulateBtn]}
              onPress={() => handleCompleteSimulation(item.id)}
            >
              <Text style={styles.simulateText}>⚡ Giả lập giao xong</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Merchant Title Info */}
      <View style={styles.headerInfo}>
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>{user?.name || 'Cửa hàng Ikigai'}</Text>
          <View style={styles.activeDot} />
        </View>
        <Text style={styles.headerSub}>Chào ngày mới, chuẩn bị món ngon cho khách nhé! 🍳</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
          onPress={() => setActiveTab('new')}
        >
          <View style={styles.tabHeaderRow}>
            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>Mới</Text>
            {orders.filter((o) => o.status === 'new').length > 0 && (
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewVal}>
                  {orders.filter((o) => o.status === 'new').length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'preparing' && styles.tabActive]}
          onPress={() => setActiveTab('preparing')}
        >
          <Text style={[styles.tabText, activeTab === 'preparing' && styles.tabTextActive]}>
            Đang chuẩn bị ({orders.filter((o) => o.status === 'preparing' || o.status === 'ready').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Lịch sử</Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptySub}>Các đơn hàng mới của cửa hàng sẽ xuất hiện tại đây.</Text>
          </View>
        }
      />

      {/* Decline Reason Picker Modal */}
      <Modal
        visible={declineOrderId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeclineOrderId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Lý do từ chối đơn hàng</Text>
              <Text style={styles.sheetSubtitle}>Vui lòng chọn lý do từ chối đơn hàng này để phản hồi hệ thống và khách hàng.</Text>
            </View>

            <View style={styles.optionsList}>
              {[
                'Hết nguyên liệu / Món hết hàng',
                'Quán đang quá tải / Quá bận',
                'Quán chuẩn bị đóng cửa',
                'Khách hàng yêu cầu hủy',
                'Lý do khác'
              ].map((reason, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.optionItem}
                  onPress={() => handleConfirmDecline(reason)}
                >
                  <View style={[styles.optionIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialIcons name="cancel" size={20} color={COLORS.error} />
                  </View>
                  <View style={styles.optionTextWrapper}>
                    <Text style={styles.optionLabel}>{reason}</Text>
                  </View>
                  <Text style={styles.optionArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setDeclineOrderId(null)}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Order Item Editor Modal */}
      <Modal
        visible={editingOrder !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Chỉnh sửa món ăn (#{editingOrder?.id})</Text>
              <Text style={styles.sheetSubtitle}>Xóa bớt món không còn phục vụ. Tổng tiền và doanh thu quán sẽ tự động giảm tương ứng.</Text>
            </View>

            <ScrollView style={{ maxHeight: 250, marginBottom: SPACING.md }} showsVerticalScrollIndicator={false}>
              {editingOrder?.items.map((dish, idx) => (
                <View key={idx} style={styles.editDishRow}>
                  <View style={styles.editDishInfo}>
                    <Text style={styles.editDishQty}>{dish.qty}x</Text>
                    <Text style={styles.editDishName}>{dish.name}</Text>
                  </View>
                  <View style={styles.editDishAction}>
                    <Text style={styles.editDishPrice}>{dish.price}</Text>
                    <TouchableOpacity 
                      style={styles.removeDishBtn}
                      onPress={() => handleRemoveItemFromEditing(idx)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {editingOrder?.items.length === 0 && (
                <View style={{ alignItems: 'center', paddingVertical: SPACING.md }}>
                  <Text style={{ color: COLORS.error, fontSize: 13, fontWeight: '600' }}>
                    Không còn món ăn nào trong đơn!
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.editSummaryBox}>
              <View style={styles.editSummaryRow}>
                <Text style={styles.editSummaryLabel}>Tổng tiền khách trả mới:</Text>
                <Text style={styles.editSummaryVal}>{editingOrder?.total}</Text>
              </View>
              <View style={styles.editSummaryRow}>
                <Text style={styles.editSummaryLabel}>Doanh thu quán mới (85%):</Text>
                <Text style={[styles.editSummaryVal, { color: COLORS.driverDark, fontSize: 16 }]}>
                  {editingOrder?.payout}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
              <TouchableOpacity 
                style={[styles.cancelBtn, { flex: 1, marginTop: 0 }]}
                onPress={() => setEditingOrder(null)}
              >
                <Text style={styles.cancelBtnText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmSaveBtn, { flex: 2 }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.confirmSaveText}>Xác nhận lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  headerInfo: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandName: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.driver },
  tabHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabText: { fontSize: SIZES.body - 1, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.driver, fontWeight: '700' },
  badgeNew: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNewVal: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  
  // List
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  orderId: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.text },
  orderTime: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadgeContainer: { flexDirection: 'row', alignItems: 'center' },
  pulseNode: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeNewText: { color: COLORS.error, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  customerText: { fontSize: 13, color: COLORS.text },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  driverText: { fontSize: 13, color: COLORS.driverDark, fontWeight: '600' },
  
  // Dishes
  dishesBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.sm + 2,
    marginVertical: SPACING.sm,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dishQty: { fontSize: 13, fontWeight: '700', color: COLORS.driverDark, width: 28 },
  dishName: { fontSize: 13, color: COLORS.text, flex: 1 },
  dishPrice: { fontSize: 13, color: COLORS.textSecondary },
  
  // Note
  noteBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    marginBottom: SPACING.sm,
  },
  noteText: { fontSize: 12, color: COLORS.error, fontWeight: '500' },
  
  // Card Footer
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  totalLabel: { fontSize: 12, color: COLORS.textSecondary },
  totalVal: { fontWeight: '700', color: COLORS.text },
  payoutLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  payoutVal: { fontWeight: '800', color: COLORS.driverDark, fontSize: 13 },
  
  // Actions
  actionsContainer: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineBtn: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  declineText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  acceptBtn: { backgroundColor: COLORS.driver },
  acceptText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  readyBtn: { backgroundColor: COLORS.driver, paddingHorizontal: 20 },
  readyText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  simulateBtn: { backgroundColor: COLORS.primaryDark, paddingHorizontal: 16 },
  simulateText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  
  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
  emptyTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, lineHeight: 18 },

  // Communication
  communicationIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  commIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Edit dishes button inside card header
  editDishesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editDishesBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },

  // Decline reason display
  declineReasonBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  declineReasonText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 40,
    ...SHADOWS.heavy,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  sheetTitle: {
    fontSize: SIZES.h3 - 2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 17,
  },
  optionsList: {
    marginBottom: SPACING.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionLabel: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionArrow: {
    fontSize: 20,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.xs,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  cancelBtnText: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  // Edit dishes list item row
  editDishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  editDishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editDishQty: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.driverDark,
    width: 30,
  },
  editDishName: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  editDishAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  editDishPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  removeDishBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Edit Summary Box
  editSummaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  editSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editSummaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  editSummaryVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Confirm save button
  confirmSaveBtn: {
    backgroundColor: COLORS.driver,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  confirmSaveText: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.white,
  },
});
