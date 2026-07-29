import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GradientPhoto, PressableScale, RatingStars, SectionHeader } from '../../components';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { Talent } from '../../types';
import { ROLE_ICONS } from './TalentCard';

interface Props {
  talents: Talent[];
  onPressTalent: (talentId: string) => void;
}

/** Horizontal snap carousel of featured talents — wide gradient cards. */
export function FeaturedCarousel({ talents, onPressTalent }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = width - spacing.xl * 2 - 36;

  if (talents.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.container}>
      <SectionHeader title="Featured" />
      <FlatList
        horizontal
        data={talents}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + spacing.m}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.rail}
        renderItem={({ item }) => (
          <PressableScale
            scaleTo={0.97}
            onPress={() => onPressTalent(item.id)}
            style={[styles.card, { width: cardWidth }]}
          >
            <GradientPhoto
              gradient={item.gradient}
              borderRadius={radius.xl}
              icon={ROLE_ICONS[item.role]}
              iconSize={56}
              style={styles.photo}
            >
              <View style={styles.featuredPill}>
                <Ionicons name="sparkles" size={11} color="#FFFFFF" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
              <View style={styles.glassBar}>
                <View style={styles.glassText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.verified && (
                      <Ionicons name="checkmark-circle" size={15} color={colors.blue} />
                    )}
                  </View>
                  <Text style={type.caption} numberOfLines={1}>
                    {item.role}
                  </Text>
                </View>
                <RatingStars rating={item.rating} />
              </View>
            </GradientPhoto>
          </PressableScale>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
  },
  rail: {
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
    paddingBottom: spacing.s,
  },
  card: {
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    ...shadows.card,
  },
  photo: {
    height: 176,
    borderCurve: 'continuous',
  },
  featuredPill: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.s + 2,
    paddingVertical: 4,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  glassBar: {
    position: 'absolute',
    left: spacing.s,
    right: spacing.s,
    bottom: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    backgroundColor: colors.glass,
    borderRadius: radius.m,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s + 2,
  },
  glassText: {
    flex: 1,
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...type.subheadBold,
    flexShrink: 1,
  },
});
