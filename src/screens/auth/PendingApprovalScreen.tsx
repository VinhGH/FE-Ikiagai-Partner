import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout, updateUserStatus } from '../../redux/actions/authActions';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES, SHADOWS, COMMON_STYLES } from '../../constants/theme';
import Button from '../../components/shared/Button';

export default function PendingApprovalScreen() {
  const dispatch = useDispatch();
  const { role, user } = useSelector((state: RootState) => state.auth);

  const isDriver = role === 'driver';
  const roleColor = isDriver ? COLORS.driver : COLORS.merchant;
  const roleLightColor = isDriver ? COLORS.driverLight : COLORS.merchantLight;
  const emoji = isDriver ? '🛵' : '🍳';
  const roleTitle = isDriver ? 'Đối tác Tài xế' : 'Đối tác Nhà hàng';

  const handleQuickApprove = () => {
    dispatch(updateUserStatus('approved'));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        {/* Header brand */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandText}>
            ikigai <Text style={{ color: COLORS.primary }}>partner</Text>
          </Text>
        </View>

        {/* State Illustration Card */}
        <View style={[styles.card, COMMON_STYLES.card]}>
          <View style={[styles.emojiWrapper, { backgroundColor: roleLightColor }]}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
          
          <Text style={styles.title}>Đăng ký hoàn tất!</Text>
          <Text style={[styles.roleBadge, { backgroundColor: roleLightColor, color: roleColor }]}>
            {roleTitle}
          </Text>
          
          <Text style={styles.subtitle}>
            Hồ sơ của <Text style={{ fontWeight: '600' }}>{user?.name || 'đối tác'}</Text> đang được kiểm duyệt.
          </Text>
        </View>

        {/* Progress Timeline */}
        <View style={styles.timeline}>
          <Text style={styles.timelineTitle}>Trạng thái xét duyệt hồ sơ</Text>
          
          {/* Step 1 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLineActive} />
            <View style={[styles.timelineNode, { backgroundColor: roleColor }]}>
              <Text style={styles.nodeCheck}>✓</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitleActive}>1. Đã tiếp nhận hồ sơ</Text>
              <Text style={styles.stepDesc}>Hệ thống đã ghi nhận đầy đủ thông tin đăng ký của bạn.</Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLinePending} />
            <View style={[styles.timelineNode, { borderColor: roleColor, borderWidth: 2, backgroundColor: COLORS.white }]}>
              <View style={[styles.pulseDot, { backgroundColor: roleColor }]} />
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepTitleActive, { color: roleColor }]}>2. Đang kiểm tra đối soát</Text>
              <Text style={styles.stepDesc}>Đội ngũ vận hành đang xác minh giấy tờ cá nhân và phương tiện/cửa hàng.</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.timelineItem}>
            <View style={[styles.timelineNode, styles.nodeInactive]}>
              <Text style={styles.nodeNumber}>3</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.stepTitleInactive}>3. Phê duyệt & Kích hoạt</Text>
              <Text style={styles.stepDesc}>Tài khoản được kích hoạt để bắt đầu nhận đơn và tăng thu nhập.</Text>
            </View>
          </View>
        </View>

        {/* Notice Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 <Text style={{ fontWeight: '600', color: COLORS.text }}>Lưu ý:</Text> Thời gian xét duyệt tiêu chuẩn từ 12 - 24 giờ làm việc. Vui lòng giữ điện thoại hoạt động để đội ngũ CSKH liên hệ phỏng vấn nếu cần.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {/* Simulation button (Super useful for testing) */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={handleQuickApprove}
            style={[styles.simulateBtn, { borderColor: roleColor }]}
          >
            <Text style={[styles.simulateBtnText, { color: roleColor }]}>
              ⚡ GIẢ LẬP DUYỆT TÀI KHOẢN (ADMIN APPROVE)
            </Text>
          </TouchableOpacity>

          <Button 
            title="Đăng xuất / Đổi tài khoản" 
            onPress={handleLogout} 
            variant="secondary" 
            style={styles.logoutBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  brandText: {
    fontSize: SIZES.h3,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  card: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  emojiWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emojiText: {
    fontSize: 38,
  },
  title: {
    fontSize: SIZES.h2 - 2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleBadge: {
    fontSize: SIZES.caption + 1,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: SIZES.body - 2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  timeline: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  timelineTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
    paddingBottom: SPACING.md,
  },
  timelineLineActive: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  timelineLinePending: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  timelineNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    zIndex: 2,
  },
  nodeCheck: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nodeNumber: {
    color: COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  nodeInactive: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitleActive: {
    fontSize: SIZES.body - 2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  stepTitleInactive: {
    fontSize: SIZES.body - 2,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.sm + 4,
    marginVertical: SPACING.xs,
  },
  infoText: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  simulateBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  simulateBtnText: {
    fontSize: SIZES.body - 2,
    fontWeight: 'bold',
  },
  logoutBtn: {
    height: 50,
  },
});
