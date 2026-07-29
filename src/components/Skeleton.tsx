import React, { useEffect } from 'react';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { radius, useTheme } from '../theme';

interface Props {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Pulsing skeleton block. Compose these into per-screen skeleton layouts. */
export function Skeleton({ width = '100%', height = 16, borderRadius = radius.s, style }: Props) {
  const { colors } = useTheme();
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.skeleton },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Convenience row of avatar + two lines, for list skeletons. */
export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, style]}>
      <Skeleton width={52} height={52} borderRadius={26} />
      <Animated.View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="62%" height={14} />
        <Skeleton width="40%" height={11} />
      </Animated.View>
    </Animated.View>
  );
}
