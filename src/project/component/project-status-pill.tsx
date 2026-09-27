import { Text, View } from 'react-native';

export type ProjectStatus = 'In progress' | 'Planning' | 'Completed' | 'On hold';
export type ProjectStatusTextClass = 'text-forest' | 'text-clay' | 'text-overdue';
export type ProjectStatusBackgroundClass = 'bg-sage-tint' | 'bg-clay-tint' | 'bg-error-tint';

type ProjectStatusPillProps = {
    status: ProjectStatus;
    textClass: ProjectStatusTextClass;
    backgroundClass: ProjectStatusBackgroundClass;
};

export function ProjectStatusPill({ status, textClass, backgroundClass }: ProjectStatusPillProps) {
    return (
        <View className={`items-center justify-center rounded-full px-3 py-1 ${backgroundClass}`}>
            <Text className={`text-[12px] font-sans-semibold ${textClass}`}>{status}</Text>
        </View>
    );
}
