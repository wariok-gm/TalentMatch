import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  style?: StyleProp<ViewStyle>;
  /** How far to shrink on press. */
  scaleTo?: number;
  /** Play a light haptic on press-in. Defaults to true. */
  hapticOnPress?: boolean;
  children?: React.ReactNode;
}

/**
 * The app-wide touchable: springy scale-down with a light haptic tick.
 * Use this instead of TouchableOpacity everywhere.
 */
export function PressableScale({
  style,
  scaleTo = 0.96,
  hapticOnPress = true,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, { damping: 26, stiffness: 380 });
        if (hapticOnPress) haptic.light();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 22, stiffness: 300 });
        onPressOut?.(event);
      }}
    />
  );
}
