import { Pressable, Text, View } from 'react-native';

import { INVENTORY_LEVELS, isInventoryItemLow, type InventoryItem } from '@/inventory/inventory-model';

type InventoryListItemProps = {
    item: InventoryItem;
    onPress: (itemId: string) => void;
};

export function InventoryListItem({ item, onPress }: InventoryListItemProps) {
    const isLow = isInventoryItemLow(item);
    const isLevel = item.trackingMode === 'level';
    const levelLabel = INVENTORY_LEVELS.find((level) => level.id === item.level)?.label ?? 'Full';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLevel ? `${item.name}, ${levelLabel}, ${item.quantity} spare` : `${item.name}, ${item.quantity} in stock, below par ${item.belowPar}`}
            className="flex-row items-center gap-3 border-b border-row-divider bg-white px-4 py-3"
            onPress={() => onPress(item.id)}
        >
            <View className="min-w-0 flex-1 gap-1">
                <Text className="font-sans-semibold text-[16px] text-ink">{item.name}</Text>
                {item.price !== undefined ? (
                    <Text className="font-sans text-[13px] text-ink-muted">${item.price.toFixed(2)} per item</Text>
                ) : null}
                <Text className="font-sans text-[13px] text-ink-muted">{item.room} · {item.category}</Text>
                {item.stores.length > 0 ? (
                    <View className="mt-1 self-start rounded-full bg-sage-tint px-2.5 py-1">
                        <Text className="font-sans-semibold text-[11px] text-forest">
                            {item.stores[0]}{item.stores.length > 1 ? ` +${item.stores.length - 1}` : ''}
                        </Text>
                    </View>
                ) : null}
                <Text className="font-sans text-[12px] text-ink-faint">{isLevel ? `Level: ${levelLabel}` : `Below par ${item.belowPar}`}</Text>
            </View>
            <View className="items-center gap-1">
                <Text className={`font-sans-semibold text-[16px] ${isLow ? 'text-overdue' : 'text-ink'}`}>{item.quantity}</Text>
                {isLevel ? <Text className="font-sans text-[11px] text-ink-muted">spare</Text> : null}
                {isLow ? <Text className="font-sans-semibold text-[11px] text-overdue">Low</Text> : null}
            </View>
        </Pressable>
    );
}
