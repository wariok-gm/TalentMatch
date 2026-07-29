import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Chip,
  EmptyState,
  GradientPhoto,
  PressableScale,
  RatingStars,
  SectionHeader,
  SkeletonRow,
} from '../../components';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  SearchFilters,
  addRecent,
  clearRecent,
  runSearch,
  setFilters,
  setQuery,
} from '../../store/slices/searchSlice';
import { colors, gradients, radius, shadows, spacing, type } from '../../theme';
import { Talent, TalentRole } from '../../types';
import { formatRate } from '../../utils/format';
import { haptic } from '../../utils/haptics';
import { TabScreenProps } from '../../navigation/types';

const ROLES: TalentRole[] = ['Actor', 'Model', 'Dancer', 'Voice Artist', 'Musician', 'Influencer'];

const ROLE_ICONS: Record<TalentRole, keyof typeof Ionicons.glyphMap> = {
  Actor: 'videocam',
  Model: 'camera',
  Dancer: 'body',
  'Voice Artist': 'mic',
  Musician: 'musical-notes',
  Influencer: 'trending-up',
};

const TAB_BAR_PADDING = 110;
const DEBOUNCE_MS = 350;

function filtersKey(query: string, filters: SearchFilters): string {
  return JSON.stringify([
    query,
    filters.role,
    filters.verifiedOnly,
    filters.availableOnly,
    filters.maxRate ?? null,
  ]);
}

function nextMaxRate(current?: number): number | undefined {
  if (current == null) return 250;
  if (current === 250) return 500;
  if (current === 500) return 1000;
  return undefined;
}

export function SearchScreen({ navigation }: TabScreenProps<'Search'>) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { query, filters, resultIds, status, recent } = useAppSelector((state) => state.search);
  const entities = useAppSelector((state) => state.talents.entities);
  const [refreshing, setRefreshing] = useState(false);

  // Mirrors of live state readable inside effects/timeouts without adding deps.
  const statusRef = useRef(status);
  statusRef.current = status;
  const lastRunKey = useRef<string | null>(null);

  const dispatchSearchNow = useCallback(
    (nextQuery: string, nextFilters: SearchFilters) => {
      lastRunKey.current = filtersKey(nextQuery, nextFilters);
      dispatch(runSearch({ query: nextQuery, filters: nextFilters }));
    },
    [dispatch],
  );

  // Debounced search on query / filter changes.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0 && statusRef.current === 'idle') {
      lastRunKey.current = null;
      return;
    }
    const effectiveQuery = trimmed.length >= 1 ? query : '';
    const key = filtersKey(effectiveQuery, filters);
    if (key === lastRunKey.current) return;
    const timer = setTimeout(() => {
      if (key === lastRunKey.current) return;
      lastRunKey.current = key;
      dispatch(runSearch({ query: effectiveQuery, filters }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, filters, dispatch]);

  const results = useMemo(
    () =>
      resultIds
        .map((id) => entities[id])
        .filter((talent): talent is Talent => talent != null),
    [resultIds, entities],
  );

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) return;
    dispatch(addRecent(query));
    dispatchSearchNow(query, filters);
  }, [dispatch, dispatchSearchNow, query, filters]);

  const handleRecentPress = useCallback(
    (term: string) => {
      dispatch(setQuery(term));
      dispatchSearchNow(term, filters);
    },
    [dispatch, dispatchSearchNow, filters],
  );

  const handleCategoryPress = useCallback(
    (role: TalentRole) => {
      const nextFilters: SearchFilters = { ...filters, role };
      dispatch(setQuery(''));
      dispatch(setFilters({ role }));
      dispatchSearchNow('', nextFilters);
    },
    [dispatch, dispatchSearchNow, filters],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const trimmed = query.trim();
      await dispatch(runSearch({ query: trimmed.length >= 1 ? query : '', filters }));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, query, filters]);

  const renderResult = useCallback(
    ({ item, index }: { item: Talent; index: number }) => (
      <Animated.View entering={FadeInDown.delay(Math.min(index, 12) * 40)}>
        <PressableScale
          style={styles.resultRow}
          onPress={() => navigation.navigate('TalentProfile', { talentId: item.id })}
        >
          <Avatar initials={item.initials} gradient={item.gradient} verified={item.verified} />
          <View style={styles.resultBody}>
            <Text style={type.headline} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.resultMeta} numberOfLines={1}>
              {item.role} · {item.location}
            </Text>
            <View style={styles.resultStats}>
              <RatingStars rating={item.rating} reviewsCount={item.reviewsCount} />
              <Text style={styles.rate}>{formatRate(item.hourlyRate)}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.tertiaryLabel} />
        </PressableScale>
      </Animated.View>
    ),
    [navigation],
  );

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
      <Text style={type.largeTitle}>Search</Text>
      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color={colors.secondaryLabel} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => dispatch(setQuery(text))}
          onSubmitEditing={handleSubmit}
          placeholder="Talent, skills, location"
          placeholderTextColor={colors.tertiaryLabel}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <PressableScale
            hapticOnPress={false}
            hitSlop={8}
            onPress={() => {
              haptic.light();
              dispatch(setQuery(''));
            }}
          >
            <Ionicons name="close-circle" size={18} color={colors.tertiaryLabel} />
          </PressableScale>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          label="All"
          selected={filters.role === 'All'}
          onPress={() => dispatch(setFilters({ role: 'All' }))}
        />
        {ROLES.map((role) => (
          <Chip
            key={role}
            label={role}
            selected={filters.role === role}
            onPress={() => dispatch(setFilters({ role }))}
          />
        ))}
        <Chip
          label="Verified"
          selected={filters.verifiedOnly}
          onPress={() => dispatch(setFilters({ verifiedOnly: !filters.verifiedOnly }))}
        />
        <Chip
          label="Available now"
          selected={filters.availableOnly}
          onPress={() => dispatch(setFilters({ availableOnly: !filters.availableOnly }))}
        />
        <Chip
          label={filters.maxRate != null ? `≤ $${filters.maxRate}/hr` : 'Any rate'}
          selected={filters.maxRate != null}
          onPress={() => dispatch(setFilters({ maxRate: nextMaxRate(filters.maxRate) }))}
        />
      </ScrollView>
    </View>
  );

  let body: React.ReactNode;
  if (status === 'searching' && !refreshing) {
    body = (
      <View style={styles.skeletonWrap}>
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonRow key={i} style={styles.skeletonRow} />
        ))}
      </View>
    );
  } else if (status === 'idle') {
    body = (
      <ScrollView
        contentContainerStyle={styles.idleContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {recent.length > 0 && (
          <View style={styles.recentBlock}>
            <SectionHeader
              title="Recent"
              actionLabel="Clear"
              onAction={() => {
                haptic.light();
                dispatch(clearRecent());
              }}
            />
            <View style={styles.recentCard}>
              {recent.map((term, i) => (
                <Animated.View key={term} entering={FadeInDown.delay(i * 40)}>
                  <PressableScale
                    style={[styles.recentRow, i > 0 && styles.recentRowBorder]}
                    onPress={() => handleRecentPress(term)}
                  >
                    <Ionicons name="time-outline" size={18} color={colors.secondaryLabel} />
                    <Text style={styles.recentText} numberOfLines={1}>
                      {term}
                    </Text>
                    <Ionicons
                      name="arrow-up-outline"
                      size={16}
                      color={colors.tertiaryLabel}
                      style={styles.recentArrow}
                    />
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </View>
        )}
        <SectionHeader title="Browse by category" />
        <View style={styles.grid}>
          {ROLES.map((role, i) => (
            <Animated.View key={role} entering={FadeInDown.delay(i * 40)} style={styles.tileWrap}>
              <PressableScale onPress={() => handleCategoryPress(role)}>
                <GradientPhoto
                  gradient={gradients[(i * 3) % gradients.length]}
                  borderRadius={radius.l}
                  icon={ROLE_ICONS[role]}
                  iconSize={34}
                  style={styles.tile}
                >
                  <View style={styles.tileLabelWrap}>
                    <Text style={styles.tileLabel}>{role}</Text>
                  </View>
                </GradientPhoto>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    );
  } else {
    body = (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listContentEmpty,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.secondaryLabel} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No matches"
            message="Try a different name, skill, or loosen the filters."
          />
        }
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {header}
      {body}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
    paddingBottom: spacing.s,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.fill,
    borderRadius: radius.s + 2,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.m,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.label,
    paddingVertical: 0,
  },
  chipRow: {
    gap: spacing.s,
    paddingRight: spacing.xl,
  },
  skeletonWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
    gap: spacing.xl,
  },
  skeletonRow: {
    paddingVertical: spacing.xs,
  },
  idleContent: {
    paddingTop: spacing.m,
    paddingBottom: TAB_BAR_PADDING,
  },
  recentBlock: {
    marginBottom: spacing.xl,
  },
  recentCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    ...shadows.card,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m + 2,
  },
  recentRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  recentText: {
    ...type.body,
    flex: 1,
  },
  recentArrow: {
    transform: [{ rotate: '45deg' }],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
  },
  tileWrap: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  tile: {
    height: 110,
    justifyContent: 'flex-end',
  },
  tileLabelWrap: {
    padding: spacing.m,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.s,
    paddingBottom: TAB_BAR_PADDING,
    gap: spacing.m,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.card,
  },
  resultBody: {
    flex: 1,
    gap: 3,
  },
  resultMeta: {
    ...type.footnote,
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginTop: 2,
  },
  rate: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.tint,
  },
});
