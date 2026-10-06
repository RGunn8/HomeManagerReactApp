import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AddTaskListItem } from '@/task/component/add-task-list-item';
import { TaskListItem } from '@/task/component/task-list-item';
import { parseNaturalLanguageTask, type ParsedTask } from '@/task/parse-task';

type IntervalUnit = 'day' | 'week' | 'month' | 'year';

export type AddedTask = ParsedTask & {
    id?: string;
    notes?: string;
    checked: boolean;
    date?: string;
    dueDate?: Date;
};

type AddTasksProps = {
    initialTasks?: AddedTask[];
    roomName?: string;
    onTasksChange?: (tasks: AddedTask[]) => void;
    /** Pass `tasks` with the callbacks below to let the parent own the list (e.g. tasks saved to the API). */
    tasks?: AddedTask[];
    onAddTask?: (task: AddedTask) => void;
    onTaskCheckedChange?: (task: AddedTask, checked: boolean) => void;
};

export function AddTasks({ initialTasks = [], roomName, onTasksChange, tasks: controlledTasks, onAddTask, onTaskCheckedChange }: AddTasksProps) {
    const [localTasks, setTasks] = useState<AddedTask[]>(initialTasks);
    const tasks = controlledTasks ?? localTasks;
    const [taskTitle, setTaskTitle] = useState('');
    const [intervalCount, setIntervalCount] = useState('');
    const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('day');
    const [repeats, setRepeats] = useState(false);
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

    const updateTasks = (update: (currentTasks: AddedTask[]) => AddedTask[]) => {
        setTasks((currentTasks) => {
            const nextTasks = update(currentTasks);
            onTasksChange?.(nextTasks);
            return nextTasks;
        });
    };

    const addTask = () => {
        const trimmedTitle = taskTitle.trim();
        if (!trimmedTitle) {
            return;
        }

        const naturalLanguageTask = repeats && intervalCount.trim()
            ? `${trimmedTitle} every ${intervalCount} ${intervalUnit}`
            : trimmedTitle;
        const parsedTask = parseNaturalLanguageTask(naturalLanguageTask);

        if (!parsedTask) {
            return;
        }

        const newTask: AddedTask = {
            ...parsedTask,
            checked: false,
            date: scheduledDate ? scheduledDate.toLocaleDateString() : undefined,
            dueDate: scheduledDate ?? undefined,
        };
        if (onAddTask) {
            onAddTask(newTask);
        } else {
            updateTasks((currentTasks) => [...currentTasks, newTask]);
        }
        setTaskTitle('');
        setIntervalCount('');
        setRepeats(false);
        setScheduledDate(null);
    };

    const updateTaskChecked = (index: number, checked: boolean) => {
        if (onTaskCheckedChange) {
            onTaskCheckedChange(tasks[index], checked);
            return;
        }
        updateTasks((currentTasks) => currentTasks.map((task, taskIndex) => taskIndex === index ? { ...task, checked } : task));
    };

    return (
        <View className="gap-3">
            {tasks.map((task, index) => (
                <TaskListItem
                    checked={task.checked}
                    divided
                    key={task.id ?? `${task.name}-${index}`}
                    onChange={(checked) => updateTaskChecked(index, checked)}
                    taskDate={task.date}
                    taskDetail={task.detail}
                    taskName={task.name}
                    onClick={() => router.push({
                        pathname: '/task-detail',
                        params: {
                            taskId: task.id,
                            taskName: task.name,
                            taskDate: task.dueDate?.toISOString() ?? task.date,
                            taskDetail: task.detail,
                            note: task.notes,
                            roomName,
                        },
                    })}
                />
            ))}
            <AddTaskListItem
                intervalCount={intervalCount}
                intervalUnit={intervalUnit}
                repeats={repeats}
                scheduledDate={scheduledDate}
                onIntervalCountChange={setIntervalCount}
                onIntervalUnitChange={setIntervalUnit}
                onRepeatsChange={(value) => {
                    setRepeats(value);
                    if (!value) {
                        setIntervalCount('');
                    }
                }}
                onScheduledDateChange={setScheduledDate}
                onSubmitEditing={addTask}
                onTaskTitleChange={setTaskTitle}
                taskTitle={taskTitle}
            />
        </View>
    );
}
