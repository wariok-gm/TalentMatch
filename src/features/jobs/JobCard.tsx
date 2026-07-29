import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientPhoto, PressableScale } from '../../components';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Application, ApplicationStatus, CastingJob, JobType } from '../../types';
import { daysUntil, formatCount, formatPay } from '../../utils/format';

export const JOB_TYPE_ICONS: Record<JobType, keyof typeof Ionicons.glyphMap> = {
  Film: 'film',
  'TV Series': 'tv',
  Commercial: 'megaphone',
  Theatre: 'ticket',
  'Music Video': 'musical-notes',
  Voiceover: 'mic',
};

export const STATUS_META: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string }
> = {
  submitted: { label: 'Applied', color: colors.tint, bg: colors.tintSoft },
  in_review: { label: 'In review', color: colors.orange, bg: colors.orangeSoft },
  shortlisted: { label: 'Shortlisted', color: colors.green, bg: colors.greenSoft },
};

interface Props {
  job: CastingJob;
  application?: Application;
  saved: boolean;
  index: number;
  onPress: () => void;
  onToggleSave: () => void;
}

export function JobCard({ job, application, saved, index, onPress, onToggleSave }: Props) {
  const status = application ? STATUS_META[application.status] : undefined;
  const closesIn = daysUntil(job.deadline);

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify().damping(18)}>
      <PressableScale style={styles.shadowWrap} onPress={onPress}>
        <View style={styles.card}>
          <GradientPhoto
            gradient={job.gradient}
            uri={job.coverUrl}
            style={styles.strip}
            icon={JOB_TYPE_ICONS[job.type]}
            iconSize={28}
          >
            <View style={styles.stripRow}>
              {job.urgent ? (
                <View style={styles.urgentPill}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              ) : (
                <View />
              )}
              {status && (
                <View style={[styles.statusPill, { backgroundColor: colors.card }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              )}
            </View>
          </GradientPhoto>

          <View style={styles.body}>
            <Text style={type.headline} numberOfLines={2}>
              {job.title}
            </Text>
            <Text style={[type.subhead, styles.company]} numberOfLines={1}>
              {job.company}
            </Text>
            <Text style={type.footnote} numberOfLines={1}>
              {job.type} · {job.location}
            </Text>
            <Text style={styles.pay}>{formatPay(job)}</Text>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.secondaryLabel} />
                <Text style={type.footnote}>Closes in {closesIn}d</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={colors.secondaryLabel} />
                <Text style={type.footnote}>{formatCount(job.applicants)} applied</Text>
              </View>
              <View style={styles.spacer} />
              <PressableScale
                hapticOnPress={false}
                hitSlop={10}
                scaleTo={0.85}
                onPress={onToggleSave}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={saved ? colors.tint : colors.secondaryLabel}
                />
              </PressableScale>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    ...shadows.card,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.l,
  },
  card: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  strip: {
    height: 64,
    justifyContent: 'center',
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
  },
  urgentPill: {
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.s + 2,
    paddingVertical: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: spacing.l,
    gap: 3,
  },
  company: {
    marginTop: 1,
  },
  pay: {
    ...type.subheadBold,
    color: colors.tint,
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: spacing.m,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spacer: {
    flex: 1,
  },
});
