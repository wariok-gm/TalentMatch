import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ColorTokens, radius, spacing, TypeTokens, useTheme } from '../../theme';
import { ApplicationStatus } from '../../types';

const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In review' },
  { key: 'shortlisted', label: 'Shortlisted' },
];

interface Props {
  status: ApplicationStatus;
  style?: StyleProp<ViewStyle>;
}

/** Filled/pending dot progress for an application's review pipeline. */
export function StatusTimeline({ status, style }: Props) {
  const { colors, type, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, type, shadows), [colors, type, shadows]);
  const current = STAGES.findIndex((s) => s.key === status);

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={[styles.card, style]}>
      <Text style={styles.header}>Application status</Text>
      <View style={styles.row}>
        {STAGES.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          const filled = done || active;
          return (
            <React.Fragment key={stage.key}>
              {i > 0 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: i <= current ? colors.tint : colors.fillStrong },
                  ]}
                />
              )}
              <View style={styles.stage}>
                <Animated.View
                  entering={ZoomIn.delay(120 + i * 90).springify().damping(14)}
                  style={[
                    styles.dot,
                    filled
                      ? { backgroundColor: colors.tint }
                      : { backgroundColor: colors.fillStrong },
                    active && styles.dotActive,
                  ]}
                >
                  {done && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  {active && <View style={styles.dotCore} />}
                </Animated.View>
                <Text
                  style={[
                    styles.label,
                    filled && styles.labelFilled,
                    active && styles.labelActive,
                  ]}
                >
                  {stage.label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </Animated.View>
  );
}

function createStyles(colors: ColorTokens, type: TypeTokens, shadows: Record<string, ViewStyle>) {
  return StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.float,
  },
  header: {
    ...type.caption2,
    textTransform: 'uppercase',
    marginBottom: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stage: {
    alignItems: 'center',
    gap: 6,
    width: 76,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    shadowColor: colors.tint,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  dotCore: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  line: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    marginTop: 8.5,
    marginHorizontal: -spacing.l,
  },
  label: {
    ...type.caption,
    color: colors.tertiaryLabel,
  },
  labelFilled: {
    color: colors.secondaryLabel,
  },
  labelActive: {
    color: colors.tint,
    fontWeight: '700',
  },
  });
}
