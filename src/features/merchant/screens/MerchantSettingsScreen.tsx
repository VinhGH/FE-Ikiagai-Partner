import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity,
  Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';
import { useAuthStore } from '../../../store/useAuthStore';

interface SettingItemProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingItem({ icon, label, sublabel, onPress, danger }: SettingItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && { backgroundColor: '#FEE2E2' }]}>
        <MaterialIcons name={icon as any} size={20} color={danger ? COLORS.error : COLORS.textSecondary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {!danger && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function MerchantSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(true);
  const [showCloseOptions, setShowCloseOptions] = useState(false);
  const [closeUntil, setCloseUntil] = useState<number | null>(null);
  const [closeReason, setCloseReason] = useState<'15m' | '30m' | '1h' | 'today' | 'manual' | null>(null);

  const getReopenTime = (minutes: number) => {
    const time = new Date(Date.now() + minutes * 60000);
    const hh = String(time.getHours()).padStart(2, '0');
    const mm = String(time.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const getRemainingTimeText = () => {
    if (isOpen) return 'Quán của bạn đang hoạt động bình thường';
    
    switch (closeReason) {
      case '15m':
      case '30m':
      case '1h':
        if (closeUntil) {
          const diff = Math.max(0, Math.round((closeUntil - Date.now()) / 60000));
          const time = new Date(closeUntil);
          const hh = String(time.getHours()).padStart(2, '0');
          const mm = String(time.getMinutes()).padStart(2, '0');
          return `Tạm đóng đến ${hh}:${mm} (Còn ${diff} phút)`;
        }
        return 'Tạm đóng cửa hàng';
      case 'today':
        return 'Tạm đóng hết ngày hôm nay';
      case 'manual':
      default:
        return 'Đóng cửa hàng (Tắt thủ công)';
    }
  };

  const handleToggleStatus = (status: boolean) => {
    if (status) {
      setIsOpen(true);
      setCloseUntil(null);
      setCloseReason(null);
      Alert.alert('Trạng thái cửa hàng', 'Cửa hàng đã mở! Khách hàng có thể đặt món ăn ngay lập tức.');
    } else {
      setShowCloseOptions(true);
    }
  };

  const handleSelectDuration = (reason: '15m' | '30m' | '1h' | 'today' | 'manual') => {
    let until: number | null = null;
    let alertMsg = '';

    if (reason === '15m') {
      until = Date.now() + 15 * 60000;
      alertMsg = `Đã tạm đóng cửa hàng 15 phút. Sẽ tự động mở lại lúc ${getReopenTime(15)}.`;
    } else if (reason === '30m') {
      until = Date.now() + 30 * 60000;
      alertMsg = `Đã tạm đóng cửa hàng 30 phút. Sẽ tự động mở lại lúc ${getReopenTime(30)}.`;
    } else if (reason === '1h') {
      until = Date.now() + 60 * 60000;
      alertMsg = `Đã tạm đóng cửa hàng 1 tiếng. Sẽ tự động mở lại lúc ${getReopenTime(60)}.`;
    } else if (reason === 'today') {
      alertMsg = 'Đã đóng cửa hàng cả ngày hôm nay.';
    } else {
      alertMsg = 'Đã đóng cửa hàng cho đến khi bạn bật lại thủ công.';
    }

    setIsOpen(false);
    setCloseUntil(until);
    setCloseReason(reason);
    setShowCloseOptions(false);
    Alert.alert('Trạng thái cửa hàng', alertMsg);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất không?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Operational Status Switch */}
        <View style={[
          styles.statusCard, 
          { backgroundColor: isOpen ? COLORS.driver : (closeReason && closeReason !== 'manual' ? '#FFFBEB' : '#F1F5F9') }
        ]}>
          <View style={styles.statusTextWrapper}>
            <Text style={[
              styles.statusTitle, 
              { color: isOpen ? COLORS.white : (closeReason && closeReason !== 'manual' ? '#92400E' : COLORS.text) }
            ]}>
              {isOpen ? '● CỬA HÀNG ĐANG MỞ' : '○ CỬA HÀNG ĐANG ĐÓNG'}
            </Text>
            <Text style={[
              styles.statusSub, 
              { color: isOpen ? COLORS.white : (closeReason && closeReason !== 'manual' ? '#B45309' : COLORS.textSecondary) }
            ]}>
              {getRemainingTimeText()}
            </Text>
          </View>
          <Switch
            value={isOpen}
            onValueChange={handleToggleStatus}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={isOpen ? COLORS.primaryDark : COLORS.textLight}
          />
        </View>

        {/* Store Metadata Card */}
        <View style={styles.storeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || 'M').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.storeName}>{user?.name || 'Nhà hàng Ikigai Sushi'}</Text>
          <Text style={styles.storeAddress}>{user?.address || '12 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Q.1'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🍳 Đối tác Nhà hàng</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: COLORS.textSecondary }]}>08:00 - 22:00</Text>
            </View>
          </View>
        </View>

        {/* Menu Options Group 1 */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeader}>Cấu hình cửa hàng</Text>
          <SettingItem icon="store" label="Thông tin nhà hàng" sublabel="Tên quán, Địa chỉ, Số điện thoại" />
          <SettingItem icon="schedule" label="Giờ hoạt động" sublabel="Hàng ngày · 08:00 - 22:00" />
          <SettingItem icon="credit-card" label="Tài khoản thanh toán" sublabel="MB Bank · **** 8888" />
          <SettingItem icon="settings" label="Tự động nhận đơn" sublabel="Bật/Tắt tự động chấp nhận đơn mới" />
        </View>

        {/* Menu Options Group 2 */}
        <View style={styles.menuGroup}>
          <Text style={styles.groupHeader}>Hỗ trợ & Pháp lý</Text>
          <SettingItem icon="chat" label="Tổng đài CSKH 24/7" />
          <SettingItem icon="assignment" label="Câu hỏi thường gặp" />
          <SettingItem icon="description" label="Quy chế hoạt động ứng dụng" />
          <SettingItem icon="info" label="Phiên bản phần mềm" sublabel="v1.0.0 (Partner App)" />
        </View>

        {/* Logout */}
        <View style={[styles.menuGroup, { marginBottom: SPACING.xl }]}>
          <SettingItem
            icon="exit-to-app"
            label="Đăng xuất khỏi thiết bị"
            onPress={handleLogout}
            danger
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal for choosing closing duration */}
      <Modal
        visible={showCloseOptions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCloseOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Tạm đóng cửa hàng</Text>
              <Text style={styles.sheetSubtitle}>Chọn thời gian tạm đóng. Cửa hàng sẽ tự động mở lại sau khi hết thời gian.</Text>
            </View>

            <View style={styles.optionsList}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleSelectDuration('15m')}
              >
                <View style={[styles.optionIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="timer" size={22} color="#D97706" />
                </View>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionLabel}>Tạm đóng 15 phút</Text>
                  <Text style={styles.optionSublabel}>Tự động mở lại lúc {getReopenTime(15)}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleSelectDuration('30m')}
              >
                <View style={[styles.optionIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="timer" size={22} color="#D97706" />
                </View>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionLabel}>Tạm đóng 30 phút</Text>
                  <Text style={styles.optionSublabel}>Tự động mở lại lúc {getReopenTime(30)}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleSelectDuration('1h')}
              >
                <View style={[styles.optionIconWrapper, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialIcons name="timer" size={22} color="#D97706" />
                </View>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionLabel}>Tạm đóng 1 tiếng</Text>
                  <Text style={styles.optionSublabel}>Tự động mở lại lúc {getReopenTime(60)}</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleSelectDuration('today')}
              >
                <View style={[styles.optionIconWrapper, { backgroundColor: '#F3F4F6' }]}>
                  <MaterialIcons name="today" size={22} color="#4B5563" />
                </View>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionLabel}>Đóng hết hôm nay</Text>
                  <Text style={styles.optionSublabel}>Tự động mở lại vào ngày mai</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => handleSelectDuration('manual')}
              >
                <View style={[styles.optionIconWrapper, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="lock" size={22} color="#EF4444" />
                </View>
                <View style={styles.optionTextWrapper}>
                  <Text style={styles.optionLabel}>Đóng cho đến khi bật lại</Text>
                  <Text style={styles.optionSublabel}>Phải mở lại thủ công bằng nút gạt</Text>
                </View>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setShowCloseOptions(false)}
            >
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md },
  
  // Status Card
  statusCard: {
    borderRadius: 20,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusTextWrapper: { flex: 1, marginRight: SPACING.sm },
  statusTitle: { fontSize: SIZES.body, fontWeight: '800', letterSpacing: 0.3 },
  statusSub: { fontSize: 11, marginTop: 4, opacity: 0.85 },
  
  // Store Card
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.driver,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  storeName: { fontSize: SIZES.h3 - 2, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  storeAddress: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, paddingHorizontal: SPACING.md },
  badgeRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: COLORS.driverDark },
  
  // Menu Group
  menuGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  groupHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: SIZES.body - 1, fontWeight: '600', color: COLORS.text },
  menuSublabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  menuArrow: { fontSize: 18, color: COLORS.textLight },

  // Modal Overlay
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
  optionSublabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
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
});
