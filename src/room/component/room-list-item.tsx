import { Pressable, Text, View } from "react-native";

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
            accessibilityLabel={`${name}, ${numOfTask} tasks, ${numOfItems} items, ${numOfLowItems} low items`}
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
                {numOfTask} tasks · {numOfItems} items
            </Text>
            <Text className="mt-1 text-sm leading-5 text-clay">
                {numOfLowItems} low items
            </Text>
        </Pressable>
    );
} 




