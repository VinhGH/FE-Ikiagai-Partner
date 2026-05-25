import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, SIZES } from '../../constants/theme';

interface StepIndicatorProps {
  currentStep: number; // 1-based index
  steps: string[];
  role: 'driver' | 'merchant';
}

export default function StepIndicator({ currentStep, steps, role }: StepIndicatorProps) {
  const activeColor = role === 'driver' ? COLORS.driver : COLORS.merchant;
  const activeLightColor = role === 'driver' ? COLORS.driverLight : COLORS.merchantLight;

  return (
    <View style={styles.container}>
      <View style={styles.indicatorRow}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={step}>
              {/* Line connector */}
              {index > 0 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        stepNumber <= currentStep ? activeColor : COLORS.border,
                    },
                  ]}
                />
              )}

              {/* Step Circle */}
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: isActive || isCompleted ? activeColor : COLORS.border,
                    backgroundColor: isCompleted
                      ? activeColor
                      : isActive
                      ? activeLightColor
                      : COLORS.white,
                  },
                ]}
              >
                {isCompleted ? (
                  <Text style={[styles.circleText, { color: COLORS.white }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      { color: isActive ? activeColor : COLORS.textSecondary },
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Step Labels */}
      <View style={styles.labelRow}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <Text
              key={step}
              style={[
                styles.label,
                {
                  color: isActive
                    ? COLORS.text
                    : isCompleted
                    ? COLORS.textSecondary
                    : COLORS.textLight,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingHorizontal: SPACING.md,
  },
  line: {
    flex: 1,
    height: 3,
    marginHorizontal: -8,
    zIndex: -1,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  circleText: {
    fontSize: SIZES.body - 2,
    fontWeight: 'bold',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: SIZES.caption,
    textAlign: 'center',
    width: 70,
  },
});
