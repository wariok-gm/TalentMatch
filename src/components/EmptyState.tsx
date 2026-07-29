import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorTokens, radius, spacing, TypeTokens, useTheme } from '../theme';
import { PressableScale } from './PressableScale';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  const { colors, type } = useTheme();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={30} color={colors.tint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <PressableScale style={styles.action} onPress={onAction}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </PressableScale>
      )}
    </View>
  );
}

function createStyles(colors: ColorTokens, type: TypeTokens) {
  return StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...type.title3,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    ...type.subhead,
    textAlign: 'center',
    lineHeight: 21,
  },
  action: {
    marginTop: spacing.xl,
    backgroundColor: colors.label,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.pill,
  },
  actionLabel: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '600',
  },
  });
}
