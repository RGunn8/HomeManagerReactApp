import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { ShoppingTripCard } from '@/shopping/component/shopping-trip-card';
import { useShoppingTrips, useStartShoppingTrip } from '@/shopping/hooks/use-shopping';

const ACTIVE_TRIPS_PREVIEW_COUNT = 3;

export function ShoppingScreen() {
    const { data: trips = [] } = useShoppingTrips();
    const startTrip = useStartShoppingTrip();

    const activeTrips = trips.filter((trip) => trip.status !== 'past');
    const pastTrips = trips.filter((trip) => trip.status === 'past');
    const visibleActiveTrips = activeTrips.slice(0, ACTIVE_TRIPS_PREVIEW_COUNT);
    const visiblePastTrips = pastTrips.slice(0, 1);

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <ScrollView className="flex-1" contentContainerClassName="gap-5 px-screen pb-28 pt-2">
                <View className="flex-row items-center justify-between">
                    <TitleText title="Shopping" />
                    <TopBarButton label="+ List" onPress={() => router.push('/shopping-list-add')} />
                </View>

                <View className="gap-3">
                    <Text className="font-serif-semibold text-[24px] text-ink">Active & ready</Text>
                    {visibleActiveTrips.length > 0 ? visibleActiveTrips.map((trip) => (
                        <ShoppingTripCard
                            key={trip.id}
                            onAction={() => {
                                startTrip.mutate(trip.id);
                                router.push({ pathname: '/shopping-trip', params: { tripId: trip.id } });
                            }}
                            onOpen={() => router.push({ pathname: '/shopping-trip', params: { tripId: trip.id } })}
                            trip={trip}
                        />
                    )) : (
                        <Text className="rounded-card border border-dashed border-hairline px-4 py-6 text-center font-sans text-[15px] text-ink-muted">
                            No active shopping trips.
                        </Text>
                    )}
                    {activeTrips.length > ACTIVE_TRIPS_PREVIEW_COUNT ? (
                        <Pressable
                            accessibilityRole="button"
                            className="items-center rounded-button border border-hairline bg-white px-4 py-3"
                            onPress={() => router.push({ pathname: '/shopping-trips', params: { filter: 'active' } })}
                        >
                            <Text className="font-sans-semibold text-[14px] text-forest">View {activeTrips.length - ACTIVE_TRIPS_PREVIEW_COUNT} more</Text>
                        </Pressable>
                    ) : null}
                </View>

                <View className="gap-3">
                    <Text className="font-serif-semibold text-[24px] text-ink">Past trips</Text>
                    {visiblePastTrips.length > 0 ? visiblePastTrips.map((trip) => (
                        <ShoppingTripCard
                            key={trip.id}
                            onOpen={() => router.push({ pathname: '/shopping-trip', params: { tripId: trip.id } })}
                            trip={trip}
                        />
                    )) : (
                        <Text className="rounded-card border border-dashed border-hairline px-4 py-6 text-center font-sans text-[15px] text-ink-muted">
                            Completed trips will appear here.
                        </Text>
                    )}
                    {pastTrips.length > 1 ? (
                        <Pressable
                            accessibilityRole="button"
                            className="items-center rounded-button border border-hairline bg-white px-4 py-3"
                            onPress={() => router.push({ pathname: '/shopping-trips', params: { filter: 'past' } })}
                        >
                            <Text className="font-sans-semibold text-[14px] text-forest">Show all past trips</Text>
                        </Pressable>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
