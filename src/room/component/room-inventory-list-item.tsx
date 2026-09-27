import { Pressable, Text, View } from 'react-native';

type RoomInventoryListItemProps = {
    name: string;
    quantity: number;
    low?: boolean;
    inShoppingList?: boolean;
    isSelecting?: boolean;
    isSelected?: boolean;
    onDecrease: () => void;
    onIncrease: () => void;
    onToggleSelection?: () => void;
    onToggleShoppingList?: () => void;
};

export function RoomInventoryListItem({
    name,
    quantity,
    low = false,
    inShoppingList = false,
    isSelecting = false,
    isSelected = false,
    onDecrease,
    onIncrease,
    onToggleSelection,
    onToggleShoppingList,
}: RoomInventoryListItemProps) {
    return (
        <View className={`flex-row items-center justify-between rounded-lg px-3 py-3 ${low ? 'bg-white/70' : 'border border-hairline bg-white'}`}>
            {isSelecting && (
                <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    className={`mr-3 h-6 w-6 items-center justify-center rounded-checkbox border ${isSelected ? 'border-forest bg-forest' : 'border-forest bg-white'}`}
                    onPress={onToggleSelection}
                >
                    {isSelected && <Text className="text-white">✓</Text>}
                </Pressable>
            )}
            <View className="flex-1">
                <Text className="font-sans-semibold text-[16px] text-ink">{name}</Text>
                <Text className="mt-1 font-sans text-[14px] text-ink-muted">{quantity} tracked</Text>
            </View>
            <View className="items-end gap-2">
                <View className="flex-row items-center gap-2">
                    <Pressable accessibilityLabel={`Decrease ${name}`} className={`h-8 w-8 items-center justify-center rounded-button ${low ? 'bg-white' : 'bg-sage-tint'}`} onPress={onDecrease}>
                        <Text className="text-[18px] text-forest">−</Text>
                    </Pressable>
                    <Text className="min-w-[24px] text-center font-sans-semibold text-[14px] text-ink">{quantity}</Text>
                    <Pressable accessibilityLabel={`Increase ${name}`} className={`h-8 w-8 items-center justify-center rounded-button ${low ? 'bg-white' : 'bg-sage-tint'}`} onPress={onIncrease}>
                        <Text className="text-[18px] text-forest">+</Text>
                    </Pressable>
                </View>
                {!isSelecting && onToggleShoppingList && (
                    <Pressable
                        accessibilityRole="button"
                        className={`rounded-button px-3 py-2 ${inShoppingList ? 'bg-forest' : low ? 'bg-white' : 'bg-sage-tint'}`}
                        onPress={onToggleShoppingList}
                    >
                        <Text className={`font-sans-semibold text-[13px] ${inShoppingList ? 'text-white' : 'text-forest'}`}>
                            {inShoppingList ? 'Added' : 'Add to list'}
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
}
