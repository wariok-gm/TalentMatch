import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Chip,
  EmptyState,
  ErrorView,
  FooterSpinner,
  PressableScale,
  Skeleton,
  SkeletonRow,
} from '../../components';
import { RootStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import { loadNotifications } from '../../store/slices/notificationsSlice';
import { loadDiscover, setRoleFilter } from '../../store/slices/talentsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Talent, TalentRole } from '../../types';
import { haptic } from '../../utils/haptics';
import { FeaturedCarousel } from './FeaturedCarousel';
import { TalentCard } from './TalentCard';

const CATEGORIES: Array<TalentRole | 'All'> = [
  'All',
  'Actor',
  'Model',
  'Dancer',
  'Voice Artist',
  'Musician',
  'Influencer',
];

const TAB_BAR_CLEARANCE = 110;

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={220} borderRadius={radius.xl} />
      <SkeletonRow style={{ marginTop: spacing.m }} />
      <View style={styles.skeletonMeta}>
        <Skeleton width={90} height={12} />
        <Skeleton width={140} height={12} />
      </View>
    </View>
  );
}

export function DiscoverScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const { entities, feedIds, status, hasMore, error, roleFilter } = useAppSelector(
    (state) => state.talents,
  );
  const favoriteIds = useAppSelector((state) => state.favorites.ids);
  const hasUnread = useAppSelector((state) => state.notifications.items.some((n) => !n.read));
  const notificationsStatus = useAppSelector((state) => state.notifications.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadDiscover({ mode: 'initial', role: roleFilter }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (notificationsStatus === 'idle') {
      dispatch(loadNotifications());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const feed = useMemo(
    () => feedIds.map((id) => entities[id]).filter((t): t is Talent => t != null),
    [feedIds, entities],
  );
  const featured = useMemo(() => feed.filter((t) => t.featured), [feed]);

  const listData = status === 'loading' || status === 'error' ? [] : feed;

  const openProfile = useCallback(
    (talentId: string) => navigation.navigate('TalentProfile', { talentId }),
    [navigation],
  );

  const onSelectRole = useCallback(
    (role: TalentRole | 'All') => {
      if (role === roleFilter) return;
      dispatch(setRoleFilter(role));
      dispatch(loadDiscover({ mode: 'initial', role }));
    },
    [dispatch, roleFilter],
  );

  const onRefresh = useCallback(() => {
    dispatch(loadDiscover({ mode: 'refresh', role: roleFilter }));
  }, [dispatch, roleFilter]);

  const onEndReached = useCallback(() => {
    if (hasMore && status === 'ready' && feed.length > 0) {
      dispatch(loadDiscover({ mode: 'more', role: roleFilter }));
    }
  }, [dispatch, hasMore, status, feed.length, roleFilter]);

  const onToggleFavorite = useCallback(
    (talentId: string) => {
      dispatch(toggleFavorite(talentId));
    },
    [dispatch],
  );

  const listHeader = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRail}
      >
        {CATEGORIES.map((role) => (
          <Chip
            key={role}
            label={role}
            selected={roleFilter === role}
            onPress={() => onSelectRole(role)}
          />
        ))}
      </ScrollView>
      {roleFilter === 'All' && status !== 'loading' && status !== 'error' && (
        <FeaturedCarousel talents={featured} onPressTalent={openProfile} />
      )}
    </View>
  );

  const listEmpty =
    status === 'loading' ? (
      <View>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    ) : status === 'error' ? (
      <ErrorView
        message={error}
        onRetry={() => dispatch(loadDiscover({ mode: 'initial', role: roleFilter }))}
      />
    ) : status === 'ready' ? (
      <EmptyState
        icon="sparkles-outline"
        title="No talent found"
        message="Nobody matches this category yet. Try another one."
        actionLabel="Show everyone"
        onAction={() => onSelectRole('All')}
      />
    ) : null;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>{greetingForHour(new Date().getHours())}</Text>
          <Text style={type.largeTitle}>Discover</Text>
        </View>
        <PressableScale
          style={styles.bellButton}
          onPress={() => {
            haptic.selection();
            navigation.navigate('Notifications');
          }}
          hapticOnPress={false}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={21} color={colors.label} />
          {hasUnread && <View style={styles.unreadDot} />}
        </PressableScale>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TalentCard
            talent={item}
            index={index}
            favorite={favoriteIds.includes(item.id)}
            onPress={() => openProfile(item.id)}
            onToggleFavorite={() => onToggleFavorite(item.id)}
          />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={<FooterSpinner visible={status === 'loadingMore'} />}
        refreshControl={
          <RefreshControl
            refreshing={status === 'refreshing'}
            onRefresh={onRefresh}
            tintColor={colors.secondaryLabel}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.l,
  },
  headerText: {
    gap: 2,
  },
  greeting: {
    ...type.subhead,
    fontWeight: '600',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.soft,
  },
  unreadDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  chipRail: {
    paddingHorizontal: spacing.xl,
    gap: spacing.s,
    paddingBottom: spacing.xl,
  },
  listContent: {
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  skeletonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
    padding: spacing.m,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  skeletonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    paddingBottom: spacing.xs,
  },
});
