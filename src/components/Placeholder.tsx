import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorTokens, TypeTokens, useTheme } from '../theme';

/** Temporary stand-in used while feature screens are being built. */
export function Placeholder({ title }: { title: string }) {
  const { colors, type } = useTheme();
  const styles = useMemo(() => createStyles(colors, type), [colors, type]);
  return (
    <View style={styles.container}>
      <Text style={type.title2}>{title}</Text>
      <Text style={styles.hint}>Screen under construction</Text>
    </View>
  );
}

function createStyles(colors: ColorTokens, type: TypeTokens) {
  return StyleSheet.create({
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
}
