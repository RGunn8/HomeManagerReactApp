import { preview } from "radon-ide";
import { Pressable, Text } from "react-native";

type TodayBoxProps = {
    numberOfTasks: number;
    taskBoxType: TaskBoxType;
    className?: string;
    onClick?: () => void;
    };
export type TaskBoxType = "Overdue" | "This week" | "Upcoming" | "Low";

const todayBoxFontClasses: Record<TaskBoxType, string> = {
    Overdue: "text-overdue",
    "This week": "text-ink",
    Upcoming: "text-sage",
    Low: "text-clay",
};


export function TodayBox({ numberOfTasks, taskBoxType, className, onClick }: TodayBoxProps) {
    return (
        <Pressable className={`bg-card rounded-lg p-5 shadow-sm ${className ?? ""}`} onPress={onClick}>
            <Text className={`text-3xl font-serif ${todayBoxFontClasses[taskBoxType]} mb-1`}>{numberOfTasks}</Text>
    
            <Text className="text-md text-ink-muted font-sans">{taskBoxType}</Text>
    
        </Pressable>
    );
}

preview(<TodayBox numberOfTasks={5} taskBoxType="Low" className="w-1/3" onClick={() => console.log("Task Box clicked")} />);

