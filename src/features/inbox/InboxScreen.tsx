import React, { useEffect, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, EmptyState, ErrorView, PressableScale, SkeletonRow } from '../../components';
import { TabScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadInbox } from '../../store/slices/inboxSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Conversation } from '../../types';
import { timeAgo } from '../../utils/format';
import { TALENT_BY_ID } from './talentLookup';

const TAB_BAR_PADDING = 110;

function ConversationRow({
  conversation,
  index,
  onPress,
}: {
  conversation: Conversation;
  index: number;
  onPress: () => void;
}) {
  const talent = TALENT_BY_ID.get(conversation.talentId);
  if (!talent) return null;
  const unread = conversation.unread > 0;
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18)}>
      <PressableScale style={styles.row} onPress={onPress}>
        <Avatar initials={talent.initials} gradient={talent.gradient} verified={talent.verified} />
        <View style={styles.rowBody}>
          <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
            {talent.name}
          </Text>
          {conversation.typing ? (
            <Text style={styles.typing} numberOfLines={1}>
              typing…
            </Text>
          ) : (
            <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
              {lastMessage ? `${lastMessage.fromMe ? 'You: ' : ''}${lastMessage.text}` : ''}
            </Text>
          )}
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.time}>{timeAgo(conversation.lastMessageAt)}</Text>
          <Badge count={conversation.unread} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export function InboxScreen({ navigation }: TabScreenProps<'Inbox'>) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { conversations, order, status, error } = useAppSelector((state) => state.inbox);

  const initialStatus = useRef(status);
  useEffect(() => {
    if (initialStatus.current !== 'ready') dispatch(loadInbox());
  }, [dispatch]);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
      <Text style={type.largeTitle}>Inbox</Text>
    </View>
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.container}>
        {header}
        <View style={styles.skeletonList}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={styles.skeletonCard}>
              <SkeletonRow />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        {header}
        <ErrorView message={error} onRetry={() => dispatch(loadInbox())} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {header}
      <FlatList
        data={order}
        keyExtractor={(id) => id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={status === 'refreshing'}
            onRefresh={() => dispatch(loadInbox())}
            tintColor={colors.secondaryLabel}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            message="When casting directors and talent message you, chats will show up here."
          />
        }
        renderItem={({ item: id, index }) => {
          const conversation = conversations[id];
          if (!conversation) return null;
          return (
            <ConversationRow
              conversation={conversation}
              index={index}
              onPress={() => navigation.navigate('Chat', { conversationId: id })}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.m,
  },
  skeletonList: {
    paddingHorizontal: spacing.l,
    gap: spacing.m,
  },
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.card,
  },
  listContent: {
    paddingHorizontal: spacing.l,
    paddingBottom: TAB_BAR_PADDING,
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.card,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...type.headline,
    fontWeight: '600',
  },
  nameUnread: {
    fontWeight: '800',
  },
  preview: {
    ...type.subhead,
  },
  previewUnread: {
    color: colors.label,
    fontWeight: '600',
  },
  typing: {
    ...type.subhead,
    color: colors.tint,
    fontStyle: 'italic',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: spacing.s,
  },
  time: {
    ...type.caption,
  },
});
