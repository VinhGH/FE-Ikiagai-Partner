import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  style,
  inputStyle,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, inputStyle]}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputContainer: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  focusedInput: {
    borderColor: COLORS.primary,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    width: '100%',
    height: '100%',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: '500',
  },
});
