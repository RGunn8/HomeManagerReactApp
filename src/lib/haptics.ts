import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

async function runHaptic(effect: () => Promise<void>) {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await effect();
  } catch {
    // Haptics are enhancement-only; ignore unsupported-device failures.
  }
}

export function selectionHaptic() {
  return runHaptic(() => Haptics.selectionAsync());
}

export function successHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warningHaptic() {
  return runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
