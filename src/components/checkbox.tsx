import { Pressable, Text, View } from 'react-native';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel?: string;
};

export function Checkbox({ checked, onChange, accessibilityLabel = 'Checkbox' }: CheckboxProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className={`h-6 w-6 items-center justify-center rounded-checkbox border ${checked ? 'border-forest bg-forest' : 'border-forest bg-card'}`}
      hitSlop={8}
      onPress={() => onChange(!checked)}
    >
      {checked && <Text className="font-sans-semibold text-[16px] leading-[18px] text-white">✓</Text>}
    </Pressable>
  );
}

export function CheckboxPreview() {
  return (
    <View className="p-4">
      <Checkbox checked={false} onChange={() => {}} />
    </View>
  );
}