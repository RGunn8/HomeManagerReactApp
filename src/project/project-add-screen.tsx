import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDatePickerField } from '@/components/calendar-date-picker-field';
import { ItemAutocompleteField } from '@/components/item-autocomplete-field';
import { TopBarButton } from '@/components/top-bar-button';
import { getRoomEmoji } from '@/constants/room-emojis';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { useCreateProject, useCreateProjectMaterial } from '@/project/hooks/use-projects';
import { useApiRooms, useCreateRoom } from '@/room/hooks/use-rooms';
import { useAddToShoppingList, useShoppingTrips } from '@/shopping/hooks/use-shopping';
import { useCreateTask } from '@/task/hooks/use-tasks';

type DraftTask = { id: string; title: string; dueDate?: Date };
type DraftMaterial = { id: string; name: string; quantity: number; price?: number; inventoryItemId?: string };


export function ProjectAddScreen() {
    const { room: roomParam } = useLocalSearchParams<{ room?: string }>();
    const createRoom = useCreateRoom();
    const createProject = useCreateProject();
    const createTask = useCreateTask();
    const createMaterial = useCreateProjectMaterial();
    const { data: inventoryItems = [] } = useInventory();
    const { data: apiRooms = [] } = useApiRooms();
    const { data: trips = [] } = useShoppingTrips();
    const addToShoppingList = useAddToShoppingList();
    const [projectName, setProjectName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState(roomParam ?? '');
    const [customRoom, setCustomRoom] = useState('');
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [budget, setBudget] = useState('');
    const [tasks, setTasks] = useState<DraftTask[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
    const [materials, setMaterials] = useState<DraftMaterial[]>([]);
    const [materialName, setMaterialName] = useState('');
    const [materialQuantity, setMaterialQuantity] = useState('1');
    const [materialPrice, setMaterialPrice] = useState('');
    const [selectedMaterialInventoryId, setSelectedMaterialInventoryId] = useState<string | null>(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const canSave = projectName.trim().length > 0;

    const roomOptions = [...new Set([...apiRooms.map((room) => room.name), roomParam?.trim(), customRoom.trim()].filter((room): room is string => Boolean(room)))];
    const existingInventoryMaterials = materials.filter((material) => Boolean(material.inventoryItemId));
    const newMaterials = materials.filter((material) => !material.inventoryItemId);

    const addTask = () => {
        const title = taskTitle.trim();
        if (!title) return;
        setTasks((current) => [...current, {
            id: `${Date.now()}`,
            title,
            dueDate: taskDueDate ?? undefined,
        }]);
        setTaskTitle('');
        setTaskDueDate(null);
        setIsAddingTask(false);
    };

    const addMaterial = () => {
        const name = materialName.trim();
        const quantity = Number(materialQuantity);
        const price = materialPrice.trim() ? Number(materialPrice) : undefined;
        if (!name || !Number.isInteger(quantity) || quantity < 1 || (price !== undefined && (!Number.isFinite(price) || price < 0))) return;
        const inventoryItem = inventoryItems.find((item) => item.id === selectedMaterialInventoryId)
            ?? inventoryItems.find((item) => item.name.trim().toLowerCase() === name.toLowerCase());
        setMaterials((current) => [...current, {
            id: `${Date.now()}`,
            name,
            quantity,
            ...(price !== undefined ? { price } : {}),
            ...(inventoryItem ? { inventoryItemId: inventoryItem.id } : {}),
        }]);
        setMaterialName('');
        setMaterialQuantity('1');
        setMaterialPrice('');
        setSelectedMaterialInventoryId(null);
        setIsAddingMaterial(false);
    };

    const addMaterialToList = (material: DraftMaterial) => {
        addToShoppingList.mutate(
            [{ name: material.name, quantity: material.quantity, price: material.price }],
            `${projectName.trim() || 'Project'} materials`,
        );
    };

    const addMaterialRows = (items: DraftMaterial[], showListAction: boolean) => items.map((material) => {
        const inventoryItem = inventoryItems.find((item) => item.id === material.inventoryItemId);
        const shoppingTrip = trips.find((trip) => trip.status !== 'past'
            && trip.items?.some((item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase()));

        return (
            <View className="gap-1 rounded-card border border-hairline bg-white px-4 py-3" key={material.id}>
                <View className="flex-row items-center justify-between">
                    <Text className="flex-1 font-sans-semibold text-[15px] text-ink">{material.name}</Text>
                    {material.price !== undefined ? <Text className="ml-3 font-sans text-[14px] text-ink-muted">${material.price.toFixed(2)}</Text> : null}
                </View>
                <Text className="font-sans text-[13px] text-ink-muted">
                    Needed {material.quantity} · In stock {inventoryItem?.quantity ?? 0}
                </Text>
                {showListAction ? shoppingTrip ? (
                    <Text className="font-sans text-[12px] text-forest">On {shoppingTrip.title}</Text>
                ) : (
                    <Pressable accessibilityRole="button" className="self-start rounded-button bg-sage-tint px-3 py-2" onPress={() => addMaterialToList(material)}>
                        <Text className="font-sans-semibold text-[13px] text-forest">Add to list</Text>
                    </Pressable>
                ) : null}
            </View>
        );
    });

    const saveProject = () => {
        if (!canSave) return;
        const roomName = selectedRoom.trim();
        const existingRoom = apiRooms.find((room) => room.name.trim().toLowerCase() === roomName.toLowerCase());
        const roomId = roomName
            ? existingRoom?.roomId ?? createRoom.mutate({ name: roomName, roomEmoji: getRoomEmoji(roomName) })
            : undefined;
        const parsedBudget = Number(budget);
        // Everything is queued in order, so the tasks and materials can use the project's temp id.
        const projectId = createProject.mutate({
            name: projectName.trim(),
            status: 'NOT_STARTED',
            ...(roomId ? { roomId } : {}),
            ...(targetDate ? { targetDate: targetDate.toISOString() } : {}),
            ...(budget.trim() && Number.isFinite(parsedBudget) ? { estimatedCost: parsedBudget } : {}),
        });
        // The create endpoint still ignores nested `tasks`, so tasks are created separately.
        tasks.forEach((task) => createTask.mutate({ name: task.title, dueDate: task.dueDate, projectId, roomId }));
        materials.forEach((material) => createMaterial.mutate({
            projectId,
            name: material.name,
            quantity: material.quantity,
            ...(material.price !== undefined ? { unitCost: material.price } : {}),
        }));
        router.replace({ pathname: '/project-detail', params: { projectId, title: projectName.trim() } });
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="gap-6 px-screen pb-12"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="h-14 flex-row items-center justify-between">
                        <TopBarButton label="Cancel" onPress={() => router.back()} />
                        <Text className="font-sans text-[16px] text-ink">New project</Text>
                        <TopBarButton disabled={!canSave} label="Save" onPress={saveProject} />
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Name</Text>
                        <TextInput
                            accessibilityLabel="Project name"
                            autoFocus
                            autoCapitalize="words"
                            className="h-[52px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                            onChangeText={setProjectName}
                            placeholder="Project name"
                            returnKeyType="next"
                            value={projectName}
                        />
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-sans-semibold text-[14px] text-ink">Room</Text>
                            <Pressable accessibilityRole="button" onPress={() => setIsAddingRoom((current) => !current)}>
                                <Text className="font-sans-semibold text-[14px] text-forest">+ Add room</Text>
                            </Pressable>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            {roomOptions.map((room) => (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: selectedRoom === room }}
                                    className={`rounded-full border px-4 py-2 ${selectedRoom === room ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                    key={room}
                                    onPress={() => setSelectedRoom(room)}
                                >
                                    <Text className={`font-sans-semibold text-[14px] ${selectedRoom === room ? 'text-white' : 'text-ink-muted'}`}>
                                        {room}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                        {isAddingRoom && (
                            <View className="flex-row gap-2">
                                <TextInput
                                    accessibilityLabel="New room name"
                                    autoFocus
                                    autoCapitalize="words"
                                    className="h-[46px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setCustomRoom}
                                    onSubmitEditing={() => {
                                        if (customRoom.trim()) setSelectedRoom(customRoom.trim());
                                        setIsAddingRoom(false);
                                    }}
                                    placeholder="Room name"
                                    returnKeyType="done"
                                    value={customRoom}
                                />
                                <Pressable
                                    accessibilityRole="button"
                                    className="items-center justify-center rounded-button bg-forest px-4"
                                    onPress={() => {
                                        if (customRoom.trim()) setSelectedRoom(customRoom.trim());
                                        setIsAddingRoom(false);
                                    }}
                                >
                                    <Text className="font-sans-semibold text-[14px] text-white">Add</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Target date</Text>
                        <CalendarDatePickerField label="Choose target date (optional)" onChange={setTargetDate} value={targetDate} />
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Total budget</Text>
                        <TextInput
                            accessibilityLabel="Project budget"
                            className="h-[52px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                            keyboardType="decimal-pad"
                            onChangeText={setBudget}
                            placeholder="Budget (optional)"
                            value={budget}
                        />
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-serif-semibold text-[22px] text-ink">Tasks</Text>
                            <Pressable accessibilityRole="button" className="rounded-button bg-sage-tint px-3 py-2" onPress={() => setIsAddingTask((current) => !current)}>
                                <Text className="font-sans-semibold text-[14px] text-forest">+ Add task</Text>
                            </Pressable>
                        </View>
                        {tasks.map((task) => (
                            <View className="flex-row items-center justify-between rounded-card border border-hairline bg-white px-4 py-3" key={task.id}>
                                <Text className="flex-1 font-sans-semibold text-[15px] text-ink">{task.title}</Text>
                                {task.dueDate ? <Text className="ml-3 font-sans text-[13px] text-ink-muted">Due {task.dueDate.toLocaleDateString()}</Text> : null}
                            </View>
                        ))}
                        {isAddingTask && (
                            <View className="gap-2 rounded-card border border-hairline bg-white p-3">
                                <TextInput
                                    accessibilityLabel="Task name"
                                    autoFocus
                                    className="h-[46px] rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setTaskTitle}
                                    onSubmitEditing={addTask}
                                    placeholder="Task name"
                                    returnKeyType="done"
                                    value={taskTitle}
                                />
                                <CalendarDatePickerField label="Due date (optional)" onChange={setTaskDueDate} value={taskDueDate} />
                                <Pressable accessibilityRole="button" className="self-end rounded-button bg-forest px-4 py-2" onPress={addTask}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Add task</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-serif-semibold text-[22px] text-ink">Inventory</Text>
                            <Pressable accessibilityRole="button" className="rounded-button bg-sage-tint px-3 py-2" onPress={() => setIsAddingMaterial((current) => !current)}>
                                <Text className="font-sans-semibold text-[14px] text-forest">+ Add item</Text>
                            </Pressable>
                        </View>
                        <View className="gap-2">
                            <Text className="font-sans-semibold text-[14px] text-ink">Existing inventory</Text>
                            {existingInventoryMaterials.length > 0
                                ? addMaterialRows(existingInventoryMaterials, false)
                                : <Text className="font-sans text-[13px] text-ink-muted">No existing items selected.</Text>}
                        </View>
                        <View className="gap-2">
                            <Text className="font-sans-semibold text-[14px] text-ink">New items</Text>
                            {newMaterials.length > 0
                                ? addMaterialRows(newMaterials, true)
                                : <Text className="font-sans text-[13px] text-ink-muted">No new items added.</Text>}
                        </View>
                        {isAddingMaterial && (
                            <View className="gap-2 rounded-card border border-hairline bg-white p-3">
                                <ItemAutocompleteField
                                    accessibilityLabel="Inventory item name"
                                    autoFocus
                                    onChangeText={(value) => {
                                        setMaterialName(value);
                                        setSelectedMaterialInventoryId(null);
                                    }}
                                    onSelectSuggestion={(suggestion) => {
                                        setMaterialName(suggestion.name);
                                        setSelectedMaterialInventoryId(suggestion.id);
                                        setMaterialPrice(suggestion.price === undefined ? '' : String(suggestion.price));
                                    }}
                                    placeholder="Search or add an item"
                                    suggestions={inventoryItems}
                                    value={materialName}
                                />
                                <View className="flex-row gap-2">
                                    <TextInput
                                        accessibilityLabel="Project item quantity"
                                        className="h-[46px] w-20 rounded-input border border-hairline bg-white px-3 text-center font-sans text-[15px] text-ink"
                                        keyboardType="number-pad"
                                        onChangeText={(value) => /^\d*$/.test(value) && setMaterialQuantity(value)}
                                        placeholder="Qty"
                                        value={materialQuantity}
                                    />
                                    <TextInput
                                        accessibilityLabel="Inventory item price"
                                        className="h-[46px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                        keyboardType="decimal-pad"
                                        onChangeText={setMaterialPrice}
                                        onSubmitEditing={addMaterial}
                                        placeholder="Price (optional)"
                                        returnKeyType="done"
                                        value={materialPrice}
                                    />
                                </View>
                                <Pressable accessibilityRole="button" className="items-center justify-center self-end rounded-button bg-forest px-4 py-2" onPress={addMaterial}>
                                    <Text className="font-sans-semibold text-[14px] text-white">Add item</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
