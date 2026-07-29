import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar, PressableScale, Skeleton } from '../../components';
import { TabScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadJob } from '../../store/slices/jobsSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Application, ApplicationStatus } from '../../types';
import { timeAgo } from '../../utils/format';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  submitted: { label: 'Applied', bg: colors.tintSoft, color: colors.tint },
  in_review: { label: 'In review', bg: colors.orangeSoft, color: colors.orange },
  shortlisted: { label: 'Shortlisted', bg: colors.greenSoft, color: colors.green },
};

const MENU_ITEMS: Array<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: 'Favorites' | 'SavedJobs' | 'Notifications';
}> = [
  { icon: 'heart-outline', label: 'Favorites', route: 'Favorites' },
  { icon: 'bookmark-outline', label: 'Saved Jobs', route: 'SavedJobs' },
  { icon: 'notifications-outline', label: 'Notifications', route: 'Notifications' },
];

export function MyProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);
  const favoritesCount = useAppSelector((state) => state.favorites.ids.length);
  const savedCount = useAppSelector((state) => state.jobs.savedIds.length);
  const applications = useAppSelector((state) => state.jobs.applications);
  const jobEntities = useAppSelector((state) => state.jobs.entities);

  const sortedApplications = useMemo<Application[]>(
    () =>
      Object.values(applications).sort((a, b) => (a.appliedAt < b.appliedAt ? 1 : -1)),
    [applications],
  );

  useEffect(() => {
    for (const app of sortedApplications) {
      if (!jobEntities[app.jobId]) dispatch(loadJob(app.jobId));
    }
  }, [sortedApplications, jobEntities, dispatch]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.m }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={type.largeTitle}>Profile</Text>
        <PressableScale
          style={styles.gearButton}
          hitSlop={6}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.label} />
        </PressableScale>
      </View>

      <Animated.View entering={FadeInDown.delay(0)} style={styles.heroCard}>
        <Avatar initials={profile.initials} gradient={profile.gradient} size={84} />
        <Text style={[type.title1, styles.heroName]}>{profile.name}</Text>
        <Text style={styles.headline}>{profile.headline}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={13} color={colors.secondaryLabel} />
          <Text style={type.footnote}>{profile.location}</Text>
        </View>
        <PressableScale
          style={styles.editPill}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editPillLabel}>Edit profile</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40)} style={styles.statsCard}>
        <PressableScale
          style={styles.statCol}
          hapticOnPress={false}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.statValue}>{favoritesCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </PressableScale>
        <View style={styles.statDivider} />
        <PressableScale
          style={styles.statCol}
          hapticOnPress={false}
          onPress={() => navigation.navigate('SavedJobs')}
        >
          <Text style={styles.statValue}>{savedCount}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </PressableScale>
        <View style={styles.statDivider} />
        <PressableScale style={styles.statCol} hapticOnPress={false}>
          <Text style={styles.statValue}>{sortedApplications.length}</Text>
          <Text style={styles.statLabel}>Applications</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80)} style={styles.menuCard}>
        {MENU_ITEMS.map((item, i) => (
          <View key={item.route}>
            {i > 0 && <View style={styles.hairline} />}
            <PressableScale
              style={styles.menuRow}
              hapticOnPress={false}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={17} color={colors.tint} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.tertiaryLabel} />
            </PressableScale>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.sectionTitle}>My applications</Text>
      {sortedApplications.length === 0 ? (
        <View style={styles.emptyApps}>
          <Ionicons name="document-text-outline" size={22} color={colors.tertiaryLabel} />
          <Text style={styles.emptyAppsText}>
            No applications yet. Find a casting and go for it.
          </Text>
        </View>
      ) : (
        sortedApplications.map((app, i) => {
          const job = jobEntities[app.jobId];
          const status = STATUS_CONFIG[app.status];
          return (
            <Animated.View key={app.jobId} entering={FadeInDown.delay(120 + i * 40)}>
              <PressableScale
                style={styles.appRow}
                onPress={() => navigation.navigate('JobDetail', { jobId: app.jobId })}
              >
                {job ? (
                  <View style={styles.appBody}>
                    <Text style={type.subheadBold} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={type.footnote} numberOfLines={1}>
                      {job.company}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.appBody, { gap: 8 }]}>
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="45%" height={11} />
                  </View>
                )}
                <View style={styles.appMeta}>
                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusLabel, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                  <Text style={styles.appTime}>{timeAgo(app.appliedAt)}</Text>
                </View>
              </PressableScale>
            </Animated.View>
          );
        })
      )}

      <Text style={styles.footer}>TalentMatch · mock build</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.l,
  },
  gearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  heroName: {
    marginTop: spacing.l,
  },
  headline: {
    ...type.subhead,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.s,
  },
  editPill: {
    marginTop: spacing.xl,
    backgroundColor: colors.label,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.pill,
  },
  editPillLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    paddingVertical: spacing.l,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: spacing.xs,
  },
  statValue: {
    ...type.title2,
  },
  statLabel: {
    ...type.caption,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    marginBottom: spacing.xxl,
    overflow: 'hidden',
    ...shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l - 2,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...type.body,
    flex: 1,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginLeft: spacing.l + 32 + spacing.m,
  },
  sectionTitle: {
    ...type.title2,
    marginBottom: spacing.m,
  },
  emptyApps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.card,
    borderRadius: radius.l,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.soft,
  },
  emptyAppsText: {
    ...type.footnote,
    flex: 1,
  },
  appRow: {
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
  appBody: {
    flex: 1,
    gap: 2,
  },
  appMeta: {
    alignItems: 'flex-end',
    gap: 5,
  },
  statusPill: {
    paddingHorizontal: spacing.m - 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  appTime: {
    ...type.caption,
    color: colors.tertiaryLabel,
  },
  footer: {
    ...type.caption2,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
