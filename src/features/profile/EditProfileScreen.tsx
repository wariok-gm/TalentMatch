import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Avatar, PressableScale } from '../../components';
import { RootScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfile } from '../../store/slices/profileSlice';
import { colors, radius, shadows, spacing, type } from '../../theme';
import { haptic } from '../../utils/haptics';

function initialsFrom(name: string, fallback: string): string {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return initials || fallback;
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
}

function Field({ label, value, onChangeText, placeholder, multiline = false }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.tertiaryLabel}
        multiline={multiline}
      />
    </View>
  );
}

export function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile.profile);

  const [name, setName] = useState(profile.name);
  const [headline, setHeadline] = useState(profile.headline);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);

  const previewInitials = useMemo(
    () => initialsFrom(name, profile.initials),
    [name, profile.initials],
  );

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    dispatch(
      updateProfile({
        name: name.trim(),
        headline: headline.trim(),
        location: location.trim(),
        bio: bio.trim(),
      }),
    );
    haptic.success();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown} style={styles.avatarWrap}>
          <Avatar initials={previewInitials} gradient={profile.gradient} size={84} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(40)} style={styles.formCard}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <View style={styles.hairline} />
          <Field
            label="Headline"
            value={headline}
            onChangeText={setHeadline}
            placeholder="e.g. Actor · Voice Artist"
          />
          <View style={styles.hairline} />
          <Field
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
          />
          <View style={styles.hairline} />
          <Field
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="A few lines about you"
            multiline
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80)}>
          <PressableScale
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            disabled={!canSave}
            onPress={handleSave}
          >
            <Text style={styles.saveLabel}>Save</Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  field: {
    paddingVertical: spacing.m,
    gap: 4,
  },
  fieldLabel: {
    ...type.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    ...type.body,
    paddingVertical: 2,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  saveButton: {
    backgroundColor: colors.label,
    borderRadius: radius.pill,
    paddingVertical: spacing.l - 2,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.35,
  },
  saveLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
