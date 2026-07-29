import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  count: number;
  style?: StyleProp<ViewStyle>;
}

/** Small red unread-count badge (caps at 99+). Renders nothing for 0. */
export function Badge({ count, style }: Props) {
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
