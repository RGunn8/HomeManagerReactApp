import { Pressable, Text, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';

export type ProjectTask = {
    id: string;
    title: string;
    dueDate?: string;
    completed: boolean;
};

type ProjectTaskListItemProps = {
    task: ProjectTask;
    onToggle: (taskId: string, completed: boolean) => void;
};

export function ProjectTaskListItem({ task, onToggle }: ProjectTaskListItemProps) {
    return (
        <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 bg-white px-4 py-3"
            onPress={() => onToggle(task.id, !task.completed)}
        >
            <Checkbox
                accessibilityLabel={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}
                checked={task.completed}
                onChange={(completed) => onToggle(task.id, completed)}
            />
            <View className="flex-1 gap-1">
                <Text className={`font-sans-semibold text-[16px] ${task.completed ? 'text-ink-faint line-through' : 'text-ink'}`}>
                    {task.title}
                </Text>
                {task.dueDate ? <Text className="font-sans text-[13px] text-ink-muted">Due {task.dueDate}</Text> : null}
            </View>
        </Pressable>
    );
}
