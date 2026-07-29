import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmptyState, ErrorView, PressableScale, SkeletonRow } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadNotifications, markAllRead, markRead } from '../../store/slices/notificationsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { AppNotification, NotificationType } from '../../types';
import { timeAgo } from '../../utils/format';
import { haptic } from '../../utils/haptics';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }
> = {
  application_update: { icon: 'document-text', bg: colors.tintSoft, color: colors.tint },
  job_match: { icon: 'film', bg: colors.greenSoft, color: colors.green },
  message: { icon: 'chatbubble', bg: colors.tintSoft, color: colors.tint },
  profile_view: { icon: 'eye', bg: colors.orangeSoft, color: colors.orange },
  favorite: { icon: 'heart', bg: colors.pinkSoft, color: colors.pink },
  callback: { icon: 'star', bg: colors.orangeSoft, color: colors.orange },
};

interface NotificationSection {
  title: string;
  data: AppNotification[];
}

function NotificationRow({
  item,
  index,
  onPress,
}: {
  item: AppNotification;
  index: number;
  onPress: (item: AppNotification) => void;
}) {
  const config = TYPE_CONFIG[item.type];
  return (
    <Animated.View entering={FadeInDown.delay(index * 40)}>
      <PressableScale style={styles.row} onPress={() => onPress(item)}>
        <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.rowBody}>
          <View style={styles.titleLine}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </PressableScale>
    </Animated.View>
  );
}

export function NotificationsScreen({ navigation }: RootScreenProps<'Notifications'>) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.notifications);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  useEffect(() => {
    dispatch(loadNotifications());
  }, [dispatch]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unreadCount > 0 ? (
          <PressableScale
            hapticOnPress={false}
            hitSlop={8}
            onPress={() => {
              haptic.success();
              dispatch(markAllRead());
            }}
          >
            <Text style={styles.markAll}>Mark all read</Text>
          </PressableScale>
        ) : null,
    });
  }, [navigation, dispatch, unreadCount]);

  const sections = useMemo<NotificationSection[]>(() => {
    const sorted = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const unread = sorted.filter((n) => !n.read);
    const read = sorted.filter((n) => n.read);
    const result: NotificationSection[] = [];
    if (unread.length > 0) result.push({ title: 'New', data: unread });
    if (read.length > 0) result.push({ title: 'Earlier', data: read });
    return result;
  }, [items]);

  const handlePress = useCallback(
    (item: AppNotification) => {
      dispatch(markRead(item.id));
      if (item.jobId) {
        navigation.navigate('JobDetail', { jobId: item.jobId });
      } else if (item.talentId) {
        navigation.navigate('TalentProfile', { talentId: item.talentId });
      }
    },
    [dispatch, navigation],
  );

  if (status === 'loading' || status === 'idle') {
    return (
      <View style={styles.skeletonWrap}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.skeletonCard}>
            <SkeletonRow />
          </View>
        ))}
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <ErrorView message={error} onRetry={() => dispatch(loadNotifications())} />
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={status === 'refreshing'}
          onRefresh={() => dispatch(loadNotifications())}
          tintColor={colors.secondaryLabel}
        />
      }
      renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
      renderItem={({ item, index }) => (
        <NotificationRow item={item} index={index} onPress={handlePress} />
      )}
      ListEmptyComponent={
        <EmptyState
          icon="notifications-outline"
          title="All caught up"
          message="No notifications yet. When something happens, it lands here."
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  sectionTitle: {
    ...type.title3,
    marginTop: spacing.s,
    marginBottom: spacing.m,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.soft,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
  },
  rowTitle: {
    ...type.subheadBold,
    flex: 1,
  },
  time: {
    ...type.caption,
    color: colors.tertiaryLabel,
  },
  body: {
    ...type.footnote,
    lineHeight: 18,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.tint,
  },
  markAll: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.tint,
  },
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    gap: spacing.m,
  },
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
});
