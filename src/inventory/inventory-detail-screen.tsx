import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBarButton } from '@/components/top-bar-button';
import { INVENTORY_CATEGORIES } from '@/constants/inventory-categories';
import { useDeleteInventoryItem, useInventory, useUpdateInventoryItem, type InventoryItemUpdates } from '@/inventory/hooks/use-inventory';
import { INVENTORY_LEVELS, isInventoryItemLow } from '@/inventory/inventory-model';
import { sameId, useResolvedId } from '@/lib/offline/temp-ids';

export function InventoryDetailScreen() {
    const { itemId: itemIdParam } = useLocalSearchParams<{ itemId?: string }>();
    const itemId = useResolvedId(itemIdParam);
    const { data: items, isLoading } = useInventory();
    const item = items?.find((inventoryItem) => sameId(inventoryItem.id, itemId));
    const updateItemMutation = useUpdateInventoryItem();
    const deleteItemMutation = useDeleteInventoryItem();
    const [noteText, setNoteText] = useState('');
    const [isAddingStore, setIsAddingStore] = useState(false);
    const [storeName, setStoreName] = useState('');
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [priceInput, setPriceInput] = useState('');
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [linkInput, setLinkInput] = useState('');

    if (!item) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-canvas-tint px-screen" edges={['top']}>
                <Text className="font-sans text-[16px] text-ink-muted">{isLoading ? 'Loading…' : 'Inventory item not found.'}</Text>
                <TopBarButton label="Back" onPress={() => router.back()} />
            </SafeAreaView>
        );
    }

    const updateItem = (id: string, updates: InventoryItemUpdates) => updateItemMutation.mutate({ itemId: id, updates });
    const addStore = (id: string, store: string) => {
        if (!item.stores.includes(store)) updateItem(id, { stores: [...item.stores, store] });
    };
    const removeStore = (id: string, store: string) => updateItem(id, { stores: item.stores.filter((existing) => existing !== store) });

    const submitNote = () => {
        const text = noteText.trim();
        if (!text) return;
        updateItem(item.id, { notes: [text, ...item.notes.map((note) => note.text)] });
        setNoteText('');
    };

    const updateNumber = (field: 'quantity' | 'belowPar', value: string) => {
        if (!/^\d*$/.test(value)) return;
        updateItem(item.id, { [field]: value === '' ? 0 : Number(value) });
    };

    const saveStore = () => {
        const value = storeName.trim();
        if (!value) return;
        addStore(item.id, value);
        setStoreName('');
        setIsAddingStore(false);
    };

    const savePrice = () => {
        const price = Number(priceInput);
        if (!Number.isFinite(price) || price < 0) return;
        updateItem(item.id, { price });
        setIsEditingPrice(false);
    };

    const saveLink = () => {
        const value = linkInput.trim();
        if (!value) return;
        const normalizedLink = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        updateItem(item.id, { link: normalizedLink });
        setIsEditingLink(false);
    };

    const startEditingDetails = () => {
        setNameInput(item.name);
        setCategoryInput(item.category);
        setIsEditingDetails(true);
    };

    const saveDetails = () => {
        const name = nameInput.trim();
        if (!name || !categoryInput) return;
        updateItem(item.id, { name, category: categoryInput });
        setIsEditingDetails(false);
    };

    const confirmDeleteItem = () => {
        Alert.alert(
            `Delete ${item.name}?`,
            'This permanently removes the item from your inventory.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteItemMutation.mutate(item.id);
                        router.back();
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView className="flex-1" contentContainerClassName="gap-6 px-screen pb-28 pt-2" keyboardShouldPersistTaps="handled">
                    <View className="h-12 flex-row items-center justify-between">
                        <TopBarButton label="Back" onPress={() => router.back()} />
                        <View className="flex-row items-center gap-4">
                            {isEditingDetails ? (
                                <>
                                    <TopBarButton label="Cancel" onPress={() => setIsEditingDetails(false)} />
                                    <TopBarButton disabled={!nameInput.trim() || !categoryInput} label="Save" onPress={saveDetails} />
                                </>
                            ) : (
                                <>
                                    <TopBarButton label="Edit" onPress={startEditingDetails} />
                                    <Pressable accessibilityRole="button" onPress={confirmDeleteItem}>
                                        <Text className="font-sans-semibold text-[14px] text-overdue">Delete</Text>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    </View>

                    <View className="gap-2">
                        {isEditingDetails ? (
                            <View className="gap-3">
                                <TextInput
                                    accessibilityLabel="Inventory item name"
                                    autoFocus
                                    className="h-[50px] rounded-input border border-hairline bg-white px-4 font-serif-semibold text-[24px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setNameInput}
                                    placeholder="Item name"
                                    value={nameInput}
                                />
                                <View className="gap-2">
                                    <Text className="font-sans-semibold text-[14px] text-ink">Category</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {INVENTORY_CATEGORIES.map((category) => (
                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityState={{ selected: categoryInput === category }}
                                                className={`rounded-full border px-3 py-2 ${categoryInput === category ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                                key={category}
                                                onPress={() => setCategoryInput(category)}
                                            >
                                                <Text className={`font-sans-semibold text-[13px] ${categoryInput === category ? 'text-white' : 'text-ink-muted'}`}>
                                                    {category}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <>
                                <Text className="font-serif-semibold text-[32px] text-ink">{item.name}</Text>
                                <View className="self-start rounded-full bg-sage-tint px-3 py-1">
                                    <Text className="font-sans-semibold text-[13px] text-forest">{item.category}</Text>
                                </View>
                            </>
                        )}
                        <Text className="font-sans text-[15px] text-ink-muted">{item.room}</Text>
                        <View className="flex-row items-center gap-2">
                            {item.price !== undefined ? <Text className="font-sans-semibold text-[15px] text-ink-muted">${item.price.toFixed(2)} per item</Text> : null}
                            <Pressable accessibilityRole="button" onPress={() => {
                                setPriceInput(item.price !== undefined ? String(item.price) : '');
                                setIsEditingPrice((current) => !current);
                            }}>
                                <Text className="font-sans-semibold text-[14px] text-forest">{item.price !== undefined ? 'Update price' : '+ Add price'}</Text>
                            </Pressable>
                        </View>
                        {isEditingPrice && (
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="Item price"
                                    autoFocus
                                    className="h-11 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    keyboardType="decimal-pad"
                                    onChangeText={setPriceInput}
                                    onSubmitEditing={savePrice}
                                    placeholder="0.00"
                                    returnKeyType="done"
                                    value={priceInput}
                                />
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button border border-hairline bg-white px-4" onPress={() => setIsEditingPrice(false)}>
                                    <Text className="font-sans-semibold text-[14px] text-ink-muted">Cancel</Text>
                                </Pressable>
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={savePrice}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Save</Text>
                                </Pressable>
                            </View>
                        )}
                        <View className="flex-row flex-wrap items-center gap-2">
                            {item.stores.map((storeItem) => (
                                <View className="flex-row items-center gap-1.5 rounded-full bg-sage-tint px-3.5 py-1.5" key={storeItem}>
                                    <Text className="font-sans-semibold text-[15px] text-forest">{storeItem}</Text>
                                    <Pressable accessibilityLabel={`Remove ${storeItem}`} accessibilityRole="button" onPress={() => removeStore(item.id, storeItem)}>
                                        <Text className="font-sans-semibold text-[15px] text-forest">×</Text>
                                    </Pressable>
                                </View>
                            ))}
                            <Pressable accessibilityRole="button" onPress={() => {
                                setStoreName('');
                                setIsAddingStore((current) => !current);
                            }}>
                                <Text className="font-sans-semibold text-[14px] text-forest">+ Add store</Text>
                            </Pressable>
                        </View>
                        {isAddingStore && (
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="Store name"
                                    autoFocus
                                    className="h-11 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setStoreName}
                                    onSubmitEditing={saveStore}
                                    placeholder="Store name"
                                    returnKeyType="done"
                                    value={storeName}
                                />
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button border border-hairline bg-white px-4" onPress={() => setIsAddingStore(false)}>
                                    <Text className="font-sans-semibold text-[14px] text-ink-muted">Cancel</Text>
                                </Pressable>
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={saveStore}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Save</Text>
                                </Pressable>
                            </View>
                        )}
                        {isInventoryItemLow(item) ? (
                            <View className="self-start rounded-full bg-clay-tint px-3 py-1">
                                <Text className="font-sans-semibold text-[13px] text-clay">Running low</Text>
                            </View>
                        ) : null}
                    </View>

                    <View className="gap-4 rounded-card border border-hairline bg-white p-4">
                        <Text className="font-serif-semibold text-[21px] text-ink">Stock levels</Text>
                        <View className="flex-row rounded-button bg-sage-tint p-1">
                            {(['count', 'level'] as const).map((mode) => (
                                <Pressable
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: item.trackingMode === mode }}
                                    className={`flex-1 items-center rounded-button px-2 py-2 ${item.trackingMode === mode ? 'bg-forest' : 'bg-transparent'}`}
                                    key={mode}
                                    onPress={() => updateItem(item.id, { trackingMode: mode })}
                                >
                                    <Text className={`font-sans-semibold text-[14px] ${item.trackingMode === mode ? 'text-white' : 'text-ink-muted'}`}>
                                        {mode === 'count' ? 'Count' : 'Level'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        {item.trackingMode === 'level' && (
                            <View className="gap-2">
                                <Text className="font-sans-semibold text-[14px] text-ink">Current level</Text>
                                <View className="flex-row gap-2">
                                    {INVENTORY_LEVELS.map((level) => (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: item.level === level.id }}
                                            className={`flex-1 items-center rounded-full border px-2 py-2 ${item.level === level.id ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                            key={level.id}
                                            onPress={() => updateItem(item.id, { level: level.id })}
                                        >
                                            <Text className={`font-sans-semibold text-[13px] ${item.level === level.id ? 'text-white' : 'text-ink-muted'}`}>{level.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                        <View className="gap-2">
                            <Text className="font-sans-semibold text-[14px] text-ink">{item.trackingMode === 'level' ? 'Spares (unopened)' : 'Quantity'}</Text>
                            <View className="flex-row items-center gap-3">
                                <Pressable accessibilityLabel="Decrease quantity" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}>
                                    <Text className="text-[22px] text-forest">−</Text>
                                </Pressable>
                                <TextInput
                                    accessibilityLabel="Inventory quantity"
                                    className="h-11 w-20 rounded-input border border-hairline bg-white text-center font-sans-semibold text-[16px] text-ink"
                                    keyboardType="number-pad"
                                    onChangeText={(value) => updateNumber('quantity', value)}
                                    value={String(item.quantity)}
                                />
                                <Pressable accessibilityLabel="Increase quantity" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => updateItem(item.id, { quantity: item.quantity + 1 })}>
                                    <Text className="text-[22px] text-forest">+</Text>
                                </Pressable>
                            </View>
                        </View>
                        {item.trackingMode === 'count' && (
                        <View className="gap-2">
                            <Text className="font-sans-semibold text-[14px] text-ink">Below par threshold</Text>
                            <View className="flex-row items-center gap-3">
                                <Pressable accessibilityLabel="Decrease below par threshold" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => updateItem(item.id, { belowPar: Math.max(0, item.belowPar - 1) })}>
                                    <Text className="text-[22px] text-forest">−</Text>
                                </Pressable>
                                <TextInput
                                    accessibilityLabel="Below par threshold"
                                    className="h-11 w-20 rounded-input border border-hairline bg-white text-center font-sans-semibold text-[16px] text-ink"
                                    keyboardType="number-pad"
                                    onChangeText={(value) => updateNumber('belowPar', value)}
                                    value={String(item.belowPar)}
                                />
                                <Pressable accessibilityLabel="Increase below par threshold" className="h-11 w-11 items-center justify-center rounded-button bg-sage-tint" onPress={() => updateItem(item.id, { belowPar: item.belowPar + 1 })}>
                                    <Text className="text-[22px] text-forest">+</Text>
                                </Pressable>
                            </View>
                        </View>
                        )}
                    </View>

                    <View className="gap-3 rounded-card border border-hairline bg-white p-4">
                        <Text className="font-serif-semibold text-[21px] text-ink">Link</Text>
                        <View className="flex-row items-center gap-2">
                            {item.link ? (
                                <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(item.link!)}>
                                    <Text className="font-sans-semibold text-[16px] text-forest underline" numberOfLines={1}>{item.link}</Text>
                                </Pressable>
                            ) : null}
                            <Pressable accessibilityRole="button" onPress={() => {
                                setLinkInput(item.link ?? '');
                                setIsEditingLink((current) => !current);
                            }}>
                                <Text className="font-sans-semibold text-[14px] text-forest">{item.link ? 'Change link' : '+ Add link'}</Text>
                            </Pressable>
                        </View>
                        {isEditingLink && (
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="Product link"
                                    autoCapitalize="none"
                                    autoFocus
                                    className="h-11 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    keyboardType="url"
                                    onChangeText={setLinkInput}
                                    onSubmitEditing={saveLink}
                                    placeholder="https://example.com/product"
                                    returnKeyType="done"
                                    value={linkInput}
                                />
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button border border-hairline bg-white px-4" onPress={() => setIsEditingLink(false)}>
                                    <Text className="font-sans-semibold text-[14px] text-ink-muted">Cancel</Text>
                                </Pressable>
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={saveLink}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Save</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <View className="gap-3">
                        <Text className="font-serif-semibold text-[21px] text-ink">Notes</Text>
                        <View className="gap-2 rounded-card border border-hairline bg-white p-3">
                            <TextInput
                                accessibilityLabel="Add inventory note"
                                className="min-h-[88px] rounded-input border border-hairline bg-white px-3 py-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                maxLength={300}
                                multiline
                                onChangeText={setNoteText}
                                placeholder="Add a note about this item"
                                textAlignVertical="top"
                                value={noteText}
                            />
                            <View className="flex-row items-center justify-between">
                                <Text className="font-sans text-[12px] text-ink-muted">{noteText.length}/300</Text>
                                <Pressable accessibilityRole="button" className="rounded-button bg-forest px-4 py-2 disabled:opacity-50" disabled={!noteText.trim()} onPress={submitNote}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Add note</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View className="gap-3">
                            {item.notes.map((note) => (
                                <View className="rounded-card border border-hairline bg-white px-4 py-3" key={note.id}>
                                    <Text className="font-sans text-[15px] leading-6 text-ink">{note.text}</Text>
                                    {note.createdAt ? (
                                        <Text className="mt-2 font-sans text-[12px] text-ink-muted">{new Date(note.createdAt).toLocaleDateString()}</Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
