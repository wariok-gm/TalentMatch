import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  gradient: readonly [string, string];
  /** Photo URL; the gradient (and ghost icon) show while it loads and as fallback. */
  uri?: string;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  /** Optional ionicon rendered ghost-like in the middle (e.g. "videocam", "musical-notes"). */
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  children?: React.ReactNode;
}

/**
 * Photo surface: a Pexels image over a gradient placeholder, or the plain
 * gradient when no `uri` is given. Used for heroes, covers, and media grids.
 */
export function GradientPhoto({ gradient, uri, style, borderRadius = 0, icon, iconSize = 44, children }: Props) {
  // Transient CDN drops happen; remount the Image to retry, then stay on the
  // gradient fallback if the URL keeps failing.
  const [attempt, setAttempt] = useState(0);
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
      {uri != null && attempt < 3 && (
        <Image
          key={attempt}
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          onError={() => setAttempt((a) => a + 1)}
        />
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
