import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, ErrorView, FooterSpinner, PressableScale, Skeleton } from '../../components';
import { TabScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadJobs, setTypeFilter, toggleSaveJob } from '../../store/slices/jobsSlice';
import { radius, spacing, useTheme, type ColorTokens } from '../../theme';
import { CastingJob, JobType } from '../../types';
import { haptic } from '../../utils/haptics';
import { JobCard } from './JobCard';

const TYPE_FILTERS: (JobType | 'All')[] = [
  'All',
  'Film',
  'TV Series',
  'Commercial',
  'Theatre',
  'Music Video',
  'Voiceover',
];

function JobCardSkeleton() {
  const { colors, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width="100%" height={64} borderRadius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton width="72%" height={16} />
        <Skeleton width="46%" height={13} />
        <Skeleton width="58%" height={12} />
        <Skeleton width="40%" height={13} />
      </View>
    </View>
  );
}

export function JobsScreen({ navigation }: TabScreenProps<'Castings'>) {
  const insets = useSafeAreaInsets();
  const { colors, type, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadows), [colors, shadows]);
  const dispatch = useAppDispatch();
  const { entities, feedIds, status, error, hasMore, typeFilter, savedIds, applications } =
    useAppSelector((state) => state.jobs);

  const jobs = useMemo(
    () => feedIds.map((id) => entities[id]).filter((job): job is CastingJob => job != null),
    [feedIds, entities],
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadJobs({ mode: 'initial', type: typeFilter }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectType = useCallback(
    (nextType: JobType | 'All') => {
      if (nextType === typeFilter) return;
      dispatch(setTypeFilter(nextType));
      dispatch(loadJobs({ mode: 'initial', type: nextType }));
    },
    [dispatch, typeFilter],
  );

  const onRefresh = useCallback(() => {
    dispatch(loadJobs({ mode: 'refresh', type: typeFilter }));
  }, [dispatch, typeFilter]);

  const onEndReached = useCallback(() => {
    if (status === 'ready' && hasMore) {
      dispatch(loadJobs({ mode: 'more', type: typeFilter }));
    }
  }, [dispatch, status, hasMore, typeFilter]);

  const showSkeleton = status === 'loading' && jobs.length === 0;
  const showError = status === 'error' && jobs.length === 0;
  const showEmpty = status === 'ready' && jobs.length === 0;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top + spacing.m }}>
        <View style={styles.titleRow}>
          <Text style={type.largeTitle}>Castings</Text>
          <PressableScale
            style={styles.frostedButton}
            onPress={() => navigation.navigate('SavedJobs')}
          >
            <Ionicons name="bookmark" size={18} color={colors.label} />
          </PressableScale>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {TYPE_FILTERS.map((filterType) => (
            <Chip
              key={filterType}
              label={filterType}
              selected={filterType === typeFilter}
              onPress={() => onSelectType(filterType)}
            />
          ))}
        </ScrollView>
      </View>

      {showSkeleton ? (
        <View>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      ) : showError ? (
        <ErrorView
          message={error}
          onRetry={() => dispatch(loadJobs({ mode: 'initial', type: typeFilter }))}
        />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(job) => job.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={status === 'refreshing'} onRefresh={onRefresh} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            showEmpty ? (
              <EmptyState
                icon="film-outline"
                title="No castings"
                message={
                  typeFilter === 'All'
                    ? 'No open castings right now. Pull to refresh.'
                    : `No ${typeFilter} castings right now. Try another category.`
                }
                actionLabel={typeFilter !== 'All' ? 'Show all' : undefined}
                onAction={typeFilter !== 'All' ? () => onSelectType('All') : undefined}
              />
            ) : null
          }
          ListFooterComponent={<FooterSpinner visible={status === 'loadingMore'} />}
          renderItem={({ item, index }) => (
            <JobCard
              job={item}
              application={applications[item.id]}
              saved={savedIds.includes(item.id)}
              index={index}
              onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
              onToggleSave={() => {
                haptic.medium();
                dispatch(toggleSaveJob(item.id));
              }}
            />
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ColorTokens, shadows: Record<string, ViewStyle>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.m,
    },
    frostedButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.separator,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.soft,
    },
    chipsScroll: {
      flexGrow: 0,
    },
    chipsRow: {
      paddingHorizontal: spacing.xl,
      gap: spacing.s,
      paddingBottom: spacing.l,
    },
    listContent: {
      paddingTop: spacing.xs,
      paddingBottom: 110,
    },
    skeletonCard: {
      marginHorizontal: spacing.xl,
      marginBottom: spacing.l,
      borderRadius: radius.xl,
      borderCurve: 'continuous',
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    skeletonBody: {
      padding: spacing.l,
      gap: spacing.s,
    },
  });
}
