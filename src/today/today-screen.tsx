import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { isInventoryItemLow } from '@/inventory/inventory-model';
import ProjectListCard from '@/project/compoment/project-list-card';
import { useProjects } from '@/project/hooks/use-projects';
import { openProjectDetail } from '@/project/project-navigation';
import { useAddToShoppingList, useShoppingTrips } from '@/shopping/hooks/use-shopping';
import { useTasks } from '@/task/hooks/use-tasks';
import { getTaskDateGroup, isTaskDueToday } from '@/task/task-model';
import { TripInProgress } from '@/today/components/trip-in-progress';

export function TodayScreen() {
    const { data: tasks = [] } = useTasks();
    const { data: inventoryItems = [] } = useInventory();
    const { data: trips = [] } = useShoppingTrips();
    const { data: projects = [] } = useProjects();
    const addToShoppingList = useAddToShoppingList();
    const allTodayTasks = tasks.filter((task) => isTaskDueToday(task));
    const todayCount = allTodayTasks.filter((task) => !task.checked).length;
    const overdueTasks = tasks.filter((task) => getTaskDateGroup(task) === 'overdue' && !task.checked);
    const overdueCount = overdueTasks.length;
    const nextTodayTask = allTodayTasks.find((task) => !task.checked);
    const todayCompletedCount = allTodayTasks.filter((task) => task.checked).length;
    const focusTaskCount = overdueCount + allTodayTasks.length;
    const lowInventoryItems = inventoryItems.filter(isInventoryItemLow);
    const activeTrip = trips.find((trip) => trip.status === 'active');
    const activeProjects = projects.filter((project) => project.projectStatus === 'In progress');
    const formattedDate = new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());

    const addInventoryItemToList = (item: typeof inventoryItems[number]) => {
        addToShoppingList.mutate([{
            name: item.name,
            quantity: item.trackingMode === 'level' ? 1 : Math.max(1, item.belowPar - item.quantity),
            price: item.price,
        }], 'Restock');
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <View className="flex-1 px-screen">
            <ScrollView className="flex-1" contentContainerClassName="pb-[120px] pt-2">
                <View>
                        <Text className="font-sans text-[11.5px] text-clay">{formattedDate}</Text>
                        <View className="flex-row items-center justify-between">
                            <TitleText title="Your day" />
                            <TopBarButton label="Settings" onPress={() => router.push('/settings')} />
                        </View>
                        <View className="mb-5 mt-4 rounded-2xl bg-forest p-5">
                            <Text className="font-sans-semibold text-[12px] uppercase tracking-[1.4px] text-cream/70">Today&apos;s focus</Text>
                            <Text className="mt-2 font-serif-semibold text-[27px] leading-8 text-cream">
                                {tasks.length === 0
                                    ? 'No tasks yet'
                                    : overdueCount > 0
                                        ? `${overdueCount} overdue ${overdueCount === 1 ? 'task' : 'tasks'}`
                                        : todayCount > 0
                                        ? `${todayCount} ${todayCount === 1 ? 'thing' : 'things'} left to do`
                                        : allTodayTasks.length > 0 ? 'Today is complete' : 'Nothing urgent today'}
                            </Text>
                            <Text className="mt-1 font-sans text-[14px] text-cream/75">
                                {tasks.length === 0
                                    ? 'Add a task to start planning your day.'
                                    : overdueCount > 0
                                        ? `Overdue: ${overdueTasks[0].name}${todayCount > 0 ? ` · ${todayCount} due today` : ''}`
                                    : nextTodayTask ? `Next up: ${nextTodayTask.name}` : allTodayTasks.length > 0 ? `${todayCompletedCount} of ${allTodayTasks.length} complete` : 'A clear day is a good day.'}
                            </Text>
                            {focusTaskCount > 0 ? (
                                <View className="mt-4 h-2 overflow-hidden rounded-full bg-cream/20">
                                    <View className="h-full rounded-full bg-clay" style={{ width: `${(todayCompletedCount / focusTaskCount) * 100}%` }} />
                                </View>
                            ) : null}
                            <View className="mt-4 flex-row gap-2">
                                <Pressable
                                    accessibilityRole="button"
                                    className="flex-1 items-center rounded-button bg-clay-light px-3 py-3"
                                    onPress={() => router.push(overdueCount > 0
                                        ? { pathname: '/tasks', params: { filter: 'overdue' } }
                                        : { pathname: '/tasks', params: { filter: 'today' } })}
                                >
                                    <Text className="font-sans-semibold text-[14px] text-forest">{overdueCount > 0 ? 'Review overdue' : "Today's tasks"}</Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole="button"
                                    className="flex-1 items-center rounded-button border border-cream/40 px-3 py-3"
                                    onPress={() => router.push('/tasks')}
                                >
                                    <Text className="font-sans-semibold text-[14px] text-cream">View all tasks</Text>
                                </Pressable>
                            </View>
                        </View>
                        {activeTrip ? (
                            <View className="mb-5">
                                <Text className="mb-2 font-sans-semibold text-[12px] uppercase tracking-[1.4px] text-ink-muted">Continue where you left off</Text>
                                <TripInProgress
                                    storeName={activeTrip.title}
                                    itemsChecked={activeTrip.itemsPicked}
                                    itemsTotal={activeTrip.totalItems}
                                    onResumeClick={() => router.push({ pathname: '/shopping-trip', params: { tripId: activeTrip.id } })}
                                />
                            </View>
                        ) : null}
                        {activeProjects.length > 0 ? (
                            <View className="mt-5">
                                <Text className="mb-2 font-serif-semibold text-[26px] text-ink">Projects in progress</Text>
                                {activeProjects.map((project) => (
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
                                ))}
                            </View>
                        ) : null}
                        {lowInventoryItems.length > 0 ? (
                            <View className="mt-5 gap-2">
                                <View className="flex-row items-center justify-between">
                                    <Text className="font-serif-semibold text-[24px] text-ink">Running low</Text>
                                    <Pressable
                                        accessibilityRole="button"
                                        className="rounded-button bg-sage-tint px-3 py-2"
                                        onPress={() => router.push({ pathname: '/inventory-list', params: { filter: 'low' } })}
                                    >
                                        <Text className="font-sans-semibold text-[13px] text-forest">View inventory</Text>
                                    </Pressable>
                                </View>
                                <View className="overflow-hidden rounded-card border border-hairline bg-white">
                                    {lowInventoryItems.map((item, index) => {
                                        const existingTrip = trips.find((trip) => trip.status !== 'past'
                                            && trip.items?.some((entry) => entry.name.trim().toLowerCase() === item.name.trim().toLowerCase()));

                                        return (
                                            <View
                                                className={`flex-row items-center gap-3 px-4 py-3 ${index < lowInventoryItems.length - 1 ? 'border-b border-row-divider' : ''}`}
                                                key={item.id}
                                            >
                                                <View className="min-w-0 flex-1">
                                                    <Text className="font-sans-semibold text-[15px] text-ink">{item.name}</Text>
                                                    <Text className="mt-0.5 font-sans text-[13px] text-ink-muted">
                                                        {item.trackingMode === 'level' ? `Running low · no spares` : `${item.quantity} in stock · below par ${item.belowPar}`}
                                                    </Text>
                                                    {existingTrip ? (
                                                        <Text className="mt-0.5 font-sans text-[12px] text-forest">On {existingTrip.title}</Text>
                                                    ) : null}
                                                </View>
                                                <Pressable
                                                    accessibilityLabel={`${existingTrip ? 'Added' : 'Add'} ${item.name} ${existingTrip ? 'to' : 'to'} shopping list`}
                                                    accessibilityRole="button"
                                                    accessibilityState={{ disabled: Boolean(existingTrip) }}
                                                    className={`min-h-11 items-center justify-center rounded-button px-3 ${existingTrip ? 'bg-sage-tint' : 'bg-forest'}`}
                                                    disabled={Boolean(existingTrip)}
                                                    onPress={() => addInventoryItemToList(item)}
                                                >
                                                    <Text className={`font-sans-semibold text-[13px] ${existingTrip ? 'text-forest' : 'text-white'}`}>
                                                        {existingTrip ? 'Added' : 'Add to list'}
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ) : null}
                </View>
            </ScrollView>
            </View>
        </SafeAreaView>
    );
}