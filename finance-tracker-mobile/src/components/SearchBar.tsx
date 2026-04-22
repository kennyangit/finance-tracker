import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { debounce } from '../utils/helpers';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalResults?: number;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar transações...', totalResults = 0 }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedChange = debounce((v: string) => onChange(v), 300);

  useEffect(() => { setInputValue(value); }, [value]);

  const handleChange = (v: string) => { setInputValue(v); debouncedChange(v); };
  const handleClear = () => { setInputValue(''); onChange(''); };

  return (
    <View style={styles.container}>
      <Feather name="search" size={18} color={colors.textTertiary} />
      <TextInput style={styles.input} value={inputValue} onChangeText={handleChange} placeholder={placeholder} placeholderTextColor={colors.textMuted} returnKeyType="search" autoCorrect={false} />
      {totalResults > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{totalResults}</Text></View>}
      {inputValue !== '' && <TouchableOpacity onPress={handleClear} style={styles.clearBtn}><Feather name="x" size={14} color={colors.textSecondary} /></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.bgCardSolid, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md },
  input: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary, padding: 0 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: colors.bgSubtle, borderRadius: borderRadius.sm },
  badgeText: { fontSize: fontSize.xs, color: colors.textTertiary },
  clearBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bgSubtle, alignItems: 'center', justifyContent: 'center' },
});
