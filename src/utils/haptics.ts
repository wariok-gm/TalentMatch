import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const canHaptic = Platform.OS === 'ios' || Platform.OS === 'android';

/** Fire-and-forget haptics; silently no-op on web. */
export const haptic = {
  light() {
    if (canHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium() {
    if (canHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  selection() {
    if (canHaptic) Haptics.selectionAsync().catch(() => {});
  },
  success() {
    if (canHaptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  error() {
    if (canHaptic) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
};
