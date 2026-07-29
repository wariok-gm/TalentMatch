import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { spacing } from '../theme';

/** Infinite-scroll footer. Render when status === 'loadingMore'. */
export function FooterSpinner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.wrap}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
