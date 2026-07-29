import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avatar,
  Chip,
  ErrorView,
  GradientPhoto,
  HeartButton,
  PressableScale,
  SectionHeader,
  Skeleton,
} from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorite } from '../../store/slices/favoritesSlice';
import { loadTalent } from '../../store/slices/talentsSlice';
import { colors, gradients, radius, shadows, spacing, type } from '../../theme';
import { formatCount, formatHeight, formatRate } from '../../utils/format';
import { haptic } from '../../utils/haptics';

const PORTFOLIO_ICONS = ['videocam', 'mic', 'musical-notes', 'camera'] as const;
const AVATAR_SIZE = 96;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 100_000;
  return hash;
}

export function TalentProfileScreen({ route, navigation }: RootScreenProps<'TalentProfile'>) {
  const { talentId } = route.params;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const talent = useAppSelector((state) => state.talents.entities[talentId]);
  const isFavorite = useAppSelector((state) => state.favorites.ids.includes(talentId));
  const conversationId = useAppSelector(
    (state) =>
      Object.values(state.inbox.conversations).find((c) => c.talentId === talentId)?.id,
  );

  const [error, setError] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchTalent = useCallback(async () => {
    setError(undefined);
    const result = await dispatch(loadTalent(talentId));
    if (loadTalent.rejected.match(result)) {
      setError(result.error.message);
    }
  }, [dispatch, talentId]);

  useEffect(() => {
    if (!talent) void fetchTalent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTalent();
    setRefreshing(false);
  }, [fetchTalent]);

  const onToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(talentId));
  }, [dispatch, talentId]);

  const onMessage = useCallback(() => {
    if (conversationId) {
      navigation.navigate('Chat', { conversationId });
    } else {
      navigation.navigate('Tabs', { screen: 'Inbox' });
    }
  }, [conversationId, navigation]);

  const heroHeight = Math.round(screenHeight * 0.44);
  const tileSize = Math.floor((screenWidth - spacing.xl * 2 - spacing.m) / 2);

  const portfolioGradients = useMemo<Array<[string, string]>>(() => {
    if (!talent) return [];
    const seed = hashString(talent.id);
    return PORTFOLIO_ICONS.map((_, i) => {
      const themed = gradients[(seed + i * 5) % gradients.length];
      return i % 2 === 0
        ? [talent.gradient[0], themed[1]]
        : [themed[0], talent.gradient[1]];
    });
  }, [talent]);

  const floatingTop = insets.top + spacing.s;

  if (!talent && error) {
    return (
      <View style={styles.screen}>
        <View style={[styles.errorWrap, { paddingTop: insets.top }]}>
          <ErrorView message={error} onRetry={() => void fetchTalent()} />
        </View>
        <FloatingCircleButton
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', top: floatingTop, left: spacing.l }}
        />
      </View>
    );
  }

  if (!talent) {
    return (
      <View style={styles.screen}>
        <ProfileSkeleton heroHeight={heroHeight} />
        <FloatingCircleButton
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', top: floatingTop, left: spacing.l }}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />}
      >
        {/* Hero */}
        <GradientPhoto gradient={talent.gradient} uri={talent.photoUrl} style={{ height: heroHeight }} />

        {/* Avatar overlapping hero */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <Avatar
              initials={talent.initials}
              gradient={talent.gradient}
              uri={talent.photoUrl}
              size={AVATAR_SIZE}
              verified={talent.verified}
            />
          </View>
        </Animated.View>

        {/* Identity */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={type.title1}>{talent.name}</Text>
            {talent.verified && (
              <Ionicons name="checkmark-circle" size={22} color={colors.blue} />
            )}
          </View>
          <Text style={styles.roleLine}>
            {talent.role} · {talent.location}
          </Text>
          <View
            style={[
              styles.availabilityPill,
              { backgroundColor: talent.available ? colors.greenSoft : colors.fill },
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                { backgroundColor: talent.available ? colors.green : colors.tertiaryLabel },
              ]}
            />
            <Text
              style={[
                styles.availabilityText,
                { color: talent.available ? colors.green : colors.secondaryLabel },
              ]}
            >
              {talent.available ? 'Available for bookings' : 'Currently booked'}
            </Text>
          </View>
        </Animated.View>

        {/* Stats card */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.statsCard}>
          <View style={styles.statColumn}>
            <View style={styles.statValueRow}>
              <Ionicons name="star" size={16} color={colors.orange} />
              <Text style={styles.statValue}>{talent.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.statLabel}>{talent.reviewsCount} reviews</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{formatCount(talent.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statColumn}>
            <Text style={styles.statValue}>{formatRate(talent.hourlyRate)}</Text>
            <Text style={styles.statLabel}>Rate</Text>
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.section}>
          <SectionHeader title="About" />
          <View style={styles.card}>
            <Text style={styles.bio}>{talent.bio}</Text>
          </View>
        </Animated.View>

        {/* Skills */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.section}>
          <SectionHeader title="Skills" />
          <View style={styles.chipWrap}>
            {talent.skills.map((skill) => (
              <Chip key={skill} label={skill} />
            ))}
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.section}>
          <SectionHeader title="Details" />
          <View style={[styles.card, styles.detailsGrid]}>
            <DetailCell label="AGE" value={`${talent.age}`} />
            <DetailCell label="HEIGHT" value={formatHeight(talent.heightCm)} />
            <DetailCell label="LANGUAGES" value={talent.languages.join(', ')} />
            <DetailCell label="LOCATION" value={talent.location} />
          </View>
        </Animated.View>

        {/* Credits */}
        {talent.credits.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
            <SectionHeader title="Credits" />
            <View style={styles.card}>
              {talent.credits.map((credit, index) => (
                <View
                  key={credit.id}
                  style={[styles.creditRow, index > 0 && styles.creditRowBorder]}
                >
                  <View style={styles.creditInfo}>
                    <Text style={type.subheadBold} numberOfLines={1}>
                      {credit.title}
                    </Text>
                    <Text style={styles.creditMeta} numberOfLines={1}>
                      {credit.production} · {credit.year}
                    </Text>
                  </View>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{credit.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Portfolio */}
        <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.section}>
          <SectionHeader title="Portfolio" />
          <View style={styles.portfolioGrid}>
            {portfolioGradients.map((gradient, i) => (
              <GradientPhoto
                key={PORTFOLIO_ICONS[i]}
                gradient={gradient}
                uri={talent.portfolio[i]}
                icon={PORTFOLIO_ICONS[i]}
                iconSize={36}
                borderRadius={radius.l}
                style={[styles.portfolioTile, { width: tileSize, height: tileSize }]}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating hero buttons */}
      <FloatingCircleButton
        icon="chevron-back"
        onPress={() => navigation.goBack()}
        style={{ position: 'absolute', top: floatingTop, left: spacing.l }}
      />
      <HeartButton
        active={isFavorite}
        onPress={onToggleFavorite}
        frosted
        size={24}
        style={{ position: 'absolute', top: floatingTop, right: spacing.l }}
      />

      {/* Sticky bottom CTA */}
      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.m) }]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="extraLight" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass }]} />
        )}
        <View style={styles.ctaRow}>
          <PressableScale style={styles.messageButton} onPress={onMessage}>
            <Ionicons name="chatbubble" size={18} color="#FFFFFF" />
            <Text style={styles.messageLabel}>Message</Text>
          </PressableScale>
          <PressableScale
            style={styles.favSquare}
            hapticOnPress={false}
            onPress={() => {
              haptic.medium();
              onToggleFavorite();
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.pink : colors.label}
            />
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

function FloatingCircleButton({
  icon,
  onPress,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: object;
}) {
  return (
    <PressableScale
      hapticOnPress={false}
      onPress={() => {
        haptic.light();
        onPress();
      }}
      hitSlop={8}
      style={[styles.floatingCircle, style]}
    >
      <Ionicons name={icon} size={22} color="#FFFFFF" />
    </PressableScale>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailCell}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProfileSkeleton({ heroHeight }: { heroHeight: number }) {
  return (
    <View>
      <Skeleton width="100%" height={heroHeight} borderRadius={0} />
      <View style={styles.avatarWrap}>
        <Skeleton width={AVATAR_SIZE + 8} height={AVATAR_SIZE + 8} borderRadius={(AVATAR_SIZE + 8) / 2} />
      </View>
      <View style={styles.skeletonIdentity}>
        <Skeleton width={180} height={26} />
        <Skeleton width={130} height={15} />
        <Skeleton width={170} height={28} borderRadius={radius.pill} />
      </View>
      <View style={[styles.statsCard, styles.skeletonStats]}>
        <Skeleton width={64} height={38} />
        <Skeleton width={64} height={38} />
        <Skeleton width={64} height={38} />
      </View>
      <View style={styles.skeletonSection}>
        <Skeleton width={120} height={22} />
        <Skeleton width="100%" height={90} borderRadius={radius.xl} />
      </View>
      <View style={styles.skeletonSection}>
        <Skeleton width={100} height={22} />
        <View style={styles.skeletonChips}>
          <Skeleton width={84} height={34} borderRadius={radius.pill} />
          <Skeleton width={104} height={34} borderRadius={radius.pill} />
          <Skeleton width={72} height={34} borderRadius={radius.pill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: -(AVATAR_SIZE / 2),
  },
  avatarRing: {
    padding: 4,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: colors.bg,
  },
  identity: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.m,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  roleLine: {
    ...type.subhead,
    marginTop: spacing.xs,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s - 2,
    marginTop: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s - 1,
    borderRadius: radius.pill,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.l,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    ...shadows.card,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...type.title3,
    fontWeight: '700',
  },
  statLabel: {
    ...type.caption,
  },
  statSeparator: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.hairline,
  },
  section: {
    marginTop: spacing.xxl,
  },
  card: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    padding: spacing.l,
    ...shadows.card,
  },
  bio: {
    ...type.callout,
    lineHeight: 23,
    color: colors.label,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    paddingHorizontal: spacing.xl,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.l,
  },
  detailCell: {
    width: '50%',
    gap: 3,
    paddingRight: spacing.m,
  },
  detailLabel: {
    ...type.caption2,
  },
  detailValue: {
    ...type.subheadBold,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  creditRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  creditInfo: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.m,
  },
  creditMeta: {
    ...type.footnote,
  },
  rolePill: {
    backgroundColor: colors.tintSoft,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.tint,
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
  },
  portfolioTile: {
    borderCurve: 'continuous',
  },
  skeletonIdentity: {
    alignItems: 'center',
    gap: spacing.m,
    marginTop: spacing.l,
  },
  skeletonStats: {
    justifyContent: 'space-around',
    paddingHorizontal: spacing.l,
  },
  skeletonSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
  },
  skeletonChips: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  floatingCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.m,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    overflow: 'hidden',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    height: 52,
    backgroundColor: colors.label,
    borderRadius: radius.pill,
  },
  messageLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  favSquare: {
    width: 52,
    height: 52,
    borderRadius: radius.m,
    borderCurve: 'continuous',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    ...shadows.soft,
  },
});
