import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import DeliveryHistoryItemComp, { DeliveryHistoryItem, DeliveryStatus } from '../../../components/driver/DeliveryHistoryItem';

type FilterType = 'all' | DeliveryStatus;

const MOCK_HISTORY: DeliveryHistoryItem[] = [
  { id: '1', orderId: 'IKG-9844', storeName: 'Ikigai Sushi & Sashimi', deliveryAddress: '56 Lê Lợi, Q.1', earning: 38000, distance: '2.5 km', status: 'completed', completedAt: '10:32', rating: 5 },
  { id: '2', orderId: 'IKG-9820', storeName: 'Phở Lý Quốc Sư', deliveryAddress: '12 Bùi Thị Xuân, Q.1', earning: 24000, distance: '1.2 km', status: 'completed', completedAt: '09:15', rating: 4 },
  { id: '3', orderId: 'IKG-9801', storeName: 'Cơm tấm Mộc', deliveryAddress: '88 Trần Hưng Đạo, Q.5', earning: 0, distance: '3.1 km', status: 'cancelled', completedAt: '08:44' },
  { id: '4', orderId: 'IKG-9789', storeName: 'Bánh mì Huỳnh Hoa', deliveryAddress: '26 Lê Thị Riêng, Q.1', earning: 18000, distance: '0.9 km', status: 'reimbursed', completedAt: '08:02', rating: 3 },
  { id: '5', orderId: 'IKG-9770', storeName: 'Bún bò Huế Việt', deliveryAddress: '54 Nguyễn Đình Chiểu, Q.3', earning: 32000, distance: '2.0 km', status: 'completed', completedAt: 'Hôm qua 18:30', rating: 5 },
  { id: '6', orderId: 'IKG-9755', storeName: 'Chả giò Bà Mười', deliveryAddress: '10 Phan Văn Trị, Q.5', earning: 21000, distance: '1.7 km', status: 'completed', completedAt: 'Hôm qua 17:10', rating: 4 },
];

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã huỷ' },
  { key: 'reimbursed', label: 'Bồi hoàn' },
];

export default function DeliveryHistoryScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<DeliveryHistoryItem | null>(null);

  const filtered = filter === 'all' ? MOCK_HISTORY : MOCK_HISTORY.filter(h => h.status === filter);

  const totalEarned = filtered
    .filter(h => h.status !== 'cancelled')
    .reduce((sum, h) => sum + h.earning, 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filtered.length}</Text>
          <Text style={styles.summaryLabel}>Đơn</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.driver }]}>
            {totalEarned.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.summaryLabel}>Thu nhập</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>
            {filtered.filter(h => h.status === 'cancelled').length}
          </Text>
          <Text style={styles.summaryLabel}>Đã huỷ</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <DeliveryHistoryItemComp
            item={item}
            onPress={setSelected}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="inbox" size={48} color={COLORS.textLight} style={{ marginBottom: SPACING.md }} />
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn #{selected.orderId}</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nhà hàng</Text>
                <Text style={styles.detailValue}>{selected.storeName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Địa chỉ giao</Text>
                <Text style={styles.detailValue}>{selected.deliveryAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quãng đường</Text>
                <Text style={styles.detailValue}>{selected.distance}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thu nhập</Text>
                <Text style={[styles.detailValue, { color: COLORS.driver, fontWeight: '700' }]}>
                  {selected.earning > 0 ? `+${selected.earning.toLocaleString('vi-VN')}đ` : '—'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>{selected.completedAt}</Text>
              </View>
              {selected.rating !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Đánh giá</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1,2,3,4,5].map(s => (
                      <Text key={s} style={{ fontSize: 18, color: s <= selected.rating! ? '#F59E0B' : COLORS.border }}>★</Text>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  summary: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  filterBar: { marginTop: SPACING.md },
  filterContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.driver,
    borderColor: COLORS.driver,
  },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTextActive: { color: COLORS.white },
  listContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  // Modal
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
  modalBody: { padding: SPACING.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1.5, textAlign: 'right' },
});
