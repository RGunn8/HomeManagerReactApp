import { Pressable, Text, View } from 'react-native';

import type { ShoppingTrip } from '@/shopping/shopping-model';

type ShoppingTripCardProps = {
    trip: ShoppingTrip;
    onAction?: () => void;
    onOpen?: () => void;
};

export function ShoppingTripCard({ trip, onAction, onOpen }: ShoppingTripCardProps) {
    const progress = trip.totalItems > 0
        ? Math.min(100, Math.max(0, (trip.itemsPicked / trip.totalItems) * 100))
        : 0;
    const isActive = trip.status === 'active';
    const isPast = trip.status === 'past';

    return (
        <View className={`gap-3 rounded-card border p-4 ${isActive ? 'border-clay-hairline bg-clay-tint' : 'border-hairline bg-white'}`}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Open ${trip.title}`} className="gap-3 active:opacity-75" onPress={onOpen}>
                <View className="flex-row items-start justify-between gap-3">
                    <View className="min-w-0 flex-1 gap-1">
                        <Text className="font-serif-semibold text-[20px] text-ink">{trip.title}</Text>
                        <Text className="font-sans text-[14px] text-ink-muted">
                            {trip.itemsPicked} of {trip.totalItems} items picked
                        </Text>
                    </View>
                    <View className="items-end gap-1">
                        <Text className="font-sans text-[12px] text-ink-muted">Spend so far</Text>
                        <Text className="font-sans-semibold text-[15px] text-ink">
                            ${trip.spent.toFixed(2)} / ${trip.budget.toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 0, max: 100, now: progress }}
                    className="h-2 w-full overflow-hidden rounded-full bg-white/80"
                >
                    <View className={`h-full rounded-full ${isPast ? 'bg-sage' : 'bg-forest'}`} style={{ width: `${progress}%` }} />
                </View>
            </Pressable>
            <View className="flex-row items-center justify-between">
                <Pressable accessibilityRole="button" onPress={onOpen}>
                    <Text className={`font-sans-semibold text-[12px] uppercase ${isActive ? 'text-clay' : isPast ? 'text-ink-muted' : 'text-forest'}`}>
                        {isActive ? 'In progress' : isPast ? 'Completed' : 'Ready to start'}
                    </Text>
                </Pressable>
                {!isPast && onAction ? (
                    <Pressable
                        accessibilityRole="button"
                        className={`rounded-button px-4 py-2 ${isActive ? 'bg-clay' : 'bg-forest'}`}
                        onPress={onAction}
                    >
                        <Text className="font-sans-semibold text-[14px] text-white">
                            {isActive ? 'Resume' : 'Start'}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
