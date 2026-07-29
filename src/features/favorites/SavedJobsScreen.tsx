import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { EmptyState, ErrorView, GradientPhoto, PressableScale, Skeleton } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadJob, toggleSaveJob } from '../../store/slices/jobsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Application, ApplicationStatus, CastingJob, JobType } from '../../types';
import { daysUntil, formatPay } from '../../utils/format';
import { haptic } from '../../utils/haptics';

const STATUS_META: Record<ApplicationStatus, { label: string; bg: string; fg: string }> = {
  submitted: { label: 'Applied', bg: colors.tintSoft, fg: colors.tint },
  in_review: { label: 'In review', bg: colors.orangeSoft, fg: colors.orange },
  shortlisted: { label: 'Shortlisted', bg: colors.greenSoft, fg: colors.green },
};

const JOB_ICONS: Record<JobType, keyof typeof Ionicons.glyphMap> = {
  Film: 'film',
  'TV Series': 'tv',
  Commercial: 'megaphone',
  Theatre: 'ticket',
  'Music Video': 'musical-notes',
  Voiceover: 'mic',
};

interface RowProps {
  job: CastingJob;
  application?: Application;
  index: number;
  onPress: () => void;
  onUnsave: () => void;
}

function SavedJobRow({ job, application, index, onPress, onUnsave }: RowProps) {
  const closesIn = daysUntil(job.deadline);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(18)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.springify().damping(18)}
    >
      <PressableScale style={styles.card} onPress={onPress}>
        <GradientPhoto
          gradient={job.gradient}
          borderRadius={radius.m}
          style={styles.thumb}
          icon={JOB_ICONS[job.type]}
          iconSize={24}
        />
        <View style={styles.info}>
          <Text style={type.headline} numberOfLines={1}>
            {job.title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {job.company}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {job.type} · {job.location}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.pay} numberOfLines={1}>
              {formatPay(job)}
            </Text>
            <Text style={[styles.closes, closesIn <= 3 && { color: colors.orange }]}>
              Closes in {closesIn}d
            </Text>
          </View>
          {application && (
            <View style={[styles.pill, { backgroundColor: STATUS_META[application.status].bg }]}>
              <Text style={[styles.pillLabel, { color: STATUS_META[application.status].fg }]}>
                {STATUS_META[application.status].label}
              </Text>
            </View>
          )}
        </View>
        <PressableScale
          hapticOnPress={false}
          hitSlop={10}
          onPress={() => {
            haptic.medium();
            onUnsave();
          }}
          style={styles.bookmark}
        >
          <Ionicons name="bookmark" size={20} color={colors.tint} />
        </PressableScale>
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
      <Skeleton width={64} height={64} borderRadius={radius.m} />
      <View style={[styles.info, { gap: spacing.s }]}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="45%" height={11} />
        <Skeleton width="55%" height={11} />
      </View>
    </Animated.View>
  );
}

export function SavedJobsScreen({ navigation }: RootScreenProps<'SavedJobs'>) {
  const dispatch = useAppDispatch();
  const savedIds = useAppSelector((state) => state.jobs.savedIds);
  const entities = useAppSelector((state) => state.jobs.entities);
  const applications = useAppSelector((state) => state.jobs.applications);

  const requested = useRef<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissing = useCallback(
    (force = false) => {
      const missing = savedIds.filter(
        (id) => !entities[id] && (force || !requested.current.has(id)),
      );
      for (const id of missing) {
        requested.current.add(id);
        dispatch(loadJob(id))
          .unwrap()
          .catch(() => setFailed(true));
      }
    },
    [dispatch, savedIds, entities],
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
      await Promise.all(savedIds.map((id) => dispatch(loadJob(id)).unwrap()));
    } catch {
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, savedIds]);

  const resolvedCount = savedIds.reduce((sum, id) => sum + (entities[id] ? 1 : 0), 0);

  if (failed && resolvedCount === 0 && savedIds.length > 0) {
    return (
      <View style={styles.center}>
        <ErrorView onRetry={onRetry} />
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={savedIds}
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
        savedIds.length > 0 ? (
          <Text style={styles.countLine}>
            {savedIds.length} saved {savedIds.length === 1 ? 'casting' : 'castings'}
          </Text>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="bookmark-outline"
          title="No saved castings"
          message="Bookmark castings you like and they will wait for you right here."
          actionLabel="Browse castings"
          onAction={() => navigation.navigate('Tabs', { screen: 'Castings' })}
        />
      }
      renderItem={({ item: id, index }) => {
        const job = entities[id];
        if (!job) return <SkeletonCard index={index} />;
        return (
          <SavedJobRow
            job={job}
            application={applications[id]}
            index={index}
            onPress={() => navigation.navigate('JobDetail', { jobId: id })}
            onUnsave={() => dispatch(toggleSaveJob(id))}
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
    alignItems: 'flex-start',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    marginBottom: spacing.m,
    ...shadows.card,
  },
  thumb: {
    width: 64,
    height: 64,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  company: {
    ...type.subheadBold,
  },
  meta: {
    ...type.footnote,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s,
    marginTop: spacing.xs,
  },
  pay: {
    ...type.subheadBold,
    color: colors.tint,
    flexShrink: 1,
  },
  closes: {
    ...type.caption,
  },
  pill: {
    alignSelf: 'flex-start',
    marginTop: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  bookmark: {
    paddingTop: 2,
  },
});
