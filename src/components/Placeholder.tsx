import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

/** Temporary stand-in used while feature screens are being built. */
export function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={type.title2}>{title}</Text>
      <Text style={styles.hint}>Screen under construction</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    gap: 6,
  },
  hint: {
    ...type.subhead,
  },
});
