import { Checkbox } from '@/components/checkbox';
import { Pressable, Text, View } from 'react-native';

export function TaskListItem({ taskName, taskDetail, taskDate, checked, onChange, onClick, divided, checkboxLabel, hideCheckbox, selected }: { taskName: string; taskDetail?: string; taskDate?: string; checked: boolean; onChange?: (checked: boolean) => void; onClick?: () => void; divided?: boolean; checkboxLabel?: string; hideCheckbox?: boolean; selected?: boolean }) {
  return (
    <Pressable className={`flex-row w-full items-center gap-3 px-4 py-3 ${selected ? 'bg-sage-tint' : 'bg-white'} ${divided ? 'border-b border-row-divider' : 'rounded-lg border border-hairline'}`} onPress={onClick}>
      {hideCheckbox ? null : <Checkbox accessibilityLabel={checkboxLabel ?? `Mark ${taskName} complete`} checked={checked} onChange={onChange ?? (() => undefined)} />}
      <View className="flex-1 gap-1">
        <Text className={`font-sans-semibold text-[18px] text-ink ${checked ? 'line-through text-ink-muted' : ''}`}>{taskName}</Text>
        {taskDetail ? <Text className={`font-sans text-[14px] text-ink-muted ${checked ? 'line-through' : ''}`}>Every {taskDetail}</Text> : null}
        {taskDate ? <Text className={`font-sans text-[14px] text-ink-muted ${checked ? 'line-through' : ''}`}>Scheduled for {taskDate}</Text> : null}
      </View>
    </Pressable>
  );
}