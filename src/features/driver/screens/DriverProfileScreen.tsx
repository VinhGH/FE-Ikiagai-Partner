import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/useAuthStore';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  danger?: boolean;
  badge?: string;
}

function MenuItem({ icon, label, sublabel, onPress, danger, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && { backgroundColor: '#FEE2E2' }]}>
        <MaterialIcons name={icon as any} size={20} color={danger ? COLORS.error : COLORS.textSecondary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {!danger && <Text style={styles.menuArrow}>›</Text>}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function DriverProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất không?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const stats = [
    { label: 'Tổng đơn', value: '1.204' },
    { label: 'Tổng km', value: '3.847' },
    { label: 'Đánh giá', value: '4.8 ★' },
    { label: 'Tháng tham gia', value: '8 tháng' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || 'T').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{user?.name || 'Nguyễn Văn Tài xế'}</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Text key={s} style={{ fontSize: 16, color: '#F59E0B' }}>★</Text>
            ))}
            <Text style={styles.ratingText}>4.8 · 1.204 đơn</Text>
          </View>
          <View style={styles.driverBadge}>
            <Text style={styles.driverBadgeText}>🛵 Đối tác Tài xế Ikigai</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          <SectionHeader title="Tài khoản" />
          <MenuItem icon="person" label="Thông tin cá nhân" sublabel="Tên, SĐT, CMND/CCCD" />
          <MenuItem icon="motorcycle" label="Phương tiện" sublabel="Xe máy Honda Wave Alpha · 59P1-12345" />
          <MenuItem icon="account-balance" label="Tài khoản ngân hàng" sublabel="MB Bank · **** 1234" />
          <MenuItem icon="lock" label="Bảo mật & Mật khẩu" />
        </View>

        <View style={styles.menuCard}>
          <SectionHeader title="Hoạt động" />
          <MenuItem icon="star" label="Đánh giá từ khách hàng" badge="128" />
          <MenuItem icon="autorenew" label="Lịch sử bồi hoàn" />
          <MenuItem icon="bar-chart" label="Báo cáo thu nhập" />
          <MenuItem icon="card-giftcard" label="Chương trình thưởng" />
        </View>

        <View style={styles.menuCard}>
          <SectionHeader title="Hỗ trợ" />
          <MenuItem icon="chat" label="Chat với CSKH" />
          <MenuItem icon="assignment" label="Câu hỏi thường gặp" />
          <MenuItem icon="description" label="Điều khoản & Chính sách" />
          <MenuItem icon="info" label="Về ứng dụng" sublabel="Phiên bản 1.0.0" />
        </View>

        <View style={[styles.menuCard, { marginBottom: SPACING.xl }]}>
          <MenuItem
            icon="exit-to-app"
            label="Đăng xuất"
            onPress={handleLogout}
            danger
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  profileCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.driver,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  driverBadge: {
    backgroundColor: COLORS.driverLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 50,
  },
  driverBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.driver,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statValue: {
    fontSize: SIZES.h4,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  sectionHeader: {
    fontSize: 11,
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
  menuLabel: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});
