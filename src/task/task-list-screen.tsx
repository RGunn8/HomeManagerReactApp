import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDatePickerField } from '@/components/calendar-date-picker-field';
import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { TaskListItem } from '@/task/component/task-list-item';
import { useDeleteTasks, useScheduleTasks, useSetTaskCompleted, useTasks } from '@/task/hooks/use-tasks';
import { getTaskDateGroup, isTaskDueToday, type TaskDateFilter } from '@/task/task-model';

const filters: { id: TaskDateFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'this-week', label: 'This week' },
    { id: 'no-date', label: 'No date' },
];
const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'open', label: 'Open' },
    { id: 'completed', label: 'Completed' },
] as const;
type TaskStatusFilter = typeof statusFilters[number]['id'];

export function TaskListScreen() {
    const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();
    const { data: tasks = [] } = useTasks();
    const setCompleted = useSetTaskCompleted();
    const deleteTasks = useDeleteTasks();
    const scheduleTasks = useScheduleTasks();
    const [searchText, setSearchText] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<TaskStatusFilter>('all');
    const [activeFilter, setActiveFilter] = useState<TaskDateFilter>(
        filters.some((filter) => filter.id === initialFilter) ? initialFilter as TaskDateFilter : 'all',
    );
    const [ascending, setAscending] = useState(true);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(() => new Set());
    const [isSchedulingTasks, setIsSchedulingTasks] = useState(false);
    const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds((current) => {
            const next = new Set(current);
            if (next.has(taskId)) next.delete(taskId);
            else next.add(taskId);
            return next;
        });
    };

    const toggleSelectionMode = () => {
        setSelectionMode((current) => !current);
        setSelectedTaskIds(new Set());
        setIsSchedulingTasks(false);
    };

    const confirmScheduleSelectedTasks = () => {
        if (!scheduleDate) return;
        scheduleTasks.mutate({ taskIds: [...selectedTaskIds], dueDate: scheduleDate });
        setSelectedTaskIds(new Set());
        setSelectionMode(false);
        setIsSchedulingTasks(false);
        setScheduleDate(null);
    };

    const deleteSelectedTasks = () => {
        deleteTasks.mutate([...selectedTaskIds]);
        setSelectedTaskIds(new Set());
        setSelectionMode(false);
    };

    const visibleTasks = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        return tasks
            .filter((task) => {
                const matchesSearch = `${task.name} ${task.room ?? ''}`.toLowerCase().includes(query);
                const matchesFilter = activeFilter === 'all'
                    || (activeFilter === 'today' ? isTaskDueToday(task) : getTaskDateGroup(task) === activeFilter);
                const matchesStatus = activeStatusFilter === 'all'
                    || (activeStatusFilter === 'completed' ? task.checked : !task.checked);
                return matchesSearch && matchesFilter && matchesStatus;
            })
            .sort((first, second) => {
                if (!first.dueDate && !second.dueDate) return first.name.localeCompare(second.name);
                if (!first.dueDate) return 1;
                if (!second.dueDate) return -1;
                const difference = new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime();
                return ascending ? difference : -difference;
            });
    }, [activeFilter, activeStatusFilter, ascending, searchText, tasks]);

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView className="flex-1" contentContainerClassName={`gap-4 px-screen pt-2 ${selectionMode && selectedTaskIds.size > 0 ? 'pb-32' : 'pb-28'}`} keyboardShouldPersistTaps="handled">
                    <View className="flex-row items-center justify-between">
                        <TopBarButton label="Back" onPress={() => router.back()} />
                        <TitleText title="Tasks" />
                        <Pressable accessibilityRole="button" accessibilityState={{ selected: selectionMode }} className="rounded-button bg-sage-tint px-3 py-2" onPress={toggleSelectionMode}>
                            <Text className="font-sans-semibold text-[13px] text-forest">{selectionMode ? 'Cancel' : 'Select'}</Text>
                        </Pressable>
                    </View>
                    <TextInput
                        accessibilityLabel="Search tasks"
                        autoCapitalize="none"
                        className="h-[50px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint"
                        onChangeText={setSearchText}
                        placeholder="Search tasks"
                        returnKeyType="search"
                        value={searchText}
                    />
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
                    <ScrollView horizontal contentContainerClassName="gap-2" showsHorizontalScrollIndicator={false}>
                        {filters.map((filter) => (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ selected: activeFilter === filter.id }}
                                className={`rounded-full border px-4 py-2 ${activeFilter === filter.id ? 'border-forest bg-forest' : 'border-hairline bg-white'}`}
                                key={filter.id}
                                onPress={() => setActiveFilter(filter.id)}
                            >
                                <Text className={`font-sans-semibold text-[14px] ${activeFilter === filter.id ? 'text-white' : 'text-ink-muted'}`}>
                                    {filter.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <View className="flex-row items-center justify-between">
                        <Text className="font-sans text-[14px] text-ink-muted">{visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}</Text>
                        <Pressable accessibilityRole="button" className="rounded-button bg-sage-tint px-3 py-2" onPress={() => setAscending((current) => !current)}>
                            <Text className="font-sans-semibold text-[13px] text-forest">Due date {ascending ? '↑' : '↓'}</Text>
                        </Pressable>
                    </View>
                    {selectionMode && selectedTaskIds.size > 0 && isSchedulingTasks ? (
                        <View className="gap-3 rounded-card border border-hairline bg-white p-4">
                            <Text className="font-sans-semibold text-[14px] text-ink">Schedule {selectedTaskIds.size} selected {selectedTaskIds.size === 1 ? 'task' : 'tasks'}</Text>
                            <CalendarDatePickerField label="Choose a due date" onChange={setScheduleDate} value={scheduleDate} />
                            <View className="flex-row gap-2">
                                <Pressable
                                    accessibilityRole="button"
                                    className="flex-1 items-center rounded-button border border-hairline bg-white px-4 py-3"
                                    onPress={() => setIsSchedulingTasks(false)}
                                >
                                    <Text className="font-sans-semibold text-[15px] text-ink-muted">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole="button"
                                    className={`flex-1 items-center rounded-button px-4 py-3 ${scheduleDate ? 'bg-forest' : 'bg-sage-tint'}`}
                                    disabled={!scheduleDate}
                                    onPress={confirmScheduleSelectedTasks}
                                >
                                    <Text className="font-sans-semibold text-[15px] text-white">Confirm date</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}
                    {visibleTasks.length ? (
                        <View className="overflow-hidden rounded-card border border-hairline bg-white">
                            {visibleTasks.map((task) => {
                                const taskRow = (
                                    <TaskListItem
                                        checked={task.checked}
                                        divided
                                        hideCheckbox={selectionMode}
                                        selected={selectionMode && selectedTaskIds.has(task.id)}
                                        onChange={selectionMode ? undefined : (checked) => setCompleted.mutate({ taskId: task.id, checked })}
                                        onClick={selectionMode ? () => toggleTaskSelection(task.id) : () => router.push({
                                            pathname: '/task-detail',
                                            params: {
                                                taskId: task.id,
                                                taskName: task.name,
                                                taskDate: task.dueDate,
                                                taskDetail: task.detail?.replace(/^Every\s+/i, ''),
                                                roomName: task.room,
                                                note: task.notes,
                                            },
                                        })}
                                        taskDate={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : undefined}
                                        taskDetail={task.detail?.replace(/^Every\s+/i, '')}
                                        taskName={task.name}
                                    />
                                );
                                return (
                                    <View key={task.id}>
                                        {selectionMode ? taskRow : (
                                            <ReanimatedSwipeable
                                                overshootRight={false}
                                                renderRightActions={() => (
                                                    <Pressable
                                                        accessibilityLabel={`Delete ${task.name}`}
                                                        accessibilityRole="button"
                                                        className="h-full w-[88px] items-center justify-center bg-overdue"
                                                        onPress={() => deleteTasks.mutate([task.id])}
                                                    >
                                                        <Text className="font-sans-semibold text-[14px] text-white">Delete</Text>
                                                    </Pressable>
                                                )}
                                                rightThreshold={36}
                                            >
                                                {taskRow}
                                            </ReanimatedSwipeable>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="rounded-card border border-dashed border-hairline px-4 py-8 text-center font-sans text-[15px] text-ink-muted">
                            No tasks match this filter.
                        </Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
            {selectionMode && selectedTaskIds.size > 0 && !isSchedulingTasks ? (
                <View className="absolute inset-x-0 bottom-0 flex-row items-center justify-between gap-3 border-t border-hairline bg-white px-6 py-4">
                    <Text className="font-sans-semibold text-[14px] text-ink">{selectedTaskIds.size} selected</Text>
                    <View className="flex-row gap-2">
                        <Pressable
                            accessibilityRole="button"
                            className="rounded-button bg-sage-tint px-4 py-2"
                            onPress={() => setIsSchedulingTasks(true)}
                        >
                            <Text className="font-sans-semibold text-[14px] text-forest">Schedule</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            className="rounded-button bg-overdue px-4 py-2"
                            onPress={deleteSelectedTasks}
                        >
                            <Text className="font-sans-semibold text-[14px] text-white">Delete</Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}
        </SafeAreaView>
    );
}
