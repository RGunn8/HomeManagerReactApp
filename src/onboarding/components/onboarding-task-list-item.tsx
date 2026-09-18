import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';

export function OnboardingTaskListItem({ taskName, onClick }: { taskName: string; onClick: () => void }) {
    const [isChecked, setIsChecked] = useState(false);

    return (
        <Pressable className="flex-row w-full items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3" onPress={onClick}>
            <Checkbox accessibilityLabel={`Mark ${taskName} complete`} checked={isChecked} onChange={setIsChecked} />
            <View className="flex-row -flex-1 gap-3 items-center">
                <Text className="font-sans-semibold text-[18px] text-ink">{taskName}</Text>
            </View>
            <Pressable className = 'flex-1 flex-row justify-end pr-4' onPress={onClick}>
                <Text className={`font-sans-semibold text-[24px] text-ink-faint`}>
                    ⌄
                    </Text>
            </Pressable>
        </Pressable>
    );
}