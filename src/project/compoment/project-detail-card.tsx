import { Pressable, Text, View } from 'react-native';


type ProjectDetailCardProps = {
    numberOfTasks: number;
    tasksCompleted: number;
    totalBudget?: number;
    spentBudget?: number;
    nextUpTasks?: string; 
    nextUpTasksDueDate?: string; 
    onEditBudget?: () => void;
};

export default function ProjectDetailCard({numberOfTasks, tasksCompleted, totalBudget, spentBudget, nextUpTasks, nextUpTasksDueDate, onEditBudget}: ProjectDetailCardProps) {
    const progress = numberOfTasks > 0
        ? Math.min(100, Math.max(0, (tasksCompleted / numberOfTasks) * 100))
        : 0;

    return (
        <View className='m-2 w-full flex-col rounded-lg bg-white p-4 shadow-sm'>
            <View className='flex-row items-center justify-between'>
                <Text className='font-sans-semibold text-[15px] text-ink'>Tasks completed</Text>
                <Text className='font-sans-semibold text-[15px] text-ink'>
                    {Math.max(0, tasksCompleted)} / {Math.max(0, numberOfTasks)} · {Math.round(progress)}%
                </Text>
            </View>
            <View
                accessibilityRole='progressbar'
                accessibilityValue={{min: 0, max: 100, now: progress}}
                className='mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas'
            >
                <View className='h-full rounded-full bg-forest' style={{width: `${progress}%`}} />
            </View>

            <View className='my-4 h-px w-full bg-row-divider' />

            <View className='flex-row items-center justify-between'>
                <Text className='font-serif-semibold text-[20px] text-ink'>Project details</Text>
                {onEditBudget ? (
                    <Pressable accessibilityRole='button' className='rounded-button px-2 py-2' onPress={onEditBudget}>
                        <Text className='font-sans-semibold text-[14px] text-forest'>Edit budget</Text>
                    </Pressable>
                ) : null}
            </View>
            <View className='mt-3 flex-row justify-between'>
                <Text className='font-sans text-[14px] text-ink-muted'>Budget spent</Text>
                <Text className='font-sans-semibold text-[14px] text-ink'>
                    ${spentBudget ?? 0} / ${totalBudget ?? 0}
                </Text>
            </View>
            {nextUpTasks ? (
                <View className='mt-3 flex-row justify-between gap-4'>
                    <Text className='flex-1 font-sans text-[14px] text-ink-muted'>Next up: {nextUpTasks}</Text>
                    {nextUpTasksDueDate ? (
                        <Text className='font-sans text-[14px] text-ink-muted'>{nextUpTasksDueDate}</Text>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}