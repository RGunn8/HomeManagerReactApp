import { Pressable,Text, View} from "react-native";
import { preview } from "radon-ide";

export function TodayTaskListHeader({ title, titleColor, backgroundColor }: { title: string; titleColor: string; backgroundColor: string;}) {
    return (
        <View className={`flex flex-row justify-between items-center bg-${backgroundColor} w-full`} >
            <Text className={`text-lg font-serif text-${titleColor}`}>{title}</Text>
         
        </View>
    );
}

preview(<TodayTaskListHeader title="Today's Tasks" titleColor="ink" backgroundColor="cream-tint" />);

