import { Pressable, Text, View } from "react-native";

const count = (value: number, noun: string) => `${value} ${value === 1 ? noun : `${noun}s`}`;

export function RoomListItem({
    icon,
    name,
    numOfTask,
    numOfItems,
    numOfLowItems,
    onPress,
}: {
    icon: string;
    name: string;
    numOfTask: number;
    numOfItems: number;
    numOfLowItems: number;
    onPress?: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={[name, count(numOfTask, 'task'), count(numOfItems, 'item'), numOfLowItems > 0 ? count(numOfLowItems, 'low item') : null]
                .filter(Boolean)
                .join(', ')}
            className="aspect-square w-full items-start justify-start rounded-card border border-hairline bg-white p-4 shadow-sm"
            onPress={onPress}
        >
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-icon-tile bg-sage-tint">
                <Text className="text-2xl">{icon}</Text>
            </View>
            <Text className="font-serif-semibold text-xl leading-6 text-ink" numberOfLines={2}>
                {name}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-ink-muted">
                {count(numOfTask, 'task')} · {count(numOfItems, 'item')}
            </Text>
            {numOfLowItems > 0 ? (
                <Text className="mt-1 text-sm leading-5 text-clay">
                    {count(numOfLowItems, 'low item')}
                </Text>
            ) : null}
        </Pressable>
    );
} 




