import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme';
import { PressableScale } from './PressableScale';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: Props) {
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

const styles = StyleSheet.create({
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
