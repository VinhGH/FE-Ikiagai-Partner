import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

type DeliveryStep = 'pickup' | 'delivering' | 'completed';

const MOCK_ORDER = {
  id: '#IKG-9844',
  store: {
    name: 'Ikigai Sushi & Sashimi',
    address: '12 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Q.1',
    phone: '028 3838 7878',
  },
  customer: {
    address: '56 Lê Lợi, Phường Bến Nghé, Q.1, TP.HCM',
    phone: '090 *** 1234',
    note: 'Gõ chuông cửa tầng 3, cảm ơn tài xế!',
  },
  items: [
    { name: 'Sushi cá hồi set 8 miếng', qty: 1, price: '145.000đ' },
    { name: 'Nước suối Aquafina', qty: 2, price: '10.000đ' },
    { name: 'Miso soup', qty: 1, price: '35.000đ' },
  ],
  earning: '38.000đ',
  distance: '2.5 km',
  estimatedTime: '18 phút',
};

export default function CurrentDeliveryScreen() {
  const [step, setStep] = useState<DeliveryStep>('pickup');

  const handleNextStep = () => {
    if (step === 'pickup') {
      setStep('delivering');
    } else if (step === 'delivering') {
      Alert.alert(
        'Xác nhận giao hàng',
        'Bạn đã giao hàng thành công cho khách?',
        [
          { text: 'Chưa', style: 'cancel' },
          {
            text: 'Đã giao thành công',
            onPress: () => {
              setStep('completed');
            },
          },
        ]
      );
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Báo cáo sự cố',
      'Chọn loại sự cố:',
      [
        { text: 'Không thể liên hệ khách', onPress: () => {} },
        { text: 'Địa chỉ không chính xác', onPress: () => {} },
        { text: 'Nhà hàng chưa sẵn hàng', onPress: () => {} },
        { text: 'Huỷ', style: 'cancel' },
      ]
    );
  };

  const STEP_CONFIG = {
    pickup: {
      label: 'Đang đến lấy hàng',
      sub: `Đến ${MOCK_ORDER.store.name}`,
      btnLabel: 'Đã lấy hàng xong',
      btnColor: COLORS.primary,
      progress: 1,
    },
    delivering: {
      label: 'Đang giao hàng',
      sub: 'Đến địa chỉ khách hàng',
      btnLabel: 'Xác nhận đã giao hàng',
      btnColor: COLORS.driver,
      progress: 2,
    },
    completed: {
      label: 'Giao hàng thành công!',
      sub: 'Cảm ơn bạn đã phục vụ',
      btnLabel: '',
      btnColor: COLORS.driver,
      progress: 3,
    },
  };

  const cfg = STEP_CONFIG[step];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <MaterialIcons name="map" size={48} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.mapText}>Bản đồ chỉ đường</Text>
        <Text style={styles.mapSub}>{MOCK_ORDER.distance} · {MOCK_ORDER.estimatedTime}</Text>

        {/* Step progress */}
        <View style={styles.stepRow}>
          {[1, 2, 3].map(s => (
            <View key={s} style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                { backgroundColor: cfg.progress >= s ? COLORS.driver : COLORS.border }
              ]}>
                <Text style={styles.stepDotText}>{s}</Text>
              </View>
              {s < 3 && (
                <View style={[
                  styles.stepLine,
                  { backgroundColor: cfg.progress > s ? COLORS.driver : COLORS.border }
                ]} />
              )}
            </View>
          ))}
        </View>
        <View style={styles.stepLabelRow}>
          <Text style={[styles.stepLabel, cfg.progress >= 1 && { color: COLORS.driver }]}>Lấy hàng</Text>
          <Text style={[styles.stepLabel, cfg.progress >= 2 && { color: COLORS.driver }]}>Giao hàng</Text>
          <Text style={[styles.stepLabel, cfg.progress >= 3 && { color: COLORS.driver }]}>Hoàn tất</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <ScrollView style={styles.sheet} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: step === 'completed' ? COLORS.driver : COLORS.primary }]} />
          <View>
            <Text style={styles.statusLabel}>{cfg.label}</Text>
            <Text style={styles.statusSub}>{cfg.sub}</Text>
          </View>
          <View style={styles.earningBadge}>
            <Text style={styles.earningBadgeText}>{MOCK_ORDER.earning}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Store info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoDot, { backgroundColor: COLORS.primary }]} />
            <Text style={styles.infoTitle}>Nhà hàng</Text>
          </View>
          <Text style={styles.infoName}>{MOCK_ORDER.store.name}</Text>
          <Text style={styles.infoAddr}>{MOCK_ORDER.store.address}</Text>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => Linking.openURL(`tel:${MOCK_ORDER.store.phone}`)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="phone" size={14} color={COLORS.driver} />
              <Text style={styles.callBtnText}>Gọi nhà hàng</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Customer info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoDot, { backgroundColor: COLORS.error }]} />
            <Text style={styles.infoTitle}>Khách hàng</Text>
          </View>
          <Text style={styles.infoAddr}>{MOCK_ORDER.customer.address}</Text>
          {MOCK_ORDER.customer.note ? (
            <View style={styles.noteBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <MaterialIcons name="note" size={14} color="#92400E" />
                <Text style={styles.noteLabel}>Ghi chú:</Text>
              </View>
              <Text style={styles.noteText}>{MOCK_ORDER.customer.note}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: COLORS.primaryLight }]}
            onPress={() => Alert.alert('Gọi qua App', 'Kết nối cuộc gọi ẩn danh...')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="phone" size={14} color={COLORS.primaryDark} />
              <Text style={[styles.callBtnText, { color: COLORS.primaryDark }]}>Gọi khách hàng</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Đơn hàng ({MOCK_ORDER.items.length} món)</Text>
          {MOCK_ORDER.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.qty}x {item.name}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />

        {/* Report issue */}
        {step !== 'completed' && (
          <TouchableOpacity style={styles.reportBtn} onPress={handleReport}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="report-problem" size={16} color={COLORS.error} />
              <Text style={styles.reportBtnText}>Báo cáo sự cố</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Main CTA */}
        {step === 'completed' ? (
          <View style={styles.completedCard}>
            <MaterialIcons name="check-circle" size={48} color={COLORS.driver} style={{ marginBottom: SPACING.sm }} />
            <Text style={styles.completedTitle}>Giao hàng thành công!</Text>
            <Text style={styles.completedSub}>Bạn đã kiếm được {MOCK_ORDER.earning}</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: cfg.btnColor }]}
            onPress={handleNextStep}
            activeOpacity={0.85}
          >
            <Text style={styles.mainBtnText}>{cfg.btnLabel}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  mapPlaceholder: {
    height: 240,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapText: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text },
  mapSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.md },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  stepLine: { width: 40, height: 3, marginHorizontal: 4 },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 6,
  },
  stepLabel: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', flex: 1 },
  sheet: { flex: 1, backgroundColor: COLORS.card },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  statusSub: { fontSize: 12, color: COLORS.textSecondary },
  earningBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.driverLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  earningBadgeText: {
    color: COLORS.driver,
    fontWeight: '700',
    fontSize: SIZES.body - 1,
  },
  divider: { height: 8, backgroundColor: COLORS.background },
  infoCard: { padding: SPACING.md },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  infoDot: { width: 8, height: 8, borderRadius: 4 },
  infoTitle: { fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  infoName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  infoAddr: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  callBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.driverLight,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  callBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.driver },
  noteBox: {
    marginTop: SPACING.sm,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  noteLabel: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  noteText: { fontSize: 13, color: '#78350F', lineHeight: 18 },
  itemsSection: { padding: SPACING.md },
  itemsTitle: { fontSize: SIZES.body - 1, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  reportBtn: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  reportBtnText: { fontSize: SIZES.body - 1, fontWeight: '600', color: COLORS.error },
  mainBtn: {
    marginHorizontal: SPACING.md,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  mainBtnText: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '700' },
  completedCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.driverLight,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  completedTitle: { fontSize: SIZES.h3, fontWeight: '700', color: COLORS.driver, marginBottom: 4 },
  completedSub: { fontSize: 14, color: COLORS.driverDark },
});
