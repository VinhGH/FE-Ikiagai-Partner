import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES, SHADOWS } from '../../constants/theme';

export interface IncomingOrder {
  id: string;
  store: string;
  storeAddress: string;
  deliveryAddress: string;
  distance: string;
  estimatedEarning: string;
  estimatedTime: string;
  items: number;
}

interface OrderIncomingCardProps {
  order: IncomingOrder;
  onAccept: (order: IncomingOrder) => void;
  onDecline: (order: IncomingOrder) => void;
  timeoutSeconds?: number;
}

export default function OrderIncomingCard({
  order, onAccept, onDecline, timeoutSeconds = 30,
}: OrderIncomingCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline(order);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Progress bar animation — useNativeDriver:false required for flex/width changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: timeoutSeconds * 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const urgency = timeLeft <= 10;
  const borderColor = urgency ? COLORS.error : COLORS.driver;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.card, { borderColor }]}>
        {/* Timer bar */}
        <View style={styles.timerBarBg}>
          <Animated.View
            style={[
              styles.timerBarFill,
              {
                backgroundColor: urgency ? COLORS.error : COLORS.driver,
                flex: progressAnim,
              },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.newBadge, { backgroundColor: urgency ? COLORS.error : COLORS.driver }]}>
              <Text style={styles.newBadgeText}>ĐƠN MỚI</Text>
            </View>
          </View>
          <View style={styles.timerCircle}>
            <Text style={[styles.timerText, { color: urgency ? COLORS.error : COLORS.driver }]}>
              {timeLeft}s
            </Text>
          </View>
        </View>

        {/* Earning & Info */}
        <View style={styles.earningRow}>
          <Text style={styles.earning}>{order.estimatedEarning}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              {/* distance icon */}
              <Svg_MapPin color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{order.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              {/* time icon */}
              <Svg_Clock color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{order.estimatedTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Svg_Box color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{order.items} món</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Store */}
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: COLORS.driver }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Lấy hàng tại</Text>
            <Text style={styles.locationName} numberOfLines={1}>{order.store}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>{order.storeAddress}</Text>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, { backgroundColor: COLORS.error }]} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Giao đến</Text>
            <Text style={styles.locationAddress} numberOfLines={2}>{order.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => onDecline(order)}
            activeOpacity={0.7}
          >
            <Text style={styles.declineBtnText}>Bỏ qua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, { backgroundColor: urgency ? COLORS.error : COLORS.driver }]}
            onPress={() => onAccept(order)}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptBtnText}>✓  Chấp nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// SVG Icons wrapper
function Svg_MapPin({ color }: { color: string }) {
  return <MaterialIcons name="place" size={14} color={color} style={{ marginRight: 4 }} />;
}
function Svg_Clock({ color }: { color: string }) {
  return <MaterialIcons name="schedule" size={14} color={color} style={{ marginRight: 4 }} />;
}
function Svg_Box({ color }: { color: string }) {
  return <MaterialIcons name="local-mall" size={14} color={color} style={{ marginRight: 4 }} />;
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    ...SHADOWS.heavy,
  },
  timerBarBg: {
    height: 4,
    backgroundColor: COLORS.border,
    flexDirection: 'row',
  },
  timerBarFill: {
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  newBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  earningRow: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  earning: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.driver,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationName: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  declineBtnText: {
    fontSize: SIZES.body - 1,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  acceptBtn: {
    flex: 2,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  acceptBtnText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});
