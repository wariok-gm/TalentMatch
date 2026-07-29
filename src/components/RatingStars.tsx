import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ColorTokens, useTheme } from '../theme';

interface Props {
  rating: number;
  reviewsCount?: number;
  size?: number;
}

/** Compact "★ 4.8 (120)" rating display. */
export function RatingStars({ rating, reviewsCount, size = 13 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={colors.orange} />
      <Text style={[styles.rating, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {reviewsCount != null && (
        <Text style={[styles.count, { fontSize: size - 1 }]}>({reviewsCount})</Text>
      )}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    rating: {
      fontWeight: '700',
      color: colors.label,
    },
    count: {
      color: colors.secondaryLabel,
    },
  });
}
