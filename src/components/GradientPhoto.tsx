import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  gradient: readonly [string, string];
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  /** Optional ionicon rendered ghost-like in the middle (e.g. "videocam", "musical-notes"). */
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  children?: React.ReactNode;
}

/**
 * Stand-in for a photo: a rich gradient surface (optionally with a ghost icon).
 * Used for talent hero images, job covers, media grids — fully offline.
 */
export function GradientPhoto({ gradient, style, borderRadius = 0, icon, iconSize = 44, children }: Props) {
  return (
    <LinearGradient
      colors={[gradient[0], gradient[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius, overflow: 'hidden' }, style]}
    >
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={iconSize} color="rgba(255,255,255,0.45)" />
        </View>
      )}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
