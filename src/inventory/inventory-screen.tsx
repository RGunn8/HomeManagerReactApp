import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { InventoryListItem } from '@/inventory/components/inventory-list-item';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { isInventoryItemLow } from '@/inventory/inventory-model';

type InventorySort = 'name' | 'category' | 'store' | 'room' | 'price';

export function InventoryScreen({ onBack }: { onBack?: () => void } = {}) {
    const { filter } = useLocalSearchParams<{ filter?: string }>();
    const { data: items = [] } = useInventory();
    const [searchText, setSearchText] = useState('');
    const lowOnly = filter === 'low';
    const [sortBy, setSortBy] = useState<InventorySort>('name');

    const filteredItems = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        return items
            .filter((item) => {
                const matchesSearch = `${item.name} ${item.room} ${item.category} ${item.stores.join(' ')}`.toLowerCase().includes(normalizedSearch);
                return matchesSearch && (!lowOnly || isInventoryItemLow(item));
            })
            .sort((first, second) => {
                if (sortBy === 'price') {
                    if (first.price === undefined) return second.price === undefined ? first.name.localeCompare(second.name) : 1;
                    if (second.price === undefined) return -1;
                    return first.price - second.price || first.name.localeCompare(second.name);
                }
                if (sortBy === 'category') {
                    return first.category.localeCompare(second.category) || first.name.localeCompare(second.name);
                }
                if (sortBy === 'store') {
                    const firstStore = [...first.stores].sort()[0] ?? 'No store';
                    const secondStore = [...second.stores].sort()[0] ?? 'No store';
                    return firstStore.localeCompare(secondStore) || first.name.localeCompare(second.name);
                }
                if (sortBy === 'room') {
                    return first.room.localeCompare(second.room) || first.name.localeCompare(second.name);
                }
                return first.name.localeCompare(second.name);
            });
    }, [items, lowOnly, searchText, sortBy]);

    const groupedItems = useMemo(() => {
        if (sortBy !== 'category' && sortBy !== 'store' && sortBy !== 'room') return [];

        const groups = new Map<string, typeof filteredItems>();
        filteredItems.forEach((item) => {
            const itemGroups = sortBy === 'category'
                ? [item.category || 'Other']
                : sortBy === 'room'
                    ? [item.room || 'Unassigned']
                    : item.stores.length > 0 ? [...new Set(item.stores)] : ['No store'];
            itemGroups.forEach((groupName) => {
                groups.set(groupName, [...(groups.get(groupName) ?? []), item]);
            });
        });

        return [...groups.entries()]
            .sort(([firstGroup], [secondGroup]) => firstGroup.localeCompare(secondGroup))
            .map(([title, groupItems]) => ({
                title,
                items: groupItems.sort((first, second) => first.name.localeCompare(second.name)),
            }));
    }, [filteredItems, sortBy]);

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView className="flex-1" contentContainerClassName="gap-4 px-screen pb-28 pt-2" keyboardShouldPersistTaps="handled">
                    {onBack ? (
                        <View className="flex-row items-center justify-between">
                            <TopBarButton label="Back" onPress={onBack} />
                            <TitleText title="Inventory" />
                            <TopBarButton label="+ Add" onPress={() => router.push('/inventory-add')} />
                            
                        </View>
                    ) : (
                <View className="flex-row items-center justify-between">
				<TitleText title="Inventory" />
					<TopBarButton label="+ Add" onPress={() => router.push('/inventory-add')} />
				</View>
                    
                    )}
                    <TextInput
                        accessibilityLabel="Search inventory items"
                        autoCapitalize="none"
                        className="h-[52px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                        onChangeText={setSearchText}
                        placeholder="Search items"
                        returnKeyType="search"
                        value={searchText}
                    />
                    <View className="flex-row gap-2">
                        {(['All', 'Low'] as const).map((filterLabel) => {
                            const isSelected = filterLabel === 'Low' ? lowOnly : !lowOnly;
                            return (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    className={`rounded-full border px-4 py-2 ${isSelected ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                    key={filterLabel}
                                    onPress={() => {
                                        router.setParams({ filter: filterLabel === 'Low' ? 'low' : 'all' });
                                    }}
                                >
                                    <Text className={`font-sans-semibold text-[14px] ${isSelected ? 'text-white' : 'text-ink-muted'}`}>{filterLabel}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="font-sans text-[13px] text-ink-muted">Sort by</Text>
                        <ScrollView horizontal contentContainerClassName="gap-2" showsHorizontalScrollIndicator={false}>
                            {(['name', 'category', 'store', 'room', 'price'] as const).map((sortOption) => (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: sortBy === sortOption }}
                                    className={`rounded-full border px-3 py-1.5 ${sortBy === sortOption ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                    key={sortOption}
                                    onPress={() => setSortBy(sortOption)}
                                >
                                    <Text className={`font-sans-semibold text-[13px] ${sortBy === sortOption ? 'text-white' : 'text-ink-muted'}`}>
                                        {sortOption === 'name' ? 'Name' : sortOption === 'category' ? 'Category' : sortOption === 'store' ? 'Store' : sortOption === 'room' ? 'Room' : 'Price'}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                    {filteredItems.length === 0 ? (
                        <View className="overflow-hidden rounded-card border border-hairline bg-white">
                            <Text className="px-4 py-8 text-center font-sans text-[15px] text-ink-muted">No items found.</Text>
                        </View>
                    ) : sortBy === 'category' || sortBy === 'store' || sortBy === 'room' ? (
                        <View className="gap-4">
                            {groupedItems.map((group) => (
                                <View className="gap-2" key={group.title}>
                                    <Text className="font-serif-semibold text-[20px] text-ink">{group.title}</Text>
                                    <View className="overflow-hidden rounded-card border border-hairline bg-white">
                                        {group.items.map((item) => (
                                            <InventoryListItem
                                                item={item}
                                                key={`${group.title}-${item.id}`}
                                                onPress={(itemId) => router.push({ pathname: '/inventory-detail', params: { itemId } })}
                                            />
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View className="overflow-hidden rounded-card border border-hairline bg-white">
                            {filteredItems.map((item) => (
                                <InventoryListItem
                                    item={item}
                                    key={item.id}
                                    onPress={(itemId) => router.push({ pathname: '/inventory-detail', params: { itemId } })}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
