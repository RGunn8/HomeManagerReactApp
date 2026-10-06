import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useReducer, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBarButton } from '@/components/top-bar-button';
import { COMMON_ROOM_EMOJIS, getRoomEmoji, isRoomEmoji } from '@/constants/room-emojis';
import { useCreateInventoryItems, useInventory, useUpdateInventoryItem } from '@/inventory/hooks/use-inventory';
import { isInventoryItemLow } from '@/inventory/inventory-model';
import ProjectListCard from '@/project/compoment/project-list-card';
import { useProjects } from '@/project/hooks/use-projects';
import { openProjectDetail } from '@/project/project-navigation';
import { RoomIconListItem } from '@/room/component/room-icon-list-item';
import { RoomItemsTab, type RoomItem } from '@/room/component/room-items-tab';
import { RoomNotesTab, type RoomNote } from '@/room/component/room-notes-tab';
import { RoomTasksTab } from '@/room/component/room-tasks-tab';
import { useCreateRoomNote, useDeleteRoom, useRoom, useRooms, useUpdateRoom } from '@/room/hooks/use-rooms';
import { useAddToShoppingList, useShoppingTrips } from '@/shopping/hooks/use-shopping';
import { useCreateTask, useSetTaskCompleted, useTasks } from '@/task/hooks/use-tasks';
import { toAddedTask } from '@/task/task-model';
import { sameId, useResolvedId } from '@/lib/offline/temp-ids';

type RoomDetailTab = 'tasks' | 'items' | 'notes' | 'projects';

type RoomDetailState = {
    roomName: string;
    draftRoomName: string;
    draftRoomIcon: string;
    isEditing: boolean;
    activeTab: RoomDetailTab;
};

type RoomDetailAction =
    | { type: 'startEditing'; icon: string }
    | { type: 'setDraftRoomName'; draftRoomName: string }
    | { type: 'setDraftRoomIcon'; icon: string }
    | { type: 'saveRoomName'; roomName: string; icon: string }
    | { type: 'selectTab'; tab: RoomDetailTab };

function createInitialState(roomName: string): RoomDetailState {
    return {
        roomName,
        draftRoomName: roomName,
        draftRoomIcon: getRoomEmoji(roomName),
        isEditing: false,
        activeTab: 'tasks',
    };
}

function roomDetailReducer(state: RoomDetailState, action: RoomDetailAction): RoomDetailState {
    switch (action.type) {
        case 'startEditing':
            return { ...state, draftRoomName: state.roomName, draftRoomIcon: action.icon, isEditing: true };
        case 'setDraftRoomName':
            return { ...state, draftRoomName: action.draftRoomName };
        case 'setDraftRoomIcon':
            return { ...state, draftRoomIcon: action.icon };
        case 'saveRoomName':
            return action.roomName ? { ...state, roomName: action.roomName, draftRoomIcon: action.icon, isEditing: false } : { ...state, isEditing: false };
        case 'selectTab':
            return { ...state, activeTab: action.tab };
        default:
            return state;
    }
}

export function RoomDetailScreen() {
    const { roomId: roomIdParam, roomName: roomNameParam } = useLocalSearchParams<{ roomId?: string; roomName?: string }>();
    const roomId = useResolvedId(roomIdParam);
    const [state, dispatch] = useReducer(roomDetailReducer, roomNameParam ?? 'Room', createInitialState);
    const { data: rooms } = useRooms();
    const room = rooms.find((item) => sameId(item.id, roomId)
        || (!roomId && item.name.trim().toLowerCase() === state.roomName.trim().toLowerCase()));
    const deleteRoom = useDeleteRoom();
    const { data: roomDetail } = useRoom(room?.id);
    const createRoomNote = useCreateRoomNote();
    const notes = useMemo<RoomNote[]>(() => (roomDetail?.notes ?? []).map((note) => ({
        id: note.id,
        text: note.content,
        createdAt: new Date(note.createdAt).getTime(),
    })), [roomDetail?.notes]);
    const updateRoom = useUpdateRoom();
    const { data: allTasks = [] } = useTasks();
    const createTask = useCreateTask();
    const setTaskCompleted = useSetTaskCompleted();
    const { data: inventoryItems = [] } = useInventory();
    const updateInventoryItem = useUpdateInventoryItem();
    const createInventoryItems = useCreateInventoryItems();
    const { data: trips = [] } = useShoppingTrips();
    const addToShoppingList = useAddToShoppingList();
    const { data: projects = [] } = useProjects();
    const [isChoosingCustomIcon, setIsChoosingCustomIcon] = useState(false);
    const [customIcon, setCustomIcon] = useState('');
    const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({});
    const quantityUpdateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const pendingQuantities = useRef<Record<string, number>>({});

    const roomTasks = useMemo(
        () => allTasks.filter((task) => room && task.roomId === room.id).map(toAddedTask),
        [allTasks, room],
    );
    const roomInventory = useMemo(
        () => inventoryItems.filter((item) => room && item.roomId === room.id),
        [inventoryItems, room],
    );
    const items = useMemo<RoomItem[]>(() => roomInventory.map((item) => {
        const quantity = quantityOverrides[item.id] ?? item.quantity;
        return {
            id: item.id,
            name: item.name,
            quantity,
            low: isInventoryItemLow({ ...item, quantity }),
            inShoppingList: trips.some((trip) => trip.status !== 'past'
                && trip.items?.some((entry) => entry.name.trim().toLowerCase() === item.name.trim().toLowerCase())),
        };
    }), [quantityOverrides, roomInventory, trips]);

    const saveQuantity = useCallback((itemId: string, quantity: number) => {
        // The cached item now holds the new quantity, so the on-screen override can go.
        updateInventoryItem.mutate({ itemId, updates: { quantity } });
        setQuantityOverrides(({ [itemId]: _saved, ...rest }) => rest);
    }, [updateInventoryItem]);

    const flushPendingQuantityUpdates = useCallback(() => {
        Object.entries(pendingQuantities.current).forEach(([itemId, quantity]) => {
            const timer = quantityUpdateTimers.current[itemId];
            if (timer) {
                clearTimeout(timer);
            }
            saveQuantity(itemId, quantity);
            delete quantityUpdateTimers.current[itemId];
            delete pendingQuantities.current[itemId];
        });
    }, [saveQuantity]);

    useFocusEffect(useCallback(() => flushPendingQuantityUpdates, [flushPendingQuantityUpdates]));

    const openTaskCount = roomTasks.filter((task) => !task.checked).length;
    const lowItemCount = items.filter((item) => item.low).length;
    const trackedItemCount = items.reduce((total, item) => total + item.quantity, 0);
    const roomProjects = projects.filter((project) => room && project.roomId === room.id);

    const addItemsToShoppingList = (itemIds: string[]) => {
        const entries = roomInventory
            .filter((item) => itemIds.includes(item.id))
            .map((item) => ({ name: item.name, quantity: Math.max(1, item.belowPar - item.quantity), price: item.price }));
        if (entries.length > 0) addToShoppingList.mutate(entries, `${state.roomName} restock`);
    };
    const tabs: RoomDetailTab[] = ['tasks', 'items', 'notes', 'projects'];

    const toggleEdit = () => {
        if (state.isEditing) {
            const roomName = state.draftRoomName.trim();
            if (!roomName || !isRoomEmoji(state.draftRoomIcon)) return;
            dispatch({ type: 'saveRoomName', roomName, icon: state.draftRoomIcon });
            if (room) updateRoom.mutate({ roomId: room.id, name: roomName, roomEmoji: state.draftRoomIcon });
            setIsChoosingCustomIcon(false);
        } else {
            dispatch({ type: 'startEditing', icon: room?.icon ?? getRoomEmoji(state.roomName) });
            setCustomIcon('');
            setIsChoosingCustomIcon(false);
        }
    };

    const selectRoomIcon = (icon: string) => {
        dispatch({ type: 'setDraftRoomIcon', icon });
        setIsChoosingCustomIcon(false);
        setCustomIcon('');
    };

    const confirmDeleteRoom = () => {
        Alert.alert(
            `Delete ${state.roomName}?`,
            'This removes the room from your rooms list and cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (room) deleteRoom.mutate(room.id);
                        router.back();
                    },
                },
            ],
        );
    };

    const updateQuantity = (itemId: string, change: number) => {
        const currentQuantity = pendingQuantities.current[itemId]
            ?? items.find((item) => item.id === itemId)?.quantity
            ?? 0;
        const nextQuantity = Math.max(0, currentQuantity + change);
        pendingQuantities.current[itemId] = nextQuantity;
        setQuantityOverrides((current) => ({ ...current, [itemId]: nextQuantity }));

        const existingTimer = quantityUpdateTimers.current[itemId];
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        quantityUpdateTimers.current[itemId] = setTimeout(() => {
            saveQuantity(itemId, nextQuantity);
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
                        <View className="flex-row items-center gap-4">
                            <TopBarButton
                                disabled={state.isEditing && (!state.draftRoomName.trim() || (isChoosingCustomIcon && !isRoomEmoji(customIcon)))}
                                label={state.isEditing ? 'Save' : 'Edit'}
                                onPress={toggleEdit}
                            />
                            <Pressable accessibilityRole="button" onPress={confirmDeleteRoom}>
                                <Text className="font-sans-semibold text-[14px] text-overdue">Delete</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View className="mt-2 flex-row items-center gap-3">
                        <Text accessibilityLabel={`${state.roomName} icon`} className="text-[32px]">{state.isEditing ? state.draftRoomIcon : room?.icon ?? getRoomEmoji(state.roomName)}</Text>
                        {state.isEditing ? (
                            <TextInput
                                accessibilityLabel="Room name"
                                autoFocus
                                className="h-[48px] flex-1 rounded-input border border-hairline bg-white px-4 font-serif-semibold text-[28px] text-ink placeholder:text-ink-faint"
                                onChangeText={(draftRoomName) => dispatch({ type: 'setDraftRoomName', draftRoomName })}
                                placeholder="Room name"
                                value={state.draftRoomName}
                            />
                        ) : (
                            <Text className="flex-1 font-serif-semibold text-[32px] text-ink">{state.roomName}</Text>
                        )}
                    </View>
                    {state.isEditing && (
                        <View className="mt-4 gap-3">
                            <Text className="font-sans-semibold text-[14px] text-ink">Room emoji</Text>
                            <View className="flex-row flex-wrap gap-3">
                                {COMMON_ROOM_EMOJIS.map((icon) => (
                                    <RoomIconListItem
                                        icon={icon}
                                        isSelected={!isChoosingCustomIcon && state.draftRoomIcon === icon}
                                        key={icon}
                                        onPress={() => selectRoomIcon(icon)}
                                    />
                                ))}
                                <RoomIconListItem
                                    icon="…"
                                    isCustom
                                    isSelected={isChoosingCustomIcon}
                                    onPress={() => {
                                        setCustomIcon(state.draftRoomIcon);
                                        setIsChoosingCustomIcon(true);
                                    }}
                                />
                            </View>
                            {isChoosingCustomIcon && (
                                <TextInput
                                    accessibilityLabel="Custom room emoji"
                                    autoFocus
                                    className="h-[48px] rounded-input border border-hairline bg-white px-4 text-center text-[22px] placeholder:text-ink-faint"
                                    maxLength={8}
                                    onChangeText={(value) => {
                                        setCustomIcon(value);
                                        dispatch({ type: 'setDraftRoomIcon', icon: isRoomEmoji(value) ? value.trim() : '…' });
                                    }}
                                    placeholder="Choose an emoji"
                                    value={customIcon}
                                />
                            )}
                            {isChoosingCustomIcon && customIcon.trim().length > 0 && !isRoomEmoji(customIcon) && (
                                <Text accessibilityRole="alert" className="font-sans text-[14px] text-overdue">Please pick an emoji.</Text>
                            )}
                        </View>
                    )}
                    <Text className="mt-2 font-sans text-[15px] text-ink-muted">
                        {openTaskCount} open tasks · {trackedItemCount} items tracked · {lowItemCount} low
                    </Text>

                    <View className="mt-6 flex-row rounded-button bg-sage-tint p-1">
                        {tabs.map((tab) => (
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
                            roomName={state.roomName}
                            tasks={roomTasks}
                            onAddTask={(task) => createTask.mutate({ name: task.name, detail: task.detail, dueDate: task.dueDate, roomId: room?.id })}
                            onTaskCheckedChange={(task, checked) => task.id && setTaskCompleted.mutate({ taskId: task.id, checked })}
                        />
                    )}
                    {state.activeTab === 'items' && (
                        <RoomItemsTab
                            items={items}
                            onAddItem={(name) => createInventoryItems.mutate([{ name, roomId: room?.id }])}
                            onAddToShoppingList={addItemsToShoppingList}
                            onQuantityChange={updateQuantity}
                        />
                    )}
                    {state.activeTab === 'notes' && (
                        <RoomNotesTab
                            notes={notes}
                            onAddNote={(content) => room && createRoomNote.mutate({ roomId: room.id, content })}
                        />
                    )}
                    {state.activeTab === 'projects' && (roomProjects.length > 0 ? (
                        roomProjects.map((project) => (
                            <ProjectListCard
                                dueDate={project.dueDate}
                                key={project.id}
                                numberOfTasks={project.numberOfTasks}
                                onPress={() => openProjectDetail(project)}
                                projectStatus={project.projectStatus}
                                projectStatusBackgroundClass={project.projectStatusBackgroundClass}
                                projectStatusTextClass={project.projectStatusTextClass}
                                room={project.room}
                                spentBudget={project.spentBudget}
                                tasksCompleted={project.tasksCompleted}
                                title={project.title}
                                totalBudget={project.totalBudget}
                            />
                        ))
                    ) : (
                        <View className="mt-6 items-center rounded-card border border-dashed border-hairline bg-white px-5 py-8">
                            <Text className="text-[32px]">{room?.icon ?? getRoomEmoji(state.roomName)}</Text>
                            <Text className="mt-3 font-serif-semibold text-[22px] text-ink">No projects for this room yet</Text>
                            <Text className="mt-1 text-center font-sans text-[14px] text-ink-muted">Add a project to plan work for {state.roomName}.</Text>
                            <Pressable
                                accessibilityRole="button"
                                className="mt-5 rounded-button bg-forest px-4 py-3"
                                onPress={() => router.push({ pathname: '/project-add', params: { room: state.roomName } })}
                            >
                                <Text className="font-sans-semibold text-[14px] text-white">Add project</Text>
                            </Pressable>
                        </View>
                    ))}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
