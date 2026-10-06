import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemAutocompleteField } from '@/components/item-autocomplete-field';
import { TopBarButton } from '@/components/top-bar-button';
import { INVENTORY_CATEGORIES } from '@/constants/inventory-categories';
import { useCreateInventoryItems, useInventory, useUpdateInventoryItem } from '@/inventory/hooks/use-inventory';

export function InventoryAddScreen() {
    const createItems = useCreateInventoryItems();
    const updateItem = useUpdateInventoryItem();
    const { data: inventoryItems = [] } = useInventory();
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('1');
    const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null);
    const [category, setCategory] = useState<string>(INVENTORY_CATEGORIES[0]);
    const canSave = itemName.trim().length > 0;

    const saveItem = () => {
        const name = itemName.trim();
        const quantity = Number(itemQuantity);
        if (!name || !Number.isInteger(quantity) || quantity < 1) return;
        const existingItem = inventoryItems.find((item) => item.id === selectedInventoryItemId)
            ?? inventoryItems.find((item) => item.name.trim().toLowerCase() === name.toLowerCase());
        if (existingItem) {
            updateItem.mutate({ itemId: existingItem.id, updates: { quantity: existingItem.quantity + quantity } });
        } else {
            createItems.mutate([{ name, quantity, category }]);
        }
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView className="flex-1" contentContainerClassName="gap-6 px-screen pb-12" keyboardShouldPersistTaps="handled">
                    <View className="h-14 flex-row items-center justify-between">
                        <TopBarButton label="Cancel" onPress={() => router.back()} />
                        <Text className="font-sans text-[16px] text-ink">New item</Text>
                        <TopBarButton disabled={!canSave} label="Save" onPress={saveItem} />
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Item name</Text>
                        <ItemAutocompleteField
                            accessibilityLabel="Item name"
                            autoFocus
                            inputClassName="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                            onChangeText={(value) => {
                                setItemName(value);
                                setSelectedInventoryItemId(null);
                            }}
                            onSelectSuggestion={(suggestion) => {
                                setItemName(suggestion.name);
                                setSelectedInventoryItemId(suggestion.id);
                            }}
                            placeholder="Search or add an item"
                            suggestions={inventoryItems}
                            value={itemName}
                        />
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Quantity</Text>
                        <View className="flex-row items-center gap-3">
                            <Pressable accessibilityLabel="Decrease quantity" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => setItemQuantity((current) => String(Math.max(1, Number(current) - 1)))}>
                                <Text className="text-[22px] text-forest">−</Text>
                            </Pressable>
                            <TextInput
                                accessibilityLabel="Item quantity"
                                className="h-11 w-20 rounded-input border border-hairline bg-white text-center font-sans-semibold text-[16px] text-ink"
                                keyboardType="number-pad"
                                onChangeText={(value) => /^\d*$/.test(value) && setItemQuantity(value)}
                                value={itemQuantity}
                            />
                            <Pressable accessibilityLabel="Increase quantity" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => setItemQuantity((current) => String(Math.max(1, Number(current) + 1)))}>
                                <Text className="text-[22px] text-forest">+</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Text className="font-sans text-[13px] text-ink-muted">You can add a room, price, stores, and link after saving.</Text>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Category</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {INVENTORY_CATEGORIES.map((categoryOption) => (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: category === categoryOption }}
                                    className={`rounded-full border px-4 py-2 ${category === categoryOption ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                    key={categoryOption}
                                    onPress={() => setCategory(categoryOption)}
                                >
                                    <Text className={`font-sans-semibold text-[14px] ${category === categoryOption ? 'text-white' : 'text-ink-muted'}`}>{categoryOption}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
