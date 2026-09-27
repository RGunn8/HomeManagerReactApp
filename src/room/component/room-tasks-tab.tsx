import { AddTasks, type AddedTask } from '@/task/component/add-tasks';
import { View } from 'react-native';

type RoomTasksTabProps = {
    initialTasks: AddedTask[];
    onTasksChange: (tasks: AddedTask[]) => void;
};

export function RoomTasksTab({ initialTasks, onTasksChange }: RoomTasksTabProps) {
    return (
        <View className="mt-6 gap-3">
            <AddTasks initialTasks={initialTasks} onTasksChange={onTasksChange} />
        </View>
    );
}
