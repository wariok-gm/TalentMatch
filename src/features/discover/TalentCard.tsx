import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar, GradientPhoto, HeartButton, PressableScale, RatingStars } from '../../components';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Talent, TalentRole } from '../../types';
import { formatRate } from '../../utils/format';

export const ROLE_ICONS: Record<TalentRole, keyof typeof Ionicons.glyphMap> = {
  Actor: 'videocam',
  Model: 'camera',
  Dancer: 'body',
  'Voice Artist': 'mic',
  Musician: 'musical-notes',
  Influencer: 'phone-portrait',
};

interface Props {
  talent: Talent;
  index: number;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function TalentCard({ talent, index, favorite, onPress, onToggleFavorite }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(18)}>
      <PressableScale scaleTo={0.97} onPress={onPress} style={styles.card}>
        <GradientPhoto
          gradient={talent.gradient}
          borderRadius={radius.xl}
          icon={ROLE_ICONS[talent.role]}
          iconSize={48}
          style={styles.cover}
        >
          {talent.available && (
            <View style={styles.availablePill}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          )}
          <HeartButton
            active={favorite}
            onPress={onToggleFavorite}
            frosted
            style={styles.heart}
          />
        </GradientPhoto>

        <View style={styles.infoRow}>
          <Avatar initials={talent.initials} gradient={talent.gradient} size={46} verified={talent.verified} />
          <View style={styles.infoText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {talent.name}
              </Text>
              {talent.verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.blue} />
              )}
            </View>
            <Text style={type.footnote} numberOfLines={1}>
              {talent.role} · {talent.location}
            </Text>
          </View>
          <Text style={styles.rate}>{formatRate(talent.hourlyRate)}</Text>
        </View>

        <View style={styles.metaRow}>
          <RatingStars rating={talent.rating} reviewsCount={talent.reviewsCount} />
          <View style={styles.skillsRow}>
            {talent.skills.slice(0, 3).map((skill) => (
              <View key={skill} style={styles.skillChip}>
                <Text style={styles.skillText} numberOfLines={1}>
                  {skill}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderCurve: 'continuous',
    padding: spacing.m,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.l,
    ...shadows.card,
  },
  cover: {
    aspectRatio: 4 / 3,
    borderCurve: 'continuous',
  },
  availablePill: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m - 2,
    paddingVertical: 5,
  },
  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heart: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginTop: spacing.m,
    paddingHorizontal: spacing.xs,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    ...type.headline,
    flexShrink: 1,
  },
  rate: {
    ...type.subheadBold,
    color: colors.tint,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    marginTop: spacing.m,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  skillsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    flexShrink: 1,
  },
  skillChip: {
    backgroundColor: colors.fill,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.s + 2,
    paddingVertical: 4,
    maxWidth: 92,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondaryLabel,
  },
});
