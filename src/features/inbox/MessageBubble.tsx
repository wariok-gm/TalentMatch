import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Message } from '../../types';

interface Props {
  message: Message;
  /** Render the "Sending…" / "Sent" line under this (mine-only) bubble. */
  showStatus?: boolean;
}

export function MessageBubble({ message, showStatus = false }: Props) {
  const mine = message.fromMe;
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(18).stiffness(220)}
      style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}
    >
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.text, mine ? styles.textMine : styles.textTheirs]}>
          {message.text}
        </Text>
      </View>
      {mine && showStatus && (
        <Text style={styles.status}>{message.status === 'sending' ? 'Sending…' : 'Sent'}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 3,
    maxWidth: '78%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.l,
    paddingVertical: 10,
    borderRadius: radius.l,
    borderCurve: 'continuous',
  },
  bubbleMine: {
    backgroundColor: colors.tint,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 6,
    ...shadows.soft,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
  },
  textMine: {
    color: '#FFFFFF',
  },
  textTheirs: {
    color: colors.label,
  },
  status: {
    ...type.caption,
    color: colors.tertiaryLabel,
    marginTop: spacing.xs,
    marginRight: spacing.xs,
  },
});
