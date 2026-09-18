import { TitleText } from '@/components/title-text';
import { TaskListItem } from '@/task/component/task-list-item';
import { TodayBox } from '@/today/components/today-box';
import { TripInProgress } from '@/today/components/trip-in-progress';
import { LegendList } from '@legendapp/list/react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Task = {
    id: string;
    name: string;
    detail: string;
    checked: boolean;
};

type QueueItem =
    | { id: string; type: 'header'; title: string; section: 'overdue' | 'today' | 'upcoming' }
    | { id: string; type: 'task'; section: 'overdue' | 'today' | 'upcoming'; task: Task };

const initialTasks: QueueItem[] = [
    { id: 'overdue-header', type: 'header', title: 'Overdue items', section: 'overdue' },
    {
        id: 'replace-filter',
        type: 'task',
        section: 'overdue',
        task: { id: 'replace-filter', name: 'Replace HVAC filter', detail: 'Due yesterday', checked: false },
    },
    {
        id: 'sort-mail',
        type: 'task',
        section: 'overdue',
        task: { id: 'sort-mail', name: 'Sort the mail', detail: 'Due 2 days ago', checked: false },
    },
    { id: 'today-header', type: 'header', title: 'Today', section: 'today' },
    {
        id: 'wipe-counters',
        type: 'task',
        section: 'today',
        task: { id: 'wipe-counters', name: 'Wipe kitchen counters', detail: 'Every day', checked: false },
    },
    {
        id: 'water-plants',
        type: 'task',
        section: 'today',
        task: { id: 'water-plants', name: 'Water the plants', detail: 'Every 3 days', checked: true },
    },
    { id: 'upcoming-header', type: 'header', title: 'Upcoming', section: 'upcoming' },
    {
        id: 'laundry',
        type: 'task',
        section: 'upcoming',
        task: { id: 'laundry', name: 'Wash bedding', detail: 'Tomorrow', checked: false },
    },
    {
        id: 'clean-fridge',
        type: 'task',
        section: 'upcoming',
        task: { id: 'clean-fridge', name: 'Clean the fridge', detail: 'Saturday', checked: false },
    },
];

export function TodayScreen() {
    const [queue, setQueue] = useState(initialTasks);
    const tasks = queue.filter((item): item is Extract<QueueItem, { type: 'task' }> => item.type === 'task');
    const overdueCount = tasks.filter((item) => item.section === 'overdue' && !item.task.checked).length;
    const todayCount = tasks.filter((item) => item.section === 'today' && !item.task.checked).length;
    const upcomingCount = tasks.filter((item) => item.section === 'upcoming' && !item.task.checked).length;
    const lowQuantityCount = 1;
    const formattedDate = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    const updateTask = (taskId: string, checked: boolean) => {
        setQueue((currentQueue) =>
            currentQueue.map((item) =>
                item.type === 'task' && item.task.id === taskId
                    ? { ...item, task: { ...item.task, checked } }
                    : item,
            ),
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <View className="flex-1 px-screen">
            <LegendList<QueueItem>
                data={queue}
                keyExtractor={(item) => item.id}
                estimatedItemSize={70}
                contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
                ListHeaderComponent={
                    <View>
                        <Text className="font-sans text-[11.5px] text-clay">{formattedDate}</Text>
                        <TitleText title="Today items" />
                        <View className="mb-7 mt-4 flex-row gap-2">
                            <TodayBox numberOfTasks={overdueCount} taskBoxType="Overdue" className="w-[31%] p-3" />
                            <TodayBox numberOfTasks={todayCount + upcomingCount} taskBoxType="This week" className="w-[31%] p-3" />
                            <TodayBox numberOfTasks={lowQuantityCount} taskBoxType="Low" className="w-[31%] p-3" />
                        </View>
                        <TripInProgress
                            storeName="Walmart"
                            itemsChecked={3}
                            itemsTotal={10}
                            onResumeClick={() => undefined}
                        />
                        <Text className="mb-3 mt-8 font-serif-semibold text-[26px] text-ink">The queue</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    if (item.type === 'header') {
                        const headerClasses = item.section === 'overdue'
                            ? 'bg-error-tint text-overdue'
                            : 'bg-canvas text-ink-muted';

                        return (
                            <View className={`rounded-lg px-3 py-2 ${headerClasses}`}>
                                <Text className={`font-sans-semibold text-[16px] uppercase tracking-[1px] ${headerClasses.split(' ').slice(1).join(' ')}`}>
                                    {item.title}
                                </Text>
                            </View>
                        );
                    }

                    return (
                        <View>
                            <TaskListItem
                                taskName={item.task.name}
                                taskDetail={item.task.detail}
                                checked={item.task.checked}
                                divided
                                onChange={(checked) => updateTask(item.task.id, checked)}
                            />
                        </View>
                    );
                }}
            />
            </View>
        </SafeAreaView>
    );
}