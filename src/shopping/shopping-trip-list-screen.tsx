import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { ShoppingTripCard } from '@/shopping/component/shopping-trip-card';
import { useShoppingTrips, useStartShoppingTrip } from '@/shopping/hooks/use-shopping';

const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active & ready' },
    { id: 'past', label: 'Past' },
] as const;
type TripStatusFilter = typeof statusFilters[number]['id'];

export function ShoppingTripListScreen() {
    const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();
    const { data: trips = [] } = useShoppingTrips();
    const startTrip = useStartShoppingTrip();
    const [activeStatusFilter, setActiveStatusFilter] = useState<TripStatusFilter>(
        statusFilters.some((filter) => filter.id === initialFilter) ? initialFilter as TripStatusFilter : 'all',
    );

    const visibleTrips = useMemo(() => trips.filter((trip) => {
        if (activeStatusFilter === 'active') return trip.status !== 'past';
        if (activeStatusFilter === 'past') return trip.status === 'past';
        return true;
    }), [activeStatusFilter, trips]);

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <ScrollView className="flex-1" contentContainerClassName="gap-4 px-screen pb-28 pt-2">
                <View className="flex-row items-center justify-between">
                    <TopBarButton label="Back" onPress={() => router.back()} />
                    <TitleText title="Shopping trips" />
                    <View className="w-[56px]" />
                </View>
                <ScrollView horizontal contentContainerClassName="gap-2" showsHorizontalScrollIndicator={false}>
                    {statusFilters.map((filter) => (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: activeStatusFilter === filter.id }}
                            className={`rounded-full border px-4 py-2 ${activeStatusFilter === filter.id ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                            key={filter.id}
                            onPress={() => setActiveStatusFilter(filter.id)}
                        >
                            <Text className={`font-sans-semibold text-[14px] ${activeStatusFilter === filter.id ? 'text-white' : 'text-ink-muted'}`}>
                                {filter.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <Text className="font-sans text-[14px] text-ink-muted">{visibleTrips.length} {visibleTrips.length === 1 ? 'trip' : 'trips'}</Text>
                <View className="gap-3">
                    {visibleTrips.length > 0 ? visibleTrips.map((trip) => (
                        <ShoppingTripCard
                            key={trip.id}
                            onAction={trip.status === 'past' ? undefined : () => {
                                startTrip.mutate(trip.id);
                                router.push({ pathname: '/shopping-trip', params: { tripId: trip.id } });
                            }}
                            onOpen={() => router.push({ pathname: '/shopping-trip', params: { tripId: trip.id } })}
                            trip={trip}
                        />
                    )) : (
                        <Text className="rounded-card border border-dashed border-hairline px-4 py-8 text-center font-sans text-[15px] text-ink-muted">
                            No trips match this filter.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
