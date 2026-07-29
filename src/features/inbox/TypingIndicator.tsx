import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ColorTokens, radius, spacing, useTheme } from '../../theme';

function Dot({ delay }: { delay: number }) {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 320 }),
          withTiming(0.25, { duration: 320 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

/** "The other side is typing" bubble — three staggered pulsing dots. */
export function TypingIndicator() {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  return (
    <Animated.View entering={FadeInUp.springify().damping(18)} style={styles.row}>
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={160} />
        <Dot delay={320} />
      </View>
    </Animated.View>
  );
}

function createStyles(colors: ColorTokens, shadows: Record<string, ViewStyle>) {
  return StyleSheet.create({
  row: {
    alignSelf: 'flex-start',
    marginVertical: 3,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.l,
    paddingVertical: 14,
    borderRadius: radius.l,
    borderBottomLeftRadius: 6,
    borderCurve: 'continuous',
    ...shadows.soft,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryLabel,
  },
  });
}
