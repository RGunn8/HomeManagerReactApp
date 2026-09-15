import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, Text, View } from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View className="absolute bottom-4 left-4 right-4 flex-row justify-center">
          <View className="flex-row rounded-full border border-hairline bg-card p-1 shadow-sm dark:border-cream/20 dark:bg-forest-deep">
            <TabTrigger name="tab-one" href="/" asChild>
              <TabButton>Tab 1</TabButton>
            </TabTrigger>
            <TabTrigger name="tab-two" href="/settings" asChild>
              <TabButton>Tab 2</TabButton>
            </TabTrigger>
          </View>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable
      {...props}
      className={`rounded-full px-5 py-3 ${isFocused ? 'bg-forest dark:bg-clay' : 'bg-transparent'}`}>
      <Text className={`font-sans-semibold ${isFocused ? 'text-card' : 'text-ink-muted dark:text-cream/70'}`}>
        {children}
      </Text>
    </Pressable>
  );
}
