import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  rating: number;
  comment: string;
  time: string;
}

const INITIAL_FEEDBACKS: Feedback[] = [
  { id: 'f1', orderId: 'IKG-9755', customerName: 'Lê Hoàng E',  rating: 5, comment: 'Cơm gà ăn ngon lắm, đóng gói cẩn thận. Sẽ ủng hộ tiếp!', time: '13:40' },
  { id: 'f2', orderId: 'IKG-8822', customerName: 'Trần Thị B',  rating: 4, comment: 'Combo sushi ổn, nhưng giao hơi lâu một chút. Món ăn vẫn ngon!', time: '10:55' },
  { id: 'f3', orderId: 'IKG-7710', customerName: 'Lê Hồng Ánh', rating: 5, comment: 'Tuyệt vời, quán phục vụ nhiệt tình và đồ ăn rất tươi.', time: '09:32' },
  { id: 'f4', orderId: 'IKG-1152', customerName: 'Nguyễn Văn C', rating: 3, comment: 'Cơm lươn ổn nhưng phần ăn hơi nhỏ so với giá tiền.', time: '08:20' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialIcons
          key={s}
          name={s <= rating ? 'star' : 'star-outline'}
          size={14}
          color={s <= rating ? '#F59E0B' : COLORS.border}
        />
      ))}
    </View>
  );
}

export default function MerchantFeedbacksScreen() {
  const [feedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4' | '3_less'>('all');
  
  // Reply management states
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Feedback | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({
    f1: 'Dạ quán cảm ơn bạn rất nhiều! Hy vọng sẽ được phục vụ bạn lần sau ạ! ❤️',
  });

  // Calculate stats
  const totalCount = feedbacks.length;
  const avgRating = (feedbacks.reduce((s, f) => s + f.rating, 0) / totalCount).toFixed(1);
  const counts = {
    all: totalCount,
    five: feedbacks.filter((f) => f.rating === 5).length,
    four: feedbacks.filter((f) => f.rating === 4).length,
    threeLess: feedbacks.filter((f) => f.rating <= 3).length,
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (starFilter === '5') return fb.rating === 5;
    if (starFilter === '4') return fb.rating === 4;
    if (starFilter === '3_less') return fb.rating <= 3;
    return true;
  });

  const handleReplySubmit = () => {
    if (!replyingTo || !replyText.trim()) return;
    setReplies(prev => ({
      ...prev,
      [replyingTo.id]: replyText.trim(),
    }));
    const customer = replyingTo.customerName;
    setReplyingTo(null);
    setReplyText('');
    Alert.alert('Đăng thành công', `Đã trả lời đánh giá của khách hàng ${customer}.`);
  };

  const handleReplyDelete = (id: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa phản hồi này?', [
      { text: 'Hủy bỏ', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const updated = { ...replies };
          delete updated[id];
          setReplies(updated);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Đánh giá của khách</Text>
          <Text style={styles.headerSub}>Xem phản hồi và gửi trả lời cho thực khách</Text>
        </View>
      </View>

      {/* ── Stats Summary Panel ── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.ratingBig}>{avgRating}</Text>
          <StarRating rating={Math.round(parseFloat(avgRating))} />
          <Text style={styles.ratingCount}>Tất cả {totalCount} đánh giá</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRight}>
          {/* Star progress bars */}
          {[
            { label: '5 ★', count: counts.five, pct: totalCount > 0 ? (counts.five / totalCount) * 100 : 0 },
            { label: '4 ★', count: counts.four, pct: totalCount > 0 ? (counts.four / totalCount) * 100 : 0 },
            { label: '3 ★ hoặc ít hơn', count: counts.threeLess, pct: totalCount > 0 ? (counts.threeLess / totalCount) * 100 : 0 },
          ].map((item, idx) => (
            <View key={idx} style={styles.progressRow}>
              <Text style={styles.progressLabel}>{item.label}</Text>
              <View style={styles.progressBarWrapper}>
                <View style={[styles.progressBarFill, { width: `${item.pct}%` as any }]} />
              </View>
              <Text style={styles.progressCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Filter Tab Selector ── */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: `Tất cả (${counts.all})` },
          { key: '5', label: `5 ★ (${counts.five})` },
          { key: '4', label: `4 ★ (${counts.four})` },
          { key: '3_less', label: `≤ 3 ★ (${counts.threeLess})` },
        ].map((btn) => (
          <TouchableOpacity
            key={btn.key}
            style={[styles.filterBtn, starFilter === btn.key && styles.filterBtnActive]}
            onPress={() => setStarFilter(btn.key as any)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, starFilter === btn.key && styles.filterBtnTextActive]}>
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Feedbacks list ── */}
      <FlatList
        data={filteredFeedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="star-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Chưa có đánh giá nào phù hợp bộ lọc</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={[
                styles.feedbackAvatar,
                { backgroundColor: item.rating >= 4 ? COLORS.primaryLight : '#FEF3C7' },
              ]}>
                <Text style={[
                  styles.feedbackAvatarText,
                  { color: item.rating >= 4 ? COLORS.primaryDark : '#D97706' },
                ]}>
                  {item.customerName.charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.feedbackName}>{item.customerName}</Text>
                  <Text style={styles.feedbackTime}>{item.time}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <StarRating rating={item.rating} />
                  <View style={styles.orderTag}>
                    <MaterialIcons name="receipt" size={10} color={COLORS.textLight} />
                    <Text style={styles.orderTagText}>#{item.orderId}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.feedbackComment}>"{item.comment}"</Text>

            {/* Replies rendering */}
            {replies[item.id] ? (
              <View style={styles.replyBox}>
                <View style={styles.replyHeader}>
                  <MaterialIcons name="storefront" size={14} color={COLORS.merchantDark} style={{ marginRight: 4 }} />
                  <Text style={styles.replyTitle}>Phản hồi từ quán</Text>
                </View>
                <Text style={styles.replyText}>{replies[item.id]}</Text>
                <View style={styles.replyActions}>
                  <TouchableOpacity onPress={() => {
                    setReplyingTo(item);
                    setReplyText(replies[item.id]);
                  }} style={{ paddingVertical: 4 }}>
                    <Text style={styles.replyActionText}>Sửa</Text>
                  </TouchableOpacity>
                  <View style={styles.replyActionDivider} />
                  <TouchableOpacity onPress={() => handleReplyDelete(item.id)} style={{ paddingVertical: 4 }}>
                    <Text style={[styles.replyActionText, { color: COLORS.error }]}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.replyTriggerBtn}
                onPress={() => {
                  setReplyingTo(item);
                  setReplyText('');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="reply" size={14} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                <Text style={styles.replyTriggerBtnText}>Viết phản hồi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* ── Feedback Reply Dialog Modal ── */}
      <Modal
        visible={replyingTo !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyingTo(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Phản hồi khách hàng</Text>
            <Text style={styles.modalSubtitle}>Gửi câu trả lời cho đánh giá của {replyingTo?.customerName}</Text>
            
            <View style={styles.modalContext}>
              <Text style={styles.modalContextName}>{replyingTo?.customerName}:</Text>
              <Text style={styles.modalContextText}>"{replyingTo?.comment}"</Text>
            </View>

            <TextInput
              style={styles.replyTextInput}
              placeholder="Nhập câu phản hồi lịch sự, thân thiện của quán..."
              placeholderTextColor={COLORS.textLight}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: SPACING.md }}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setReplyingTo(null)}
              >
                <Text style={styles.modalBtnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSubmit]}
                onPress={handleReplySubmit}
                disabled={!replyText.trim()}
              >
                <Text style={styles.modalBtnSubmitText}>Đăng câu trả lời</Text>
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

  // Stats Card
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 18,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  summaryLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  ratingBig: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 40,
  },
  ratingCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  summaryRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 70,
  },
  progressBarWrapper: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  progressCount: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
    width: 16,
    textAlign: 'right',
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.md,
    gap: 6,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryDark,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterBtnTextActive: {
    color: COLORS.primaryDark,
  },

  // List & Cards
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  feedbackCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
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
  
  // Reply box
  replyBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.merchantDark,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.merchantDark,
  },
  replyText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  replyActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  replyActionDivider: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
  },
  replyTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  replyTriggerBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },

  // Empty State
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: 40,
    ...SHADOWS.heavy,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.md,
  },
  modalTitle: { fontSize: SIZES.h3 - 1, fontWeight: '800', color: COLORS.text },
  modalSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  modalContext: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalContextName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalContextText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  replyTextInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    fontSize: 13,
    color: COLORS.text,
    textAlignVertical: 'top',
    height: 80,
  },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalBtnSubmit: {
    flex: 2,
    backgroundColor: COLORS.primaryDark,
  },
  modalBtnSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
