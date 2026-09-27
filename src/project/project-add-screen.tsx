import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDatePickerField } from '@/components/calendar-date-picker-field';
import { TopBarButton } from '@/components/top-bar-button';

type DraftTask = { id: string; title: string; dueDate?: Date };
type DraftMaterial = { id: string; name: string; price?: number };

const suggestedRooms = ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garden'];

export function ProjectAddScreen() {
    const [projectName, setProjectName] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [customRoom, setCustomRoom] = useState('');
    const [isAddingRoom, setIsAddingRoom] = useState(false);
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [budget, setBudget] = useState('');
    const [tasks, setTasks] = useState<DraftTask[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
    const [materials, setMaterials] = useState<DraftMaterial[]>([]);
    const [materialName, setMaterialName] = useState('');
    const [materialPrice, setMaterialPrice] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const canSave = projectName.trim().length > 0;

    const roomOptions = customRoom.trim() && !suggestedRooms.includes(customRoom.trim())
        ? [...suggestedRooms, customRoom.trim()]
        : suggestedRooms;

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
        const price = materialPrice.trim() ? Number(materialPrice) : undefined;
        if (!name || (price !== undefined && (!Number.isFinite(price) || price < 0))) return;
        setMaterials((current) => [...current, {
            id: `${Date.now()}`,
            name,
            ...(price !== undefined ? { price } : {}),
        }]);
        setMaterialName('');
        setMaterialPrice('');
        setIsAddingMaterial(false);
    };

    const saveProject = () => {
        if (!canSave) return;
        console.log('Save project:', {
            name: projectName.trim(),
            room: selectedRoom || undefined,
            targetDate: targetDate?.toISOString(),
            budget: budget.trim() ? Number(budget) : undefined,
            tasks: tasks.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString() })),
            materials,
        });
        router.back();
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
                        {materials.map((material) => (
                            <View className="flex-row items-center justify-between rounded-card border border-hairline bg-white px-4 py-3" key={material.id}>
                                <Text className="flex-1 font-sans-semibold text-[15px] text-ink">{material.name}</Text>
                                {material.price !== undefined ? <Text className="ml-3 font-sans text-[14px] text-ink-muted">${material.price.toFixed(2)}</Text> : null}
                            </View>
                        ))}
                        {isAddingMaterial && (
                            <View className="gap-2 rounded-card border border-hairline bg-white p-3">
                                <TextInput
                                    accessibilityLabel="Inventory item name"
                                    autoFocus
                                    className="h-[46px] rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                                    onChangeText={setMaterialName}
                                    onSubmitEditing={addMaterial}
                                    placeholder="Item name"
                                    returnKeyType="done"
                                    value={materialName}
                                />
                                <View className="flex-row gap-2">
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
                                    <Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={addMaterial}>
                                        <Text className="font-sans-semibold text-[14px] text-white">Add</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
