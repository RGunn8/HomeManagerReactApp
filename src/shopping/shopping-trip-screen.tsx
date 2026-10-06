import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/components/floating-action-button';
import { ItemAutocompleteField } from '@/components/item-autocomplete-field';
import { TopBarButton } from '@/components/top-bar-button';
import { useInventory } from '@/inventory/hooks/use-inventory';
import {
    useAddShoppingItems,
    useCompleteShoppingTrip,
    useCreateShoppingList,
    usePauseShoppingTrip,
    useShoppingTrips,
    useStartShoppingTrip,
    useToggleShoppingItem,
} from '@/shopping/hooks/use-shopping';
import { getShoppingDealSummary, getShoppingItemTotal, type ShoppingListEntry } from '@/shopping/shopping-model';
import { sameId, useResolvedId } from '@/lib/offline/temp-ids';

export function ShoppingTripScreen() {
    const { tripId: tripIdParam, voiceItems } = useLocalSearchParams<{ tripId?: string; voiceItems?: string }>();
    const tripId = useResolvedId(tripIdParam);
    const { data: inventoryItems = [] } = useInventory();
    const { data: trips = [], isLoading } = useShoppingTrips();
    const trip = trips.find((item) => sameId(item.id, tripId));
    const startTrip = useStartShoppingTrip();
    const pauseTrip = usePauseShoppingTrip();
    const toggleItemMutation = useToggleShoppingItem();
    const toggleItem = (id: string, itemId: string, checked: boolean) => toggleItemMutation.mutate({ tripId: id, itemId, checked });
    const addItemsMutation = useAddShoppingItems();
    const addItems = (id: string, items: Omit<ShoppingListEntry, 'id'>[]) => addItemsMutation.mutate({ tripId: id, items });
    const createListMutation = useCreateShoppingList();
    const createList = (title: string, budget: number, items: Omit<ShoppingListEntry, 'id'>[]) => createListMutation.mutate({ title, budget, items });
    const completeTripMutation = useCompleteShoppingTrip();
    const handledVoiceItems = useRef<string | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState('1');
    const [itemPrice, setItemPrice] = useState('');
    const [itemSalePrice, setItemSalePrice] = useState('');
    const [dealQuantity, setDealQuantity] = useState('');
    const [dealPrice, setDealPrice] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pastItemToAdd, setPastItemToAdd] = useState<ShoppingListEntry | null>(null);
    const [isChoosingDestination, setIsChoosingDestination] = useState(false);
    const [newListName, setNewListName] = useState('');

    const addVoiceItems = addItemsMutation.mutate;
    const loadedTripId = trip?.id;
    useEffect(() => {
        if (!voiceItems || !loadedTripId || handledVoiceItems.current === voiceItems) return;
        handledVoiceItems.current = voiceItems;
        try {
            const parsed = JSON.parse(voiceItems) as { name: string; quantity: number }[];
            addVoiceItems({ tripId: loadedTripId, items: parsed.map((item) => ({ name: item.name, quantity: item.quantity })) });
        } catch {
            // ignore malformed voice payloads
        }
        router.setParams({ voiceItems: undefined });
    }, [addVoiceItems, loadedTripId, voiceItems]);

    if (!trip) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-canvas-tint px-screen" edges={['top']}>
                <Text className="font-sans text-[16px] text-ink-muted">{isLoading ? 'Loading…' : 'Shopping trip not found.'}</Text>
                <TopBarButton label="Back" onPress={() => router.back()} />
            </SafeAreaView>
        );
    }

    const items = trip.items ?? [];
    const purchasedItems = items.filter((item) => item.checked);
    const selectableCurrentTrips = trips.filter((candidate) => candidate.id !== trip.id && candidate.status !== 'past');
    const remainingBudget = Math.max(0, trip.budget - trip.spent);
    const spendProgress = trip.budget > 0 ? Math.min(100, (trip.spent / trip.budget) * 100) : 0;
    const itemProgress = trip.totalItems > 0 ? Math.round((trip.itemsPicked / trip.totalItems) * 100) : 0;

    const submitItem = () => {
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
            setErrorMessage('Enter valid item prices and a regular price when adding a multi-buy deal.');
            return;
        }

        addItems(trip.id, [{
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
        setIsAddingItem(false);
    };

    const finishTrip = () => {
        completeTripMutation.mutate(trip.id);
        router.back();
    };

    const copyPurchasedItemsToTrip = (destinationTripId: string) => {
        if (!pastItemToAdd) return;
        addItems(destinationTripId, [{
            ...pastItemToAdd,
        }]);
        setPastItemToAdd(null);
        setIsChoosingDestination(false);
    };

    const createListFromPurchasedItems = () => {
        const title = newListName.trim();
        if (!title || !pastItemToAdd) return;
        createList(title, 0, [pastItemToAdd]);
        setNewListName('');
        setPastItemToAdd(null);
        setIsChoosingDestination(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <View className="flex-1">
                    <ScrollView className="flex-1" contentContainerClassName="gap-5 px-screen pb-32 pt-2" keyboardShouldPersistTaps="handled">
                        <View className="h-12 flex-row items-center justify-between">
                            <View className="flex-1 items-start"><TopBarButton label="Back" onPress={() => router.back()} /></View>
                            <Text className="max-w-[55%] flex-1 text-center font-sans-semibold text-[16px] text-ink" numberOfLines={1}>{trip.title}</Text>
                            <View className="flex-1 items-end">
                                {trip.status !== 'past' ? (
                                    <TopBarButton label={trip.status === 'active' ? 'Pause' : 'Resume'} onPress={() => trip.status === 'active' ? pauseTrip.mutate(trip.id) : startTrip.mutate(trip.id)} />
                                ) : null}
                            </View>
                        </View>

                        <View className="gap-3 rounded-card border border-hairline bg-white p-4">
                            <View className="flex-row items-end justify-between">
                                <View className="gap-1">
                                    <Text className="font-sans text-[13px] text-ink-muted">{trip.status === 'past' ? 'Final spend' : 'Spent so far'}</Text>
                                    <Text className="font-serif-semibold text-[30px] text-ink">${trip.spent.toFixed(2)}</Text>
                                </View>
                                <Text className="font-sans-semibold text-[14px] text-ink-muted">of ${trip.budget.toFixed(2)}</Text>
                            </View>
                            <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: spendProgress }} className="h-3 w-full overflow-hidden rounded-full bg-canvas">
                                <View className="h-full rounded-full bg-forest" style={{ width: `${spendProgress}%` }} />
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="font-sans text-[14px] text-ink-muted">{trip.itemsPicked} of {trip.totalItems} items {trip.status === 'past' ? 'purchased' : 'picked'} · {itemProgress}%</Text>
                                <Text className="font-sans-semibold text-[14px] text-forest">
                                    {trip.status === 'past'
                                        ? trip.spent > trip.budget
                                            ? `$${(trip.spent - trip.budget).toFixed(2)} over budget`
                                            : `$${remainingBudget.toFixed(2)} under budget`
                                        : `$${remainingBudget.toFixed(2)} left`}
                                </Text>
                            </View>
                        </View>

                        <View className="gap-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-serif-semibold text-[24px] text-ink">{trip.status === 'past' ? 'Purchased items' : 'List items'}</Text>
                                <Text className="font-sans text-[13px] text-ink-muted">{trip.status === 'past' ? `${purchasedItems.length} bought` : 'Tap an item when picked'}</Text>
                            </View>
                            {(trip.status === 'past' ? purchasedItems : items).length > 0 ? (
                                <View className="overflow-hidden rounded-card border border-hairline bg-white">
                                    {(trip.status === 'past' ? purchasedItems : items).map((item, index, displayedItems) => {
                                        const price = (
                                            <View className={trip.status === 'past' ? 'items-start' : 'items-end'}>
                                                {item.dealQuantity !== undefined && item.dealPrice !== undefined ? (
                                                    <>
                                                        <Text className="font-sans-semibold text-[13px] text-clay">{item.dealQuantity} for ${item.dealPrice.toFixed(2)}</Text>
                                                        <Text className="font-sans text-[12px] text-ink-muted">Line total ${getShoppingItemTotal(item).toFixed(2)}</Text>
                                                    </>
                                                ) : item.salePrice !== undefined ? (
                                                    <>
                                                        {item.price !== undefined ? <Text className="font-sans text-[12px] text-ink-faint line-through">${(item.price * item.quantity).toFixed(2)}</Text> : null}
                                                        <Text className="font-sans-semibold text-[14px] text-clay">${(item.salePrice * item.quantity).toFixed(2)}</Text>
                                                    </>
                                                ) : item.price !== undefined ? (
                                                    <Text className="font-sans-semibold text-[14px] text-ink">${(item.price * item.quantity).toFixed(2)}</Text>
                                                ) : null}
                                            </View>
                                        );
                                        const rowContents = (
                                            <>
                                                {trip.status !== 'past' ? (
                                                    <View className={`h-6 w-6 items-center justify-center rounded-checkbox border ${item.checked ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}>
                                                        {item.checked ? <Text className="font-sans-semibold text-white">✓</Text> : null}
                                                    </View>
                                                ) : null}
                                                <View className="flex-1 gap-1">
                                                    <Text className={`font-sans-semibold text-[15px] ${trip.status === 'past' ? 'text-ink' : item.checked ? 'text-ink-faint line-through' : 'text-ink'}`}>{item.name}</Text>
                                                    {trip.status === 'past' ? price : null}
                                                    <Text className="font-sans text-[13px] text-ink-muted">Qty {item.quantity}</Text>
                                                </View>
                                                {trip.status === 'past' ? (
                                                    <Pressable
                                                        accessibilityLabel={`Add ${item.name} to a shopping list`}
                                                        accessibilityRole="button"
                                                        className="h-11 min-w-[44px] items-center justify-center rounded-button bg-forest px-3"
                                                        onPress={() => {
                                                            setPastItemToAdd({ ...item, id: `${Date.now()}-${item.id}`, checked: false });
                                                            setIsChoosingDestination(true);
                                                        }}
                                                    >
                                                        <Text className="font-sans-semibold text-[13px] text-white">Add</Text>
                                                    </Pressable>
                                                ) : price}
                                            </>
                                        );
                                        const rowClassName = `flex-row items-center gap-3 px-4 py-4 ${index < displayedItems.length - 1 ? 'border-b border-row-divider' : ''}`;
                                        return (
                                            trip.status === 'past' ? (
                                                <View className={rowClassName} key={item.id}>{rowContents}</View>
                                            ) : (
                                                <Pressable
                                                    accessibilityRole="checkbox"
                                                    accessibilityState={{ checked: Boolean(item.checked) }}
                                                    className={rowClassName}
                                                    key={item.id}
                                                    onPress={() => toggleItem(trip.id, item.id, !item.checked)}
                                                >
                                                    {rowContents}
                                                </Pressable>
                                            )
                                        );
                                    })}
                                </View>
                            ) : (
                                <Text className="rounded-card border border-dashed border-hairline px-4 py-8 text-center font-sans text-[15px] text-ink-muted">{trip.status === 'past' ? 'No purchased item history is available.' : 'This list has no items yet.'}</Text>
                            )}
                        </View>
                    </ScrollView>

                    {trip.status !== 'past' ? (
                        <View className="absolute right-5 gap-3" style={{ bottom: (trip.status === 'active' ? 96 : 20) + 10 }}>
                            <FloatingActionButton icon="🎙" label="Add list item by voice" onPress={() => router.push({ pathname: '/shopping-voice-entry', params: { tripId: trip.id } })} variant="secondary" />
                            <FloatingActionButton icon="+" label="Add list item" onPress={() => setIsAddingItem(true)} />
                        </View>
                    ) : null}

                    {trip.status === 'active' ? (
                        <View className="border-t border-hairline bg-canvas-tint px-screen pb-3 pt-3">
                            <Pressable accessibilityRole="button" className="items-center rounded-button bg-forest px-4 py-3" onPress={finishTrip}>
                                <Text className="font-sans-semibold text-[16px] text-white">Complete trip</Text>
                            </Pressable>
                        </View>
                    ) : null}
                </View>
            </KeyboardAvoidingView>

            <Modal animationType="slide" onRequestClose={() => setIsAddingItem(false)} presentationStyle="fullScreen" visible={isAddingItem}>
                <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top', 'bottom']}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                        <ScrollView className="flex-1" contentContainerClassName="gap-5 px-screen pb-8 pt-2" keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'} keyboardShouldPersistTaps="handled">
                            <View className="h-14 flex-row items-center justify-between">
                                <TopBarButton label="Cancel" onPress={() => setIsAddingItem(false)} />
                                <Text className="font-sans-semibold text-[16px] text-ink">Add list item</Text>
                                <View className="w-14" />
                            </View>
                            <View className="gap-2">
                                <Text className="font-sans-semibold text-[14px] text-ink">Item name</Text>
                                <ItemAutocompleteField
                                    accessibilityLabel="Item name"
                                    autoFocus
                                    inputClassName="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setItemName}
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
                            </View>
                            <View className="gap-2">
                                <Text className="font-sans-semibold text-[14px] text-ink">Quantity and regular price</Text>
                                <View className="flex-row gap-2">
                                    <TextInput accessibilityLabel="Item quantity" className="h-[50px] w-24 rounded-input border border-hairline bg-white px-3 text-center font-sans text-[15px] text-ink" keyboardType="number-pad" onChangeText={setItemQuantity} placeholder="Qty" returnKeyType="next" value={itemQuantity} />
                                    <TextInput accessibilityLabel="Regular item price" className="h-[50px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint" keyboardType="decimal-pad" onChangeText={setItemPrice} placeholder="Regular price" returnKeyType="next" value={itemPrice} />
                                </View>
                            </View>
                            <View className="gap-2 rounded-card border border-hairline bg-white p-4">
                                <Text className="font-sans-semibold text-[14px] text-ink">Multi-buy offer (optional)</Text>
                                <Text className="font-sans text-[13px] text-ink-muted">For example, buy 2 for $2.50.</Text>
                                <View className="flex-row items-center gap-2">
                                    <Text className="font-sans text-[14px] text-ink-muted">Buy</Text>
                                    <TextInput accessibilityLabel="Deal quantity" className="h-11 w-16 rounded-input border border-hairline bg-white px-2 text-center font-sans text-[15px] text-ink placeholder:text-ink-faint" keyboardType="number-pad" onChangeText={setDealQuantity} placeholder="2" value={dealQuantity} />
                                    <Text className="font-sans text-[14px] text-ink-muted">for $</Text>
                                    <TextInput accessibilityLabel="Multi-buy deal price" className="h-11 min-w-0 flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint" keyboardType="decimal-pad" onChangeText={setDealPrice} placeholder="2.50 total" value={dealPrice} />
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
                                    return preview ? <Text className="font-sans text-[13px] leading-5 text-ink-muted">{preview}</Text> : null;
                                })() : null}
                            </View>
                            <View className="gap-2">
                                <Text className="font-sans-semibold text-[14px] text-ink">Sale price (optional)</Text>
                                <TextInput accessibilityLabel="Sale item price" className="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint" keyboardType="decimal-pad" onChangeText={setItemSalePrice} placeholder="Sale price per item" returnKeyType="done" value={itemSalePrice} />
                            </View>
                            {errorMessage ? <Text accessibilityRole="alert" className="font-sans text-[14px] text-overdue">{errorMessage}</Text> : null}
                            <Pressable accessibilityRole="button" className="items-center rounded-button bg-forest px-4 py-3" onPress={submitItem}>
                                <Text className="font-sans-semibold text-[15px] text-white">Add item</Text>
                            </Pressable>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>

            <Modal animationType="slide" onRequestClose={() => setIsChoosingDestination(false)} presentationStyle="fullScreen" visible={isChoosingDestination}>
                <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top', 'bottom']}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                        <View className="flex-1 gap-4 px-screen pb-8 pt-5">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-serif-semibold text-[22px] text-ink">Add to a list</Text>
                                <Pressable accessibilityRole="button" onPress={() => setIsChoosingDestination(false)}>
                                    <Text className="font-sans-semibold text-[15px] text-ink-muted">Cancel</Text>
                                </Pressable>
                            </View>
                            <Text className="font-sans text-[14px] text-ink-muted">Choose an active list or create a new one for this purchased item.</Text>
                            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                                {selectableCurrentTrips.map((destination) => (
                                    <Pressable className="mb-2 rounded-card border border-hairline bg-white px-4 py-3" key={destination.id} onPress={() => copyPurchasedItemsToTrip(destination.id)}>
                                        <Text className="font-sans-semibold text-[15px] text-ink">{destination.title}</Text>
                                        <Text className="mt-1 font-sans text-[13px] text-ink-muted">{destination.status === 'active' ? 'In progress' : 'Ready to start'}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            <View className="gap-2 border-t border-hairline pt-3">
                                <Text className="font-sans-semibold text-[14px] text-ink">Or create a new list</Text>
                                <View className="flex-row gap-2">
                                    <TextInput accessibilityLabel="New shopping list name" className="h-[48px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint" onChangeText={setNewListName} placeholder="List name" returnKeyType="done" value={newListName} />
                                    <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4 disabled:opacity-50" disabled={!newListName.trim()} onPress={createListFromPurchasedItems}>
                                        <Text className="font-sans-semibold text-[14px] text-white">Create</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
