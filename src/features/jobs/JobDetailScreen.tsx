import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, GradientPhoto, PressableScale, Skeleton } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadJob } from '../../store/slices/jobsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { daysUntil, formatCount, formatPay, timeAgo } from '../../utils/format';
import { JOB_TYPE_ICONS } from './JobCard';
import { StatusTimeline } from './StatusTimeline';

function InfoCell({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCell}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.tint} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={type.caption}>{label}</Text>
        <Text style={type.subheadBold} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.content}>
      <Skeleton width="100%" height={200} borderRadius={radius.xl} />
      <View style={{ gap: spacing.m, marginTop: spacing.xl }}>
        <Skeleton width="78%" height={24} />
        <Skeleton width="52%" height={15} />
        <Skeleton width="100%" height={110} borderRadius={radius.xl} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="92%" height={14} />
        <Skeleton width="70%" height={14} />
      </View>
    </View>
  );
}

export function JobDetailScreen({ navigation, route }: RootScreenProps<'JobDetail'>) {
  const { jobId } = route.params;
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const job = useAppSelector((state) => state.jobs.entities[jobId]);
  const application = useAppSelector((state) => state.jobs.applications[jobId]);

  useEffect(() => {
    if (!job) dispatch(loadJob(jobId));
  }, [job, jobId, dispatch]);

  if (!job) {
    return <DetailSkeleton />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: (application ? 190 : 130) + insets.bottom },
        ]}
      >
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <GradientPhoto
            gradient={job.gradient}
            style={styles.hero}
            borderRadius={radius.xl}
            icon={JOB_TYPE_ICONS[job.type]}
            iconSize={64}
          >
            <View style={styles.heroPills}>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{job.type}</Text>
              </View>
              {job.urgent && (
                <View style={styles.urgentPill}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>
          </GradientPhoto>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
          <Text style={[type.title1, styles.title]}>{job.title}</Text>
          <Text style={type.subhead}>
            {job.company} · {job.location}
          </Text>
          <Text style={[type.footnote, styles.posted]}>Posted {timeAgo(job.postedAt)} ago</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).springify().damping(18)}
          style={styles.infoCard}
        >
          <InfoCell icon="cash-outline" label="Pay" value={formatPay(job)} />
          <InfoCell icon="calendar-outline" label="Shoot dates" value={job.shootDates} />
          <InfoCell
            icon="hourglass-outline"
            label="Deadline"
            value={`Closes in ${daysUntil(job.deadline)}d`}
          />
          <InfoCell
            icon="people-outline"
            label="Applicants"
            value={`${formatCount(job.applicants)} applied`}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={[type.callout, styles.description]}>{job.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify().damping(18)}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsCard}>
            {job.requirements.map((requirement, i) => (
              <View
                key={requirement}
                style={[styles.requirementRow, i > 0 && styles.requirementBorder]}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                <Text style={[type.subheadBold, styles.requirementText]}>{requirement}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify().damping(18)}>
          <Text style={styles.sectionTitle}>Roles needed</Text>
          <View style={styles.rolesRow}>
            {job.rolesNeeded.map((role) => (
              <Chip key={role} label={role} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.m }]}>
        {application ? (
          <StatusTimeline status={application.status} />
        ) : (
          <PressableScale
            style={styles.applyButton}
            onPress={() => navigation.navigate('Apply', { jobId })}
          >
            <Text style={styles.applyLabel}>Apply now</Text>
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.m,
  },
  hero: {
    height: 200,
    borderCurve: 'continuous',
    ...shadows.card,
  },
  heroPills: {
    flexDirection: 'row',
    gap: spacing.s,
    padding: spacing.l,
  },
  typePill: {
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 5,
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  urgentPill: {
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 5,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  posted: {
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: spacing.l,
    marginTop: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.l,
    ...shadows.card,
  },
  infoCell: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
    paddingRight: spacing.s,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.tintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    flex: 1,
    gap: 1,
  },
  sectionTitle: {
    ...type.title3,
    marginTop: spacing.xxl,
    marginBottom: spacing.m,
  },
  description: {
    lineHeight: 24,
    color: colors.label,
  },
  requirementsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.l,
    ...shadows.card,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m + 2,
  },
  requirementBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  requirementText: {
    flex: 1,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
  },
  applyButton: {
    backgroundColor: colors.label,
    borderRadius: radius.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.float,
  },
  applyLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
