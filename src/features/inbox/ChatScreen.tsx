import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  makeLocalMessageId,
  markConversationRead,
  receiveAutoReply,
  sendMessage,
} from '../../store/slices/inboxSlice';
import { colors, radius, spacing, type } from '../../theme';
import { Message } from '../../types';
import { timeAgo } from '../../utils/format';
import { haptic } from '../../utils/haptics';
import { MessageBubble } from './MessageBubble';
import { TALENT_BY_ID } from './talentLookup';
import { TypingIndicator } from './TypingIndicator';

/** Show a small time label when messages are more than this far apart. */
const GAP_MS = 45 * 60 * 1000;
const EMPTY_MESSAGES: Message[] = [];

export function ChatScreen({ route, navigation }: RootScreenProps<'Chat'>) {
  const { conversationId } = route.params;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const conversation = useAppSelector((state) => state.inbox.conversations[conversationId]);
  const talent = conversation ? TALENT_BY_ID.get(conversation.talentId) : undefined;
  const messages = conversation?.messages ?? EMPTY_MESSAGES;
  const typing = conversation?.typing === true;

  const [draft, setDraft] = useState('');
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: talent?.name ?? 'Chat' });
  }, [navigation, talent?.name]);

  useFocusEffect(
    useCallback(() => {
      dispatch(markConversationRead(conversationId));
    }, [dispatch, conversationId]),
  );

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    [],
  );

  const data = useMemo(() => [...messages].reverse(), [messages]);

  const lastMineId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].fromMe) return messages[i].id;
    }
    return undefined;
  }, [messages]);

  const canSend = draft.trim().length > 0;

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    haptic.light();
    const localId = makeLocalMessageId();
    dispatch(sendMessage({ conversationId, text, localId }))
      .unwrap()
      .then(() => {
        const delayMs = 600 + Math.round(Math.random() * 600);
        replyTimer.current = setTimeout(() => {
          dispatch(receiveAutoReply({ conversationId }));
        }, delayMs);
      })
      .catch(() => {});
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    // Inverted list: the chronologically previous message sits at index + 1.
    const previous = data[index + 1];
    const showTime =
      !previous ||
      new Date(item.sentAt).getTime() - new Date(previous.sentAt).getTime() > GAP_MS;
    return (
      <View>
        {showTime && <Text style={styles.timeLabel}>{timeAgo(item.sentAt)}</Text>}
        <MessageBubble message={item} showStatus={item.id === lastMineId} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        data={data}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        ListHeaderComponent={typing ? <TypingIndicator /> : null}
      />
      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.s) }]}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.tertiaryLabel}
          multiline
          returnKeyType="default"
        />
        <PressableScale
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!canSend}
          hapticOnPress={canSend}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  timeLabel: {
    ...type.caption2,
    textAlign: 'center',
    marginVertical: spacing.m,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    backgroundColor: colors.glass,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    paddingHorizontal: spacing.l,
    paddingTop: Platform.OS === 'ios' ? 9 : 6,
    paddingBottom: Platform.OS === 'ios' ? 9 : 6,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    fontSize: 16,
    color: colors.label,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
});
