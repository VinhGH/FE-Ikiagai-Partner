import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import ReimbursementCard, { Reimbursement, ReimbursementType } from '../../../components/driver/ReimbursementCard';
import { router } from 'expo-router';

const MOCK_REIMBURSEMENTS: Reimbursement[] = [
  {
    id: 'r1',
    type: 'parking_fee',
    status: 'paid',
    amount: 15000,
    description: 'Phí gửi xe tại chung cư Vinhomes Central Park',
    submittedAt: '20/05/2025',
    orderId: 'IKG-9801',
  },
  {
    id: 'r2',
    type: 'undeliverable',
    status: 'reviewing',
    amount: 45000,
    description: 'Khách không nhận hàng, không liên hệ được. Đã chờ 20 phút tại địa chỉ.',
    submittedAt: '24/05/2025',
    orderId: 'IKG-9820',
  },
  {
    id: 'r3',
    type: 'system_error',
    status: 'approved',
    amount: 38000,
    description: 'App bị lỗi ghi nhận trạng thái giao hàng, đơn bị đánh dấu thất bại nhưng thực tế đã giao thành công.',
    submittedAt: '23/05/2025',
    orderId: 'IKG-9810',
  },
  {
    id: 'r4',
    type: 'toll_fee',
    status: 'rejected',
    amount: 20000,
    description: 'Phí cầu đường Phú Mỹ khi giao hàng đường dài.',
    submittedAt: '21/05/2025',
  },
];

const REIMBURSEMENT_TYPES: { key: ReimbursementType; label: string; desc: string; iconName: string }[] = [
  { key: 'parking_fee', label: 'Phí gửi xe / cầu đường', desc: 'Phí bãi đỗ, phí cầu đường khi giao hàng', iconName: 'local-parking' },
  { key: 'toll_fee', label: 'Phí cầu đường', desc: 'Phí qua cầu, hầm trong quá trình giao', iconName: 'toll' },
  { key: 'undeliverable', label: 'Không thể giao hàng', desc: 'Khách không nhận, địa chỉ sai hoàn toàn', iconName: 'block' },
  { key: 'system_error', label: 'Lỗi hệ thống', desc: 'App lỗi ảnh hưởng đến đơn hàng/thu nhập', iconName: 'settings' },
  { key: 'accident', label: 'Sự cố / Tai nạn', desc: 'Tai nạn, sự cố bất khả kháng khi giao hàng', iconName: 'warning' },
  { key: 'other', label: 'Lý do khác', desc: 'Các vấn đề khác chưa được phân loại', iconName: 'notes' },
];

type View2 = 'list' | 'create';

export default function DriverReimbursementScreen() {
  const [view, setView] = useState<View2>('list');
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ReimbursementType | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedOrderId('');
    setDescription('');
    setAmount('');
  };

  const handleSubmit = () => {
    if (!selectedType || !description || !amount) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin yêu cầu bồi hoàn.');
      return;
    }
    Alert.alert(
      'Đã gửi yêu cầu',
      'Yêu cầu bồi hoàn của bạn đã được ghi nhận. Chúng tôi sẽ xem xét trong 1-3 ngày làm việc.',
      [{
        text: 'OK', onPress: () => {
          resetForm();
          setView('list');
        }
      }]
    );
  };

  if (view === 'create') {
    return (
      <SafeAreaView style={styles.safe}>
        {/* Form Header */}
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => { resetForm(); setView('list'); }}>
            <Text style={styles.backBtn}>← Huỷ</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>Yêu cầu bồi hoàn</Text>
          <Text style={styles.stepIndicator}>{step}/3</Text>
        </View>

        {/* Step progress bar */}
        <View style={styles.stepBar}>
          {[1,2,3].map(s => (
            <View key={s} style={[styles.stepBarItem, { backgroundColor: step >= s ? COLORS.primary : COLORS.border }]} />
          ))}
        </View>

        <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
          {/* Step 1: Chọn loại */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Bước 1: Chọn loại bồi hoàn</Text>
              {REIMBURSEMENT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeCard, selectedType === t.key && styles.typeCardSelected]}
                  onPress={() => setSelectedType(t.key)}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialIcons name={t.iconName as any} size={22} color={selectedType === t.key ? COLORS.primary : COLORS.textSecondary} />
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={[styles.typeLabel, selectedType === t.key && { color: COLORS.primary }]}>
                      {t.label}
                    </Text>
                    <Text style={styles.typeDesc}>{t.desc}</Text>
                  </View>
                  {selectedType === t.key && (
                    <View style={styles.typeCheck}>
                      <Text style={{ color: COLORS.primary, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.nextBtn, !selectedType && styles.nextBtnDisabled]}
                onPress={() => selectedType && setStep(2)}
                disabled={!selectedType}
              >
                <Text style={styles.nextBtnText}>Tiếp theo →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Thông tin chi tiết */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Bước 2: Thông tin chi tiết</Text>

              <Text style={styles.inputLabel}>Mã đơn hàng liên quan (nếu có)</Text>
              <TextInput
                style={styles.input}
                value={selectedOrderId}
                onChangeText={setSelectedOrderId}
                placeholder="VD: IKG-9801"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Mô tả sự cố *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả chi tiết sự cố đã xảy ra..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Số tiền yêu cầu bồi hoàn *</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0đ"
                placeholderTextColor={COLORS.textLight}
                keyboardType="numeric"
              />

              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  ⓘ Yêu cầu bồi hoàn sẽ được xem xét trong 1-3 ngày làm việc. Chỉ những yêu cầu có bằng chứng hợp lệ mới được chấp thuận.
                </Text>
              </View>

              <View style={styles.stepBtns}>
                <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(1)}>
                  <Text style={styles.prevBtnText}>← Trước</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { flex: 2 }, (!description || !amount) && styles.nextBtnDisabled]}
                  onPress={() => (description && amount) && setStep(3)}
                  disabled={!description || !amount}
                >
                  <Text style={styles.nextBtnText}>Xem lại →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3: Xác nhận */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Bước 3: Xác nhận và gửi</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Loại bồi hoàn</Text>
                  <Text style={styles.reviewValue}>
                    {REIMBURSEMENT_TYPES.find(t => t.key === selectedType)?.label}
                  </Text>
                </View>
                {selectedOrderId ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Mã đơn</Text>
                    <Text style={styles.reviewValue}>#{selectedOrderId}</Text>
                  </View>
                ) : null}
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Mô tả</Text>
                  <Text style={[styles.reviewValue, { flex: 2 }]}>{description}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Số tiền</Text>
                  <Text style={[styles.reviewValue, { color: COLORS.primary, fontWeight: '700', fontSize: SIZES.h4 }]}>
                    {parseInt(amount || '0').toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>

              <View style={styles.uploadArea}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <MaterialIcons name="attach-file" size={18} color={COLORS.text} />
                  <Text style={styles.uploadTitle}>Đính kèm bằng chứng</Text>
                </View>
                <Text style={styles.uploadSub}>Ảnh chứng từ, hóa đơn (tuỳ chọn, tối đa 3 ảnh)</Text>
                <TouchableOpacity style={styles.uploadBtn}>
                  <Text style={styles.uploadBtnText}>+ Thêm ảnh</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stepBtns}>
                <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(2)}>
                  <Text style={styles.prevBtnText}>← Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.nextBtn, { flex: 2 }]} onPress={handleSubmit}>
                  <Text style={styles.nextBtnText}>Gửi yêu cầu ✓</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // List view
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header CTA */}
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, paddingVertical: 4 }}>
            <Text style={{ fontSize: 24, color: COLORS.text, fontWeight: '700' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>Bồi hoàn tài xế</Text>
            <Text style={styles.listSub}>Yêu cầu hoàn trả chi phí phát sinh</Text>
          </View>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setView('create')}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>+ Tạo mới</Text>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            💡 Bạn có thể yêu cầu bồi hoàn cho các chi phí phát sinh khi giao hàng như phí gửi xe, phí cầu đường, hoặc các sự cố không thể giao được. Thời gian xét duyệt 1-3 ngày.
          </Text>
        </View>

        {/* List */}
        <View style={styles.listContent}>
          <Text style={styles.listSectionTitle}>Yêu cầu đã gửi ({MOCK_REIMBURSEMENTS.length})</Text>
          {MOCK_REIMBURSEMENTS.map((item) => (
            <View key={item.id} style={{ marginBottom: SPACING.sm }}>
              <ReimbursementCard
                item={item}
                onPress={(r) => Alert.alert(`Yêu cầu #${r.id}`, `Trạng thái: ${r.status}\nSố tiền: ${r.amount.toLocaleString('vi-VN')}đ`)}
              />
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  // List styles
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  listTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  listSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 50,
  },
  createBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  infoBanner: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBannerText: { fontSize: 13, color: '#1D4ED8', lineHeight: 18 },
  listContent: { paddingHorizontal: SPACING.md },
  listSectionTitle: {
    fontSize: SIZES.body - 1,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  // Form styles
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { fontSize: SIZES.body - 1, color: COLORS.primary, fontWeight: '600' },
  formTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  stepIndicator: { fontSize: 13, color: COLORS.textSecondary },
  stepBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  stepBarItem: { flex: 1, height: 4, borderRadius: 2 },
  formBody: { flex: 1, padding: SPACING.md },
  stepTitle: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  typeCardSelected: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  typeInfo: { flex: 1 },
  typeLabel: { fontSize: SIZES.body - 1, fontWeight: '600', color: COLORS.text },
  typeDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  typeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: SIZES.body - 1,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { height: 100, paddingTop: SPACING.sm },
  noteBox: {
    marginTop: SPACING.md,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  noteText: { fontSize: 12, color: '#166534', lineHeight: 17 },
  nextBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  nextBtnDisabled: { backgroundColor: COLORS.border },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.body - 1 },
  stepBtns: { flexDirection: 'row', gap: SPACING.sm },
  prevBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  prevBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reviewLabel: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  reviewValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1, textAlign: 'right' },
  uploadArea: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uploadTitle: { fontSize: SIZES.body - 1, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  uploadSub: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  uploadBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: 50,
  },
  uploadBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
});
