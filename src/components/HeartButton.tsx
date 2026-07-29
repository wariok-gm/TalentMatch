import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { haptic } from '../utils/haptics';

interface Props {
  active: boolean;
  onPress: () => void;
  size?: number;
  /** Render inside a frosted circle (for overlaying on gradients). */
  frosted?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Favorite toggle with an overshoot pop when it becomes active. */
export function HeartButton({ active, onPress, size = 22, frosted = false, style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const scale = useSharedValue(1);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (active) {
      scale.value = withSequence(
        withSpring(1.18, { damping: 11, stiffness: 380 }),
        withSpring(1, { damping: 18, stiffness: 300 }),
      );
    }
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        haptic.medium();
        onPress();
      }}
      style={[frosted && [styles.frosted, { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 }], style]}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? colors.pink : frosted ? '#FFFFFF' : colors.secondaryLabel}
        />
      </Animated.View>
    </Pressable>
  );
}

function createStyles() {
  return StyleSheet.create({
    frosted: {
      backgroundColor: 'rgba(0,0,0,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
