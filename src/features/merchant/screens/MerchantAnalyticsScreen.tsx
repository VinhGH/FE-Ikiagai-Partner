import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../../constants/theme';

type AnalyticsPeriod = 'today' | 'week' | 'month';

const MOCK_REVENUE_TRENDS: Record<AnalyticsPeriod, { day: string; value: number }[]> = {
  today: [
    { day: '08h-10h', value: 150000 },
    { day: '10h-12h', value: 450000 },
    { day: '12h-14h', value: 680000 },
    { day: '14h-16h', value: 120000 },
    { day: '16h-18h', value: 380000 },
    { day: '18h-20h', value: 720000 },
    { day: '20h-22h', value: 290000 },
  ],
  week: [
    { day: 'T2', value: 1200000 },
    { day: 'T3', value: 1850000 },
    { day: 'T4', value: 1450000 },
    { day: 'T5', value: 2100000 },
    { day: 'T6', value: 2800000 },
    { day: 'T7', value: 3600000 },
    { day: 'CN', value: 3100000 },
  ],
  month: [
    { day: 'Tuần 1', value: 12400000 },
    { day: 'Tuần 2', value: 14800000 },
    { day: 'Tuần 3', value: 16200000 },
    { day: 'Tuần 4', value: 18900000 },
  ],
};

const MOCK_TOP_ITEMS = [
  { name: 'Combo Sushi Gia Đình (24 miếng)', qty: 42, revenue: '10.290.000đ', rank: 1, icon: '🍣' },
  { name: 'Cơm gà sốt Teriyaki', qty: 38, revenue: '2.850.000đ', rank: 2, icon: '🍗' },
  { name: 'Trà sữa trân châu truyền thống', qty: 35, revenue: '1.400.000đ', rank: 3, icon: '🧋' },
  { name: 'Nước cam vắt nguyên chất', qty: 29, revenue: '1.015.000đ', rank: 4, icon: '🍊' },
];

export default function MerchantAnalyticsScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const chartData = MOCK_REVENUE_TRENDS[period];
  
  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalOrders = period === 'today' ? 12 : period === 'week' ? 84 : 342;
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  const maxChartValue = Math.max(...chartData.map((d) => d.value)) || 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodTabs}>
          <TouchableOpacity
            style={[styles.periodTab, period === 'today' && styles.periodTabActive]}
            onPress={() => setPeriod('today')}
          >
            <Text style={[styles.periodText, period === 'today' && styles.periodTextActive]}>Hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'week' && styles.periodTabActive]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>Tuần này</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodTab, period === 'month' && styles.periodTabActive]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Tháng này</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Cards Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
              <MaterialIcons name="monetization-on" size={24} color={COLORS.driverDark} />
            </View>
            <Text style={styles.kpiLabel}>Doanh thu</Text>
            <Text style={styles.kpiValue}>{totalRevenue.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.kpiSub}>đã khấu trừ chiết khấu</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <MaterialIcons name="assignment-turned-in" size={24} color="#0284C7" />
            </View>
            <Text style={styles.kpiLabel}>Đơn hàng</Text>
            <Text style={styles.kpiValue}>{totalOrders} đơn</Text>
            <Text style={styles.kpiSub}>hoàn thành thành công</Text>
          </View>
        </View>

        <View style={styles.kpiCardFull}>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <MaterialIcons name="shopping-bag" size={24} color="#16A34A" />
          </View>
          <View style={styles.kpiFullContent}>
            <Text style={styles.kpiLabel}>Giá trị đơn trung bình</Text>
            <Text style={styles.kpiValue}>{avgOrderValue.toLocaleString('vi-VN')}đ/đơn</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Biểu đồ doanh thu</Text>
          
          <View style={styles.chartContainer}>
            {chartData.map((d, i) => {
              const barHeightPercent = (d.value / maxChartValue) * 80; // Scale to fit max 80% height of chart container
              return (
                <View key={i} style={styles.chartBarWrapper}>
                  <View style={styles.barValueWrapper}>
                    <Text style={styles.barValueText}>
                      {d.value >= 1000000
                        ? `${(d.value / 1000000).toFixed(1)}M`
                        : d.value >= 1000
                        ? `${(d.value / 1000).toFixed(0)}k`
                        : `${d.value}`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: `${barHeightPercent}%` as any,
                        backgroundColor: COLORS.driver,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Popular Dishes list */}
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>Món ăn bán chạy nhất</Text>
          
          {MOCK_TOP_ITEMS.map((item) => (
            <View key={item.rank} style={styles.itemRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{item.rank}</Text>
              </View>
              <Text style={styles.itemEmoji}>{item.icon}</Text>
              <View style={styles.itemMeta}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSales}>Đã bán {item.qty} phần · {item.revenue}</Text>
              </View>
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
  scrollContent: { padding: SPACING.md },
  
  // Periods
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodTabActive: { backgroundColor: COLORS.driver },
  periodText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  periodTextActive: { color: COLORS.white, fontWeight: '700' },
  
  // KPI Grid
  kpiGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  kpiLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  kpiValue: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  kpiSub: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
  
  kpiCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
    gap: SPACING.md,
  },
  kpiFullContent: { flex: 1 },
  
  // Chart
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 10,
  },
  chartBarWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValueWrapper: {
    position: 'absolute',
    top: -16,
    alignItems: 'center',
  },
  barValueText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '600' },
  chartBar: {
    width: 18,
    borderRadius: 50,
    minHeight: 4,
  },
  barLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 8, fontWeight: '600' },
  
  // Top Items
  listCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  listTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  rankText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  itemEmoji: { fontSize: 24, marginRight: SPACING.sm },
  itemMeta: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  itemSales: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
