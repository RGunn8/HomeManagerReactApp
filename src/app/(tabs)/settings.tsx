import { Pressable, Text, View } from 'react-native';

import { selectionHaptic } from '@/lib/haptics';
import { useAppStore } from '@/store/use-app-store';

export default function SettingsScreen() {
  const signOut = useAppStore((state) => state.signOut);

  function handleSignOut() {
    void selectionHaptic();
    signOut();
  }

  return (
    <View className="flex-1 justify-center bg-canvas px-screen dark:bg-forest-deep">
      <View className="rounded-card border border-hairline bg-card p-5 dark:border-cream/20 dark:bg-cream/10">
        <Text className="font-serif-semibold text-[30px] leading-[34px] text-ink dark:text-cream">
          Tab 2
        </Text>
        <Text className="mt-3 font-sans text-[15px] leading-[23px] text-ink-muted dark:text-cream/70">
          Use this second tab for profile, settings, or account actions.
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-8 h-[54px] items-center justify-center rounded-button bg-overdue active:opacity-80 dark:bg-clay-light"
          onPress={handleSignOut}>
          <Text className="font-sans-semibold text-[16.5px] text-card dark:text-forest-deep">
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
