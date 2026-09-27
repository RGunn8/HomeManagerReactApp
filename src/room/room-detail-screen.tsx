import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useReducer, useRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBarButton } from '@/components/top-bar-button';
import { mockUpdateRoomItem } from '@/lib/mock-api';
import { RoomItemsTab, type RoomItem } from '@/room/component/room-items-tab';
import { RoomNotesTab, type RoomNote } from '@/room/component/room-notes-tab';
import { RoomTasksTab } from '@/room/component/room-tasks-tab';
import type { AddedTask } from '@/task/component/add-tasks';

const initialTasks: AddedTask[] = [
    { name: 'Sweep the floor', detail: '2 days', checked: false },
    { name: 'Wipe the counters', detail: 'day', checked: false },
];

const initialItems: RoomItem[] = [
    { id: 'laundry-detergent', name: 'Laundry detergent', quantity: 1, low: true, inShoppingList: false },
    { id: 'paper-towels', name: 'Paper towels', quantity: 2, low: true, inShoppingList: false },
    { id: 'light-bulbs', name: 'Light bulbs', quantity: 6, low: false, inShoppingList: false },
    { id: 'cleaning-spray', name: 'Cleaning spray', quantity: 3, low: false, inShoppingList: false },
];

type RoomDetailTab = 'tasks' | 'items' | 'notes';

type RoomDetailState = {
    roomName: string;
    draftRoomName: string;
    isEditing: boolean;
    activeTab: RoomDetailTab;
    items: RoomItem[];
    notes: RoomNote[];
    openTaskCount: number;
};

type RoomDetailAction =
    | { type: 'startEditing' }
    | { type: 'setDraftRoomName'; draftRoomName: string }
    | { type: 'saveRoomName'; roomName: string }
    | { type: 'selectTab'; tab: RoomDetailTab }
    | { type: 'setItems'; items: RoomItem[] }
    | { type: 'setNotes'; notes: RoomNote[] }
    | { type: 'setOpenTaskCount'; count: number };

function createInitialState(roomName: string): RoomDetailState {
    return {
        roomName,
        draftRoomName: roomName,
        isEditing: false,
        activeTab: 'tasks',
        items: initialItems,
        notes: [],
        openTaskCount: initialTasks.filter((task) => !task.checked).length,
    };
}

function roomDetailReducer(state: RoomDetailState, action: RoomDetailAction): RoomDetailState {
    switch (action.type) {
        case 'startEditing':
            return { ...state, draftRoomName: state.roomName, isEditing: true };
        case 'setDraftRoomName':
            return { ...state, draftRoomName: action.draftRoomName };
        case 'saveRoomName':
            return action.roomName ? { ...state, roomName: action.roomName, isEditing: false } : { ...state, isEditing: false };
        case 'selectTab':
            return { ...state, activeTab: action.tab };
        case 'setItems':
            return { ...state, items: action.items };
        case 'setNotes':
            return { ...state, notes: action.notes };
        case 'setOpenTaskCount':
            return { ...state, openTaskCount: action.count };
        default:
            return state;
    }
}

export function RoomDetailScreen() {
    const { roomName: roomNameParam } = useLocalSearchParams<{ roomName?: string }>();
    const [state, dispatch] = useReducer(roomDetailReducer, roomNameParam ?? 'Room', createInitialState);
    const quantityUpdateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const pendingQuantities = useRef<Record<string, number>>({});

    const flushPendingQuantityUpdates = useCallback(() => {
        Object.entries(pendingQuantities.current).forEach(([itemId, quantity]) => {
            const timer = quantityUpdateTimers.current[itemId];
            if (timer) {
                clearTimeout(timer);
            }
            void mockUpdateRoomItem(itemId, quantity);
            delete quantityUpdateTimers.current[itemId];
            delete pendingQuantities.current[itemId];
        });
    }, []);

    useFocusEffect(useCallback(() => flushPendingQuantityUpdates, [flushPendingQuantityUpdates]));

    const lowItemCount = state.items.filter((item) => item.low).length;
    const trackedItemCount = state.items.reduce((total, item) => total + item.quantity, 0);

    const toggleEdit = () => {
        if (state.isEditing) {
            dispatch({ type: 'saveRoomName', roomName: state.draftRoomName.trim() });
        } else {
            dispatch({ type: 'startEditing' });
        }
    };

    const updateQuantity = (itemId: string, change: number) => {
        const currentQuantity = pendingQuantities.current[itemId]
            ?? state.items.find((item) => item.id === itemId)?.quantity
            ?? 0;
        const nextQuantity = Math.max(0, currentQuantity + change);
        pendingQuantities.current[itemId] = nextQuantity;
        dispatch({
            type: 'setItems',
            items: state.items.map((item) => item.id === itemId ? { ...item, quantity: nextQuantity } : item),
        });

        const existingTimer = quantityUpdateTimers.current[itemId];
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        quantityUpdateTimers.current[itemId] = setTimeout(() => {
            void mockUpdateRoomItem(itemId, nextQuantity);
            delete quantityUpdateTimers.current[itemId];
            delete pendingQuantities.current[itemId];
        }, 350);
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-screen pb-28 pt-2"
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="h-14 flex-row items-center justify-between">
                        <TopBarButton label="Back" onPress={() => router.back()} />
                        <TopBarButton label={state.isEditing ? 'Save' : 'Edit'} onPress={toggleEdit} />
                    </View>

                    {state.isEditing ? (
                        <TextInput
                            accessibilityLabel="Room name"
                            autoFocus
                            className="mt-2 h-[48px] rounded-input border border-hairline bg-white px-4 font-serif-semibold text-[28px] text-ink placeholder:text-ink-faint"
                            onChangeText={(draftRoomName) => dispatch({ type: 'setDraftRoomName', draftRoomName })}
                            placeholder="Room name"
                            value={state.draftRoomName}
                        />
                    ) : (
                        <Text className="mt-2 font-serif-semibold text-[32px] text-ink">{state.roomName}</Text>
                    )}
                    <Text className="mt-2 font-sans text-[15px] text-ink-muted">
                        {state.openTaskCount} open tasks · {trackedItemCount} items tracked · {lowItemCount} low
                    </Text>

                    <View className="mt-6 flex-row rounded-button bg-sage-tint p-1">
                        {(['tasks', 'items', 'notes'] as RoomDetailTab[]).map((tab) => (
                            <Pressable
                                accessibilityRole="tab"
                                accessibilityState={{ selected: state.activeTab === tab }}
                                className={`flex-1 items-center rounded-button px-2 py-2 ${state.activeTab === tab ? 'bg-forest' : 'bg-transparent'}`}
                                key={tab}
                                onPress={() => dispatch({ type: 'selectTab', tab })}
                            >
                                <Text className={`font-sans-semibold text-[14px] capitalize ${state.activeTab === tab ? 'text-white' : 'text-ink-muted'}`}>
                                    {tab}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {state.activeTab === 'tasks' && (
                        <RoomTasksTab
                            initialTasks={initialTasks}
                            onTasksChange={(tasks) => dispatch({ type: 'setOpenTaskCount', count: tasks.filter((task) => !task.checked).length })}
                        />
                    )}
                    {state.activeTab === 'items' && (
                        <RoomItemsTab items={state.items} onItemsChange={(items) => dispatch({ type: 'setItems', items })} onQuantityChange={updateQuantity} />
                    )}
                    {state.activeTab === 'notes' && <RoomNotesTab notes={state.notes} onNotesChange={(notes) => dispatch({ type: 'setNotes', notes })} />}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
