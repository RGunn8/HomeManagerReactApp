import { Pressable, Text, View } from 'react-native';

export function NewRoomListItem({ onPress }: { onPress?: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add new room"
            className="aspect-square w-full items-center justify-center rounded-card border-2 border-dashed border-ink-faint bg-transparent"
            onPress={onPress}
        >
            <View className="items-center justify-center">
                <Text className="font-sans text-[32px] leading-9 text-ink-faint">+</Text>
                <Text className="mt-1 font-sans-semibold text-[16px] text-ink-faint">New room</Text>
            </View>
        </Pressable>
    );
}
