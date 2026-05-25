import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES } from '../../constants/theme';

interface EarningsDataPoint {
  label: string; // 'T2', 'T3', ...
  value: number; // earnings in VND
}

interface EarningsChartProps {
  data: EarningsDataPoint[];
  maxValue?: number;
}

export default function EarningsChart({ data, maxValue }: EarningsChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const chartHeight = 100;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item, i) => {
          const barHeight = max > 0 ? (item.value / max) * chartHeight : 4;
          const isToday = i === data.length - 1;
          return (
            <View key={i} style={styles.barGroup}>
              <View style={styles.barWrapper}>
                {item.value > 0 && (
                  <Text style={styles.barValue}>
                    {item.value >= 1000 ? `${Math.round(item.value / 1000)}k` : item.value}
                  </Text>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(barHeight, 4),
                      backgroundColor: isToday ? COLORS.driver : COLORS.primary,
                      opacity: item.value === 0 ? 0.2 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.label, isToday && { color: COLORS.driver, fontWeight: '700' }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    paddingHorizontal: SPACING.xs,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 110,
  },
  bar: {
    width: 28,
    borderRadius: 6,
    marginTop: 4,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
});
