import { Checkbox } from '@/components/checkbox';
import { Pressable, Text, View } from 'react-native';

export function TaskListItem({ taskName, taskDetail, checked, onChange, onClick, divided }: { taskName: string; taskDetail?: string; checked: boolean; onChange: (checked: boolean) => void; onClick?: () => void; divided?: boolean }) {
  return (
    <Pressable className={`flex-row w-full items-center gap-3 bg-card px-4 py-3 ${divided ? 'border-b border-row-divider' : 'rounded-lg border border-hairline'}`} onPress={onClick}>
      <Checkbox accessibilityLabel={`Mark ${taskName} complete`} checked={checked} onChange={onChange} />
      <View className="flex-1 gap-1">
        <Text className="font-sans-semibold text-[18px] text-ink">{taskName}</Text>
        {taskDetail ? <Text className="font-sans text-[14px] text-ink-muted">Every {taskDetail}</Text> : null}
      </View>
    </Pressable>
  );
}