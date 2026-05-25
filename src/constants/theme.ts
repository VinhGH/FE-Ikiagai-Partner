import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SIZES = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 12,
};

export const SHADOWS = StyleSheet.create({
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heavy: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});

export const COMMON_STYLES = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.light,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
