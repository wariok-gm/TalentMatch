import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { GradientPhoto, PressableScale, Skeleton } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import type { AppDispatch } from '../../store';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { advanceApplication, applyToJob, loadJob } from '../../store/slices/jobsSlice';
import { pushNotification } from '../../store/slices/notificationsSlice';
import { ColorTokens, radius, spacing, TypeTokens, useTheme } from '../../theme';
import { haptic } from '../../utils/haptics';
import { JOB_TYPE_ICONS } from './JobCard';

const NOTE_MAX = 280;

/**
 * Fire-and-forget follow-up pipeline for a submitted application. Lives at
 * module level so it keeps running after the sheet unmounts: once the fake
 * server confirms, push a "received" notification, then ~10s later fake the
 * casting team moving the application into review.
 */
function runApplicationPipeline(
  dispatch: AppDispatch,
  confirmed: Promise<unknown>,
  jobId: string,
  jobTitle: string,
) {
  confirmed
    .then(() => {
      dispatch(
        pushNotification({
          type: 'application_update',
          title: 'Application received',
          body: `Your application for "${jobTitle}" is with the casting team.`,
          jobId,
        }),
      );
      setTimeout(() => {
        dispatch(advanceApplication({ jobId, status: 'in_review' }));
        dispatch(
          pushNotification({
            type: 'application_update',
            title: 'Moved to review',
            body: `Good news — the casting team is now reviewing your application for "${jobTitle}".`,
            jobId,
          }),
        );
      }, 10_000);
    })
    .catch(() => {
      // Mutations never fail in the fake API; nothing to roll back here.
    });
}

export function ApplySheet({ navigation, route }: RootScreenProps<'Apply'>) {
  const { jobId } = route.params;
  const { colors, type, shadows } = useTheme();
  const styles = useMemo(() => createStyles(colors, type, shadows), [colors, type, shadows]);
  const dispatch = useAppDispatch();
  const job = useAppSelector((state) => state.jobs.entities[jobId]);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!job) dispatch(loadJob(jobId));
  }, [job, jobId, dispatch]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const submit = () => {
    if (sent) return;
    haptic.success();
    const confirmed = dispatch(applyToJob({ jobId, note: note.trim() || undefined })).unwrap();
    runApplicationPipeline(dispatch, confirmed, jobId, job?.title ?? 'this casting');
    setSent(true);
    closeTimer.current = setTimeout(() => navigation.goBack(), 1400);
  };

  if (sent) {
    return (
      <View style={styles.successWrap}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.successCircle}>
          <Ionicons name="checkmark" size={44} color="#FFFFFF" />
        </Animated.View>
        <Animated.Text entering={FadeIn.delay(150)} style={[type.title2, styles.successTitle]}>
          Application sent
        </Animated.Text>
        <Animated.Text entering={FadeIn.delay(250)} style={styles.successBody}>
          We'll notify you when the casting team responds.
        </Animated.Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[type.title2, styles.heading]}>Apply</Text>

        {job ? (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.summaryRow}>
            <GradientPhoto
              gradient={job.gradient}
              uri={job.coverUrl}
              style={styles.thumb}
              borderRadius={radius.m}
              icon={JOB_TYPE_ICONS[job.type]}
              iconSize={20}
            />
            <View style={styles.summaryText}>
              <Text style={type.headline} numberOfLines={1}>
                {job.title}
              </Text>
              <Text style={type.subhead} numberOfLines={1}>
                {job.company}
              </Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.summaryRow}>
            <Skeleton width={48} height={48} borderRadius={radius.m} />
            <View style={[styles.summaryText, { gap: spacing.s }]}>
              <Skeleton width="70%" height={15} />
              <Skeleton width="42%" height={12} />
            </View>
          </View>
        )}

        <Text style={styles.fieldLabel}>Add a note</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            multiline
            value={note}
            onChangeText={setNote}
            maxLength={NOTE_MAX}
            placeholder="Share your availability, a link to your reel, or why you're a fit…"
            placeholderTextColor={colors.tertiaryLabel}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {note.length}/{NOTE_MAX}
          </Text>
        </View>

        <PressableScale style={styles.submitButton} onPress={submit}>
          <Text style={styles.submitLabel}>Submit application</Text>
        </PressableScale>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ColorTokens, type: TypeTokens, shadows: Record<string, ViewStyle>) {
  return StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + spacing.s,
    paddingBottom: spacing.xxl,
  },
  heading: {
    marginBottom: spacing.l,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.m,
    ...shadows.soft,
  },
  thumb: {
    width: 48,
    height: 48,
  },
  summaryText: {
    flex: 1,
  },
  fieldLabel: {
    ...type.subheadBold,
    marginTop: spacing.xl,
    marginBottom: spacing.s,
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.soft,
  },
  input: {
    ...type.callout,
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    ...type.caption,
    textAlign: 'right',
    marginTop: spacing.s,
  },
  submitButton: {
    backgroundColor: colors.label,
    borderRadius: radius.pill,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadows.card,
  },
  submitLabel: {
    color: colors.bg,
    fontSize: 17,
    fontWeight: '700',
  },
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.s,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  successTitle: {
    textAlign: 'center',
  },
  successBody: {
    ...type.subhead,
    textAlign: 'center',
    lineHeight: 21,
  },
  });
}
