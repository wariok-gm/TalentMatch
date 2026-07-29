import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import {
  Avatar,
  EmptyState,
  ErrorView,
  HeartButton,
  PressableScale,
  RatingStars,
  SkeletonRow,
} from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import { loadTalent } from '../../store/slices/talentsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Talent } from '../../types';
import { formatRate } from '../../utils/format';

interface RowProps {
  talent: Talent;
  index: number;
  onPress: () => void;
  onUnfavorite: () => void;
}

function FavoriteRow({ talent, index, onPress, onUnfavorite }: RowProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(18)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(18)}
    >
      <PressableScale style={styles.card} onPress={onPress}>
        <Avatar
          initials={talent.initials}
          gradient={talent.gradient}
          size={56}
          verified={talent.verified}
        />
        <View style={styles.info}>
          <Text style={type.headline} numberOfLines={1}>
            {talent.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {talent.role} · {talent.location}
          </Text>
          <View style={styles.statsRow}>
            <RatingStars rating={talent.rating} reviewsCount={talent.reviewsCount} />
            <Text style={styles.rate}>{formatRate(talent.hourlyRate)}</Text>
          </View>
        </View>
        <HeartButton active onPress={onUnfavorite} />
      </PressableScale>
    </Animated.View>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(18)}
      style={styles.card}
    >
      <SkeletonRow style={{ flex: 1 }} />
    </Animated.View>
  );
}

export function FavoritesScreen({ navigation }: RootScreenProps<'Favorites'>) {
  const dispatch = useAppDispatch();
  const ids = useAppSelector((state) => state.favorites.ids);
  const entities = useAppSelector((state) => state.talents.entities);

  const requested = useRef<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissing = useCallback(
    (force = false) => {
      const missing = ids.filter((id) => !entities[id] && (force || !requested.current.has(id)));
      for (const id of missing) {
        requested.current.add(id);
        dispatch(loadTalent(id))
          .unwrap()
          .catch(() => setFailed(true));
      }
    },
    [dispatch, ids, entities],
  );

  useEffect(() => {
    fetchMissing();
  }, [fetchMissing]);

  const onRetry = useCallback(() => {
    setFailed(false);
    fetchMissing(true);
  }, [fetchMissing]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setFailed(false);
    try {
      await Promise.all(ids.map((id) => dispatch(loadTalent(id)).unwrap()));
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, ids]);

  const resolvedCount = ids.reduce((sum, id) => sum + (entities[id] ? 1 : 0), 0);

  if (failed && resolvedCount === 0 && ids.length > 0) {
    return (
      <View style={styles.center}>
        <ErrorView onRetry={onRetry} />
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={ids}
      keyExtractor={(id) => id}
      itemLayoutAnimation={LinearTransition.springify().damping(18)}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.secondaryLabel}
        />
      }
      ListHeaderComponent={
        ids.length > 0 ? (
          <Text style={styles.countLine}>
            {ids.length} {ids.length === 1 ? 'favorite' : 'favorites'}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          message="Tap the heart on any talent to keep them close for your next casting."
          actionLabel="Discover talent"
          onAction={() => navigation.navigate('Tabs', { screen: 'Discover' })}
        />
      }
      renderItem={({ item: id, index }) => {
        const talent = entities[id];
        if (!talent) return <SkeletonCard index={index} />;
        return (
          <FavoriteRow
            talent={talent}
            index={index}
            onPress={() => navigation.navigate('TalentProfile', { talentId: id })}
            onUnfavorite={() => dispatch(toggleFavorite(id))}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xxxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  countLine: {
    ...type.footnote,
    marginBottom: spacing.m,
    marginLeft: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  meta: {
    ...type.subhead,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginTop: 2,
  },
  rate: {
    ...type.subheadBold,
    color: colors.tint,
  },
});
