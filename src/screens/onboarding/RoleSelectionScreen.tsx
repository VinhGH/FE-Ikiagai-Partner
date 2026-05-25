import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setRole } from '../../redux/actions/authActions';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../constants/theme';
import Button from '../../components/shared/Button';

export default function RoleSelectionScreen() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<'driver' | 'merchant' | null>(null);

  const handleConfirm = () => {
    if (selected) {
      dispatch(setRole(selected));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>ikigai <Text style={{ color: COLORS.primary }}>partner</Text></Text>
          <Text style={styles.subtitle}>Chào mừng bạn đến với hệ sinh thái đối tác. Vui lòng chọn vai trò để bắt đầu:</Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Card cho Tài xế */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelected('driver')}
            style={[
              styles.card,
              selected === 'driver' && { borderColor: COLORS.driver, borderWidth: 2, ...SHADOWS.medium },
            ]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: COLORS.driverLight }]}>
              <Text style={{ fontSize: 32 }}>🛵</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, selected === 'driver' && { color: COLORS.driver }]}>Đối tác Tài xế</Text>
              <Text style={styles.cardDesc}>Giao đồ ăn, chủ động thời gian, gia tăng thu nhập hàng ngày nhanh chóng.</Text>
            </View>
          </TouchableOpacity>

          {/* Card cho Nhà hàng */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelected('merchant')}
            style={[
              styles.card,
              selected === 'merchant' && { borderColor: COLORS.merchant, borderWidth: 2, ...SHADOWS.medium },
            ]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: COLORS.merchantLight }]}>
              <Text style={{ fontSize: 32 }}>🍳</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, selected === 'merchant' && { color: COLORS.merchant }]}>Đối tác Nhà hàng</Text>
              <Text style={styles.cardDesc}>Bán món ngon, tiếp cận hàng triệu khách hàng, quản lý đơn dễ dàng.</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Button
            title="Tiếp tục"
            disabled={!selected}
            variant={selected === 'driver' ? 'driver' : selected === 'merchant' ? 'merchant' : 'primary'}
            onPress={handleConfirm}
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
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  brand: {
    fontSize: SIZES.h1 + 6,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  cardsContainer: {
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: SIZES.caption + 1,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginBottom: SPACING.md,
  },
});
