import { Text, View } from 'react-native';

import { HomeManagerIcon } from '@/components/icons';

export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center bg-canvas px-screen dark:bg-forest-deep">
      <View className="rounded-card border border-hairline bg-card p-5 dark:border-cream/20 dark:bg-cream/10">
        <HomeManagerIcon variant="tile" color="#2c4a3a" />
        <Text className="mt-5 font-serif-semibold text-[30px] leading-[34px] text-ink dark:text-cream">
          Tab 1
        </Text>
        <Text className="mt-3 font-sans text-[15px] leading-[23px] text-ink-muted dark:text-cream/70">
          You are signed in. This is the first tab and the default authenticated route.
        </Text>
      </View>
    </View>
  );
}
