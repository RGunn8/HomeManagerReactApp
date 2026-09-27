import { useState } from 'react';
import { View } from 'react-native';

import { AddTaskListItem } from '@/task/component/add-task-list-item';
import { TaskListItem } from '@/task/component/task-list-item';
import { parseNaturalLanguageTask, type ParsedTask } from '@/task/parse-task';

type IntervalUnit = 'day' | 'week' | 'month' | 'year';

export type AddedTask = ParsedTask & {
    checked: boolean;
    date?: string;
};

type AddTasksProps = {
    initialTasks?: AddedTask[];
    onTasksChange?: (tasks: AddedTask[]) => void;
};

export function AddTasks({ initialTasks = [], onTasksChange }: AddTasksProps) {
    const [tasks, setTasks] = useState<AddedTask[]>(initialTasks);
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
        const naturalLanguageTask = repeats && intervalCount.trim()
            ? `${taskTitle} every ${intervalCount} ${intervalUnit}`
            : taskTitle;
        const parsedTask = parseNaturalLanguageTask(naturalLanguageTask);

        if (!parsedTask) {
            return;
        }

        updateTasks((currentTasks) => [...currentTasks, {
            ...parsedTask,
            checked: false,
            date: scheduledDate ? scheduledDate.toLocaleDateString() : undefined,
        }]);
        setTaskTitle('');
        setIntervalCount('');
        setRepeats(false);
        setScheduledDate(null);
    };

    const updateTaskChecked = (index: number, checked: boolean) => {
        updateTasks((currentTasks) => currentTasks.map((task, taskIndex) => taskIndex === index ? { ...task, checked } : task));
    };

    return (
        <View className="gap-3">
            {tasks.map((task, index) => (
                <TaskListItem
                    checked={task.checked}
                    divided
                    key={`${task.name}-${index}`}
                    onChange={(checked) => updateTaskChecked(index, checked)}
                    taskDate={task.date}
                    taskDetail={task.detail}
                    taskName={task.name}
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
