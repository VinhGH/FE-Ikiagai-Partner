import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'driver' | 'merchant' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getStyles = () => {
    switch (variant) {
      case 'driver':
        return {
          button: { backgroundColor: COLORS.driver },
          text: { color: COLORS.white },
        };
      case 'merchant':
        return {
          button: { backgroundColor: COLORS.merchant },
          text: { color: COLORS.white },
        };
      case 'secondary':
        return {
          button: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
          text: { color: COLORS.text },
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary },
          text: { color: COLORS.primary },
        };
      case 'danger':
        return {
          button: { backgroundColor: COLORS.error },
          text: { color: COLORS.white },
        };
      case 'primary':
      default:
        return {
          button: { backgroundColor: COLORS.primary },
          text: { color: COLORS.white },
        };
    }
  };

  const currentStyles = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        currentStyles.button,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[styles.text, currentStyles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
});
