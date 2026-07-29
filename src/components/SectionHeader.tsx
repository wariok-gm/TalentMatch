import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorTokens, spacing, useTheme } from '../theme';
import { PressableScale } from './PressableScale';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  const { colors, type } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Text style={type.title2}>{title}</Text>
      {actionLabel && onAction && (
        <PressableScale hapticOnPress={false} onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.m,
    },
    action: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.tint,
    },
  });
}
