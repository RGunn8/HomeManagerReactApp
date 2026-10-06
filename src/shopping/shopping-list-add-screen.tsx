import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ItemAutocompleteField } from '@/components/item-autocomplete-field';
import { TopBarButton } from '@/components/top-bar-button';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { useCreateShoppingList } from '@/shopping/hooks/use-shopping';
import { getShoppingDealSummary, getShoppingItemTotal, type ShoppingListEntry } from '@/shopping/shopping-model';

type DraftEntry = ShoppingListEntry;

export function ShoppingListAddScreen() {
    const insets = useSafeAreaInsets();
    const { data: inventoryItems = [] } = useInventory();
    const createList = useCreateShoppingList();
    const [listTitle, setListTitle] = useState('');
    const [budgetText, setBudgetText] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('1');
    const [itemPrice, setItemPrice] = useState('');
    const [itemSalePrice, setItemSalePrice] = useState('');
    const [dealQuantity, setDealQuantity] = useState('');
    const [dealPrice, setDealPrice] = useState('');
    const [items, setItems] = useState<DraftEntry[]>([]);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const { voiceItems, audioUri: voiceAudioUri } = useLocalSearchParams<{ voiceItems?: string; audioUri?: string }>();

    useEffect(() => {
        if (!voiceItems) return;
        try {
            const parsed = JSON.parse(voiceItems) as { name: string; quantity: number }[];
            setItems((currentItems) => [
                ...currentItems,
                ...parsed.map((item) => ({ id: `${Date.now()}-${item.name}`, name: item.name, quantity: item.quantity })),
            ]);
        } catch {
            // ignore malformed voice payloads
        }
        if (voiceAudioUri) setAudioUri(voiceAudioUri);
        router.setParams({ voiceItems: undefined, audioUri: undefined });
    }, [voiceAudioUri, voiceItems]);

    const addItem = () => {
        const name = itemName.trim();
        const quantity = Number(itemQuantity);
        const price = itemPrice.trim() ? Number(itemPrice) : undefined;
        const salePrice = itemSalePrice.trim() ? Number(itemSalePrice) : undefined;
        const parsedDealQuantity = dealQuantity.trim() ? Number(dealQuantity) : undefined;
        const parsedDealPrice = dealPrice.trim() ? Number(dealPrice) : undefined;
        if (!name || !Number.isInteger(quantity) || quantity < 1
            || (price !== undefined && (!Number.isFinite(price) || price < 0))
            || (salePrice !== undefined && (!Number.isFinite(salePrice) || salePrice < 0))
            || ((parsedDealQuantity !== undefined || parsedDealPrice !== undefined)
                && (!Number.isInteger(parsedDealQuantity) || (parsedDealQuantity ?? 0) < 2
                    || parsedDealPrice === undefined || !Number.isFinite(parsedDealPrice) || parsedDealPrice < 0 || price === undefined))) {
            setErrorMessage('Enter an item name, a quantity of at least 1, and valid optional prices.');
            return;
        }

        setItems((currentItems) => [...currentItems, {
            id: `${Date.now()}`,
            name,
            quantity,
            ...(price !== undefined ? { price } : {}),
            ...(salePrice !== undefined ? { salePrice } : {}),
            ...(parsedDealQuantity !== undefined && parsedDealPrice !== undefined
                ? { dealQuantity: parsedDealQuantity, dealPrice: parsedDealPrice }
                : {}),
        }]);
        setItemName('');
        setItemQuantity('1');
        setItemPrice('');
        setItemSalePrice('');
        setDealQuantity('');
        setDealPrice('');
        setErrorMessage('');
    };

    const saveList = () => {
        const title = listTitle.trim();
        const budget = budgetText.trim() ? Number(budgetText) : 0;
        if (!title || !Number.isFinite(budget) || budget < 0) {
            setErrorMessage('Add a list name and enter a valid optional budget.');
            return;
        }
        // The recording (audioUri) is not uploaded: these items were already parsed on the phone, and
        // /capture/audio would transcribe the same speech into a second set of NEEDS_REVIEW items.
        createList.mutate({ title, budget, items });
        router.back();
    };

    const canSave = listTitle.trim().length > 0;

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={[]}>
            <StatusBar style="dark" />
            <View className="h-14 flex-row items-center justify-between px-screen" style={{ paddingTop: insets.top + 8 }}>
                <TopBarButton label="Cancel" onPress={() => router.back()} />
                <Text className="font-sans text-[16px] text-ink">New shopping list</Text>
                <TopBarButton disabled={!canSave} label="Save" onPress={saveList} />
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="gap-6 px-screen pt-3"
                    contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">List name</Text>
                        <TextInput
                            accessibilityLabel="Shopping list name"
                            autoFocus
                            className="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                            onChangeText={setListTitle}
                            placeholder="Shopping list name"
                            returnKeyType="next"
                            value={listTitle}
                        />
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Budget</Text>
                        <TextInput
                            accessibilityLabel="Shopping list budget"
                            className="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                            keyboardType="decimal-pad"
                            onChangeText={setBudgetText}
                            placeholder="Budget (optional)"
                            returnKeyType="done"
                            value={budgetText}
                        />
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        className="flex-row items-center gap-3 rounded-card border border-hairline bg-white p-4 active:opacity-75"
                        onPress={() => router.push('/shopping-voice-entry')}
                    >
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-clay">
                            <Text className="text-[23px] text-white">🎙</Text>
                        </View>
                        <View className="flex-1 gap-1">
                            <Text className="font-sans-semibold text-[15px] text-ink">Add items by voice</Text>
                            <Text className="font-sans text-[13px] text-ink-muted">
                                {audioUri ? 'Voice recording attached' : 'Speak your list and review the transcript'}
                            </Text>
                        </View>
                        {audioUri ? (
                            <Pressable accessibilityRole="button" onPress={(event) => {
                                event.stopPropagation();
                                setAudioUri(null);
                            }}>
                                <Text className="font-sans-semibold text-[13px] text-overdue">Remove</Text>
                            </Pressable>
                        ) : null}
                    </Pressable>

                    <View className="gap-3">
                        <Text className="font-serif-semibold text-[22px] text-ink">Items</Text>
                        <View className="gap-2 rounded-card border border-hairline bg-white p-3">
                            <ItemAutocompleteField
                                accessibilityLabel="Item name"
                                onChangeText={(value) => {
                                    setItemName(value);
                                    setErrorMessage('');
                                }}
                                onSelectSuggestion={(suggestion) => {
                                    setItemName(suggestion.name);
                                    setItemPrice(suggestion.price === undefined ? '' : String(suggestion.price));
                                    setItemSalePrice('');
                                    setDealQuantity('');
                                    setDealPrice('');
                                }}
                                placeholder="Search or add an item"
                                suggestions={inventoryItems}
                                value={itemName}
                            />
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="Item quantity"
                                    className="h-[46px] w-20 rounded-input border border-hairline bg-white px-3 text-center font-sans text-[15px] text-ink"
                                    keyboardType="number-pad"
                                    onChangeText={setItemQuantity}
                                    onSubmitEditing={addItem}
                                    placeholder="Qty"
                                    returnKeyType="done"
                                    value={itemQuantity}
                                />
                                <TextInput
                                    accessibilityLabel="Regular item price"
                                    className="h-[46px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    keyboardType="decimal-pad"
                                    onChangeText={setItemPrice}
                                    onSubmitEditing={addItem}
                                    placeholder="Regular price"
                                    returnKeyType="done"
                                    value={itemPrice}
                                />
                            </View>
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="Optional sale price"
                                    className="h-[46px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    keyboardType="decimal-pad"
                                    onChangeText={setItemSalePrice}
                                    onSubmitEditing={addItem}
                                    placeholder="Sale price (optional)"
                                    returnKeyType="done"
                                    value={itemSalePrice}
                                />
                                <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={addItem}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Add</Text>
                                </Pressable>
                            </View>
                            <View className="gap-2 rounded-lg bg-canvas-tint p-3">
                                <Text className="font-sans-semibold text-[13px] text-ink">Multi-buy deal (optional)</Text>
                                <View className="flex-row items-center gap-2">
                                    <Text className="font-sans text-[14px] text-ink-muted">Buy</Text>
                                    <TextInput
                                        accessibilityLabel="Deal quantity"
                                        className="h-10 w-16 rounded-input border border-hairline bg-white px-2 text-center font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                        keyboardType="number-pad"
                                        onChangeText={setDealQuantity}
                                        placeholder="2"
                                        value={dealQuantity}
                                    />
                                    <Text className="font-sans text-[14px] text-ink-muted">for $</Text>
                                    <TextInput
                                        accessibilityLabel="Multi-buy deal price"
                                        className="h-10 min-w-0 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                        keyboardType="decimal-pad"
                                        onChangeText={setDealPrice}
                                        placeholder="2.50 total"
                                        value={dealPrice}
                                    />
                                </View>
                                {dealQuantity.trim() && dealPrice.trim() && itemPrice.trim() ? (() => {
                                    const preview = getShoppingDealSummary({
                                        id: 'deal-preview',
                                        name: itemName.trim() || 'Item',
                                        quantity: Number(itemQuantity),
                                        price: Number(itemPrice),
                                        ...(itemSalePrice.trim() ? { salePrice: Number(itemSalePrice) } : {}),
                                        dealQuantity: Number(dealQuantity),
                                        dealPrice: Number(dealPrice),
                                    });
                                    return preview ? <Text className="font-sans text-[12px] leading-5 text-ink-muted">{preview}</Text> : null;
                                })() : null}
                            </View>
                        </View>

                        {items.length > 0 ? (
                            <View className="overflow-hidden rounded-card border border-hairline bg-white">
                                {items.map((item, index) => (
                                    <View className={`flex-row items-center justify-between px-4 py-3 ${index < items.length - 1 ? 'border-b border-row-divider' : ''}`} key={item.id}>
                                        <Text className="flex-1 font-sans-semibold text-[15px] text-ink">{item.name} · {item.quantity}</Text>
                                        <View className="ml-3 items-end">
                                            {item.dealQuantity !== undefined && item.dealPrice !== undefined ? (
                                                <>
                                                    <Text className="font-sans-semibold text-[13px] text-clay">{item.dealQuantity} for ${item.dealPrice.toFixed(2)}</Text>
                                                    <Text className="font-sans text-[12px] text-ink-muted">${getShoppingItemTotal(item).toFixed(2)} list total</Text>
                                                </>
                                            ) : item.salePrice !== undefined ? (
                                                <>
                                                    {item.price !== undefined ? <Text className="font-sans text-[12px] text-ink-faint line-through">${item.price.toFixed(2)}</Text> : null}
                                                    <Text className="font-sans-semibold text-[14px] text-clay">${item.salePrice.toFixed(2)}</Text>
                                                </>
                                            ) : item.price !== undefined ? (
                                                <Text className="font-sans text-[14px] text-ink-muted">${item.price.toFixed(2)}</Text>
                                            ) : null}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>

                    {errorMessage ? <Text accessibilityRole="alert" className="font-sans text-[14px] text-overdue">{errorMessage}</Text> : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
