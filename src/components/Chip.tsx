import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { ColorTokens, radius, spacing, useTheme } from '../theme';
import { haptic } from '../utils/haptics';
import { PressableScale } from './PressableScale';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Filter/category pill. Selected state fills with tint. */
export function Chip({ label, selected = false, onPress, style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <PressableScale
      scaleTo={0.94}
      hapticOnPress={false}
      onPress={() => {
        haptic.selection();
        onPress?.();
      }}
      style={[styles.chip, selected && styles.chipSelected, style]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </PressableScale>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: spacing.l,
      paddingVertical: spacing.s + 1,
      borderRadius: radius.pill,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
    },
    chipSelected: {
      backgroundColor: colors.label,
      borderColor: colors.label,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.label,
    },
    labelSelected: {
      color: colors.bg,
    },
  });
}
