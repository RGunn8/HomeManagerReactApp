import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDatePickerField } from '@/components/calendar-date-picker-field';
import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { toApiDate } from '@/lib/dates';
import { useApiRooms } from '@/room/hooks/use-rooms';
import { useUpdateTask } from '@/task/hooks/use-tasks';
import { parseRecurrence } from '@/task/task-model';
type RepeatUnit = 'day' | 'week' | 'month' | 'year';

function parseDate(value?: string) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(date: Date) {
    const due = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((due - today.getTime()) / 86_400_000);
}

export function TaskDetailScreen() {
    const { taskId, taskName: taskNameParam, taskDate: taskDateParam, taskDetail: taskDetailParam, roomName: roomNameParam, note: noteParam } = useLocalSearchParams<{
        taskName?: string;
        taskDate?: string;
        taskDetail?: string;
        roomName?: string;
        note?: string;
        taskId?: string;
    }>();
    const { data: rooms = [] } = useApiRooms();
    const roomOptions = rooms.map((room) => room.name);
    const updateTaskMutation = useUpdateTask();
    const initialDate = parseDate(taskDateParam);
    const [taskName, setTaskName] = useState(taskNameParam ?? 'Task');
    const [dueDate, setDueDate] = useState<Date | null>(initialDate);
    const [repeats, setRepeats] = useState(Boolean(taskDetailParam));
    const [repeatCount, setRepeatCount] = useState(taskDetailParam?.match(/\d+/)?.[0] ?? '1');
    const [repeatUnit, setRepeatUnit] = useState<RepeatUnit>((taskDetailParam?.match(/day|week|month|year/i)?.[0].toLowerCase() as RepeatUnit | undefined) ?? 'week');
    const [roomName, setRoomName] = useState(roomNameParam ?? '');
    const [isChoosingRoom, setIsChoosingRoom] = useState(false);
    const [note, setNote] = useState(noteParam ?? '');
    const [isEditingName, setIsEditingName] = useState(false);

    const dueStatus = useMemo(() => {
        if (!dueDate) return { text: 'No due date', className: 'bg-clay-tint text-clay' };
        const remainingDays = daysUntil(dueDate);
        if (remainingDays < 0) {
            const lateDays = Math.abs(remainingDays);
            return { text: `${lateDays} ${lateDays === 1 ? 'day' : 'days'} overdue`, className: 'bg-error-tint text-overdue' };
        }
        if (remainingDays === 0) return { text: 'Due today', className: 'bg-clay-tint text-clay' };
        return { text: `Due in ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`, className: 'bg-sage-tint text-forest' };
    }, [dueDate]);

    const updateTask = () => {
        if (!taskId) {
            router.back();
            return;
        }

        const roomId = rooms.find((room) => room.name === roomName)?.roomId;
        updateTaskMutation.mutate({
            taskId,
            title: taskName.trim() || taskNameParam || 'Task',
            ...(dueDate ? { dueDate: toApiDate(dueDate) } : {}),
            ...parseRecurrence(repeats ? `${repeatCount || 1} ${repeatUnit}` : undefined),
            ...(roomId ? { roomId } : {}),
            notes: note.trim() || null,
        });
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView className="flex-1" contentContainerClassName="gap-6 px-screen pb-12 pt-2" keyboardShouldPersistTaps="handled">
                    <View className="h-12 flex-row items-center justify-between">
                        <TopBarButton label="Back" onPress={() => router.back()} />
                        <TopBarButton label="Update" onPress={updateTask} />
                    </View>

                    <View className="gap-3">
                        <View className={`self-start rounded-full px-3 py-1 ${dueStatus.className}`}>
                            <Text className={`font-sans-semibold text-[13px] ${dueStatus.className.split(' ').at(-1)}`}>{dueStatus.text}</Text>
                        </View>
                        {isEditingName ? (
                            <TextInput
                                accessibilityLabel="Task name"
                                autoFocus
                                className="h-[52px] rounded-input border border-hairline bg-white px-4 font-serif-semibold text-[30px] text-ink"
                                onChangeText={setTaskName}
                                onSubmitEditing={() => setIsEditingName(false)}
                                returnKeyType="done"
                                value={taskName}
                            />
                        ) : (
                            <Pressable accessibilityRole="button" onPress={() => setIsEditingName(true)}>
                                <TitleText title={taskName} />
                            </Pressable>
                        )}
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Due date</Text>
                        <CalendarDatePickerField label="Choose due date" onChange={setDueDate} value={dueDate} />
                    </View>

                    <View className="gap-3">
                        <Text className="font-sans-semibold text-[14px] text-ink">Repeats</Text>
                        <View className="flex-row gap-2">
                            <Pressable accessibilityRole="button" accessibilityState={{ selected: !repeats }} className={`flex-1 items-center rounded-button py-2 ${!repeats ? 'bg-forest' : 'bg-sage-tint'}`} onPress={() => setRepeats(false)}>
                                <Text className={`font-sans-semibold text-[14px] ${!repeats ? 'text-white' : 'text-ink-muted'}`}>Never</Text>
                            </Pressable>
                            <Pressable accessibilityRole="button" accessibilityState={{ selected: repeats }} className={`flex-1 items-center rounded-button py-2 ${repeats ? 'bg-forest' : 'bg-sage-tint'}`} onPress={() => setRepeats(true)}>
                                <Text className={`font-sans-semibold text-[14px] ${repeats ? 'text-white' : 'text-ink-muted'}`}>Every</Text>
                            </Pressable>
                        </View>
                        {repeats && (
                            <View className="flex-row items-center gap-2">
                                <TextInput accessibilityLabel="Repeat interval count" className="h-11 w-16 rounded-input border border-hairline bg-white px-2 text-center font-sans text-[15px] text-ink" keyboardType="number-pad" onChangeText={setRepeatCount} value={repeatCount} />
                                <View className="flex-1 flex-row gap-1">
                                    {(['day', 'week', 'month', 'year'] as RepeatUnit[]).map((unit) => (
                                        <Pressable accessibilityRole="button" accessibilityState={{ selected: repeatUnit === unit }} className={`flex-1 items-center rounded-button py-2 ${repeatUnit === unit ? 'bg-forest' : 'bg-sage-tint'}`} key={unit} onPress={() => setRepeatUnit(unit)}>
                                            <Text className={`font-sans text-[12px] ${repeatUnit === unit ? 'text-white' : 'text-ink-muted'}`}>{unit}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-sans-semibold text-[14px] text-ink">Room</Text>
                            <Pressable accessibilityRole="button" onPress={() => setIsChoosingRoom((current) => !current)}>
                                <Text className="font-sans-semibold text-[14px] text-forest">{isChoosingRoom ? 'Done' : 'Update room'}</Text>
                            </Pressable>
                        </View>
                        {isChoosingRoom ? (
                            <View className="flex-row flex-wrap gap-2">
                                {roomOptions.map((room) => (
                                    <Pressable accessibilityRole="button" accessibilityState={{ selected: roomName === room }} className={`rounded-full border px-4 py-2 ${roomName === room ? 'border-forest bg-forest' : 'border-hairline bg-white'}`} key={room} onPress={() => setRoomName(room)}>
                                        <Text className={`font-sans-semibold text-[14px] ${roomName === room ? 'text-white' : 'text-ink-muted'}`}>{room}</Text>
                                    </Pressable>
                                ))}
                                <Pressable accessibilityRole="button" className="rounded-full border border-dashed border-forest px-4 py-2" onPress={() => setRoomName('')}>
                                    <Text className="font-sans-semibold text-[14px] text-forest">No room</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Text className="font-sans text-[15px] text-ink-muted">{roomName || 'No room assigned'}</Text>
                        )}
                    </View>

                    <View className="gap-2">
                        <Text className="font-sans-semibold text-[14px] text-ink">Note</Text>
                        <TextInput accessibilityLabel="Task note" className="min-h-[110px] rounded-input border border-hairline bg-white px-4 py-3 font-sans text-[15px] text-ink placeholder:text-ink-faint" maxLength={300} multiline onChangeText={setNote} placeholder="Add a note" textAlignVertical="top" value={note} />
                        <Text className="text-right font-sans text-[12px] text-ink-muted">{note.length}/300</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
