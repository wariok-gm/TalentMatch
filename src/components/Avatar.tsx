import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  initials: string;
  gradient: readonly [string, string];
  /** Photo URL; the gradient + initials show while it loads (and as fallback). */
  uri?: string;
  size?: number;
  verified?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Photo avatar with a gradient-initials placeholder/fallback. */
export function Avatar({ initials, gradient, uri, size = 52, verified = false, style }: Props) {
  const badgeSize = Math.max(16, size * 0.32);
  // Retry transient CDN failures by remounting; fall back to initials after 3.
  const [attempt, setAttempt] = React.useState(0);
  return (
    <View style={[{ width: size, height: size }, style]}>
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        {uri != null && attempt < 3 && (
          <Image
            key={attempt}
            source={{ uri }}
            style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            onError={() => setAttempt((a) => a + 1)}
          />
        )}
      </LinearGradient>
      {verified && (
        <View
          style={[
            styles.badge,
            { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 },
          ]}
        >
          <Ionicons name="checkmark" size={badgeSize * 0.62} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
});
