import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { RoomInventoryListItem } from '@/room/component/room-inventory-list-item';

export type RoomItem = {
    id: string;
    name: string;
    quantity: number;
    low: boolean;
    inShoppingList: boolean;
};

type RoomItemsTabProps = {
    items: RoomItem[];
    onItemsChange: (items: RoomItem[]) => void;
    onQuantityChange: (itemId: string, change: number) => void;
};

export function RoomItemsTab({ items, onItemsChange, onQuantityChange }: RoomItemsTabProps) {
    const [isSelectingItems, setIsSelectingItems] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const lowItems = useMemo(() => items.filter((item) => item.low), [items]);
    const regularItems = useMemo(() => items.filter((item) => !item.low), [items]);

    const toggleShoppingList = (itemId: string) => {
        onItemsChange(items.map((item) => item.id === itemId
            ? { ...item, inShoppingList: !item.inShoppingList }
            : item));
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds((currentIds) => currentIds.includes(itemId)
            ? currentIds.filter((id) => id !== itemId)
            : [...currentIds, itemId]);
    };

    const addSelectedItemsToShoppingList = () => {
        onItemsChange(items.map((item) => selectedItemIds.includes(item.id)
            ? { ...item, inShoppingList: true }
            : item));
        setSelectedItemIds([]);
        setIsSelectingItems(false);
    };

    const addItem = () => {
        const name = newItemName.trim();
        if (!name) {
            return;
        }

        onItemsChange([...items, {
            id: `${Date.now()}`,
            name,
            quantity: 1,
            low: false,
            inShoppingList: false,
        }]);
        setNewItemName('');
        setIsAddingItem(false);
    };

    return (
        <View className="mt-6 gap-6">
            <View className="gap-3">
                <View className="flex-row items-center justify-between">
                    <Text className="font-serif-semibold text-[24px] text-ink">Running low</Text>
                    <Pressable
                        accessibilityRole="button"
                        className={`rounded-button px-3 py-2 ${isSelectingItems ? 'bg-forest' : 'bg-sage-tint'}`}
                        onPress={() => {
                            setIsSelectingItems((current) => !current);
                            setSelectedItemIds([]);
                        }}
                    >
                        <Text className={`font-sans-semibold text-[13px] ${isSelectingItems ? 'text-white' : 'text-forest'}`}>
                            {isSelectingItems ? 'Cancel' : 'Add to list'}
                        </Text>
                    </Pressable>
                </View>
                <View className="gap-3 rounded-card bg-clay-tint p-3">
                    {lowItems.map((item) => (
                        <RoomInventoryListItem
                            {...item}
                            isSelected={selectedItemIds.includes(item.id)}
                            isSelecting={isSelectingItems}
                            key={item.id}
                            onDecrease={() => onQuantityChange(item.id, -1)}
                            onIncrease={() => onQuantityChange(item.id, 1)}
                            onToggleSelection={() => toggleItemSelection(item.id)}
                            onToggleShoppingList={() => toggleShoppingList(item.id)}
                        />
                    ))}
                </View>
                {isSelectingItems && (
                    <Pressable
                        accessibilityRole="button"
                        className="items-center rounded-button bg-forest px-4 py-3 disabled:opacity-50"
                        disabled={selectedItemIds.length === 0}
                        onPress={addSelectedItemsToShoppingList}
                    >
                        <Text className="font-sans-semibold text-[15px] text-white">
                            Add {selectedItemIds.length || ''} selected to list
                        </Text>
                    </Pressable>
                )}
            </View>
            <View className="gap-3">
                <View className="flex-row items-center justify-between">
                    <Text className="font-serif-semibold text-[24px] text-ink">Everything else</Text>
                    <Pressable
                        accessibilityRole="button"
                        className="rounded-button bg-sage-tint px-3 py-2"
                        onPress={() => setIsAddingItem((current) => !current)}
                    >
                        <Text className="font-sans-semibold text-[13px] text-forest">+ Add item</Text>
                    </Pressable>
                </View>
                {isAddingItem && (
                    <View className="flex-row gap-2">
                        <TextInput
                            accessibilityLabel="New inventory item"
                            autoFocus
                            className="h-11 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                            onChangeText={setNewItemName}
                            onSubmitEditing={addItem}
                            placeholder="Item name"
                            returnKeyType="done"
                            value={newItemName}
                        />
                        <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={addItem}>
                            <Text className="font-sans-semibold text-[14px] text-white">Add</Text>
                        </Pressable>
                    </View>
                )}
                {regularItems.map((item) => (
                    <RoomInventoryListItem
                        {...item}
                        key={item.id}
                        onDecrease={() => onQuantityChange(item.id, -1)}
                        onIncrease={() => onQuantityChange(item.id, 1)}
                        onToggleShoppingList={() => toggleShoppingList(item.id)}
                    />
                ))}
            </View>
        </View>
    );
}
