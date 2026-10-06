import { AddTasks, type AddedTask } from '@/task/component/add-tasks';
import { View } from 'react-native';

type RoomTasksTabProps = {
    tasks: AddedTask[];
    roomName?: string;
    onAddTask: (task: AddedTask) => void;
    onTaskCheckedChange: (task: AddedTask, checked: boolean) => void;
};

export function RoomTasksTab({ tasks, roomName, onAddTask, onTaskCheckedChange }: RoomTasksTabProps) {
    return (
        <View className="mt-6 gap-3">
            <AddTasks onAddTask={onAddTask} onTaskCheckedChange={onTaskCheckedChange} roomName={roomName} tasks={tasks} />
        </View>
    );
}
