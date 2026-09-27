import { Pressable, Text } from 'react-native';

type TopBarButtonProps = {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
};

export function TopBarButton({ label, onPress, disabled = false }: TopBarButtonProps) {
    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            className="rounded-button px-2 py-2 active:opacity-70"
            disabled={disabled}
            onPress={onPress}
        >
            <Text className={`font-sans-semibold text-[16px] ${disabled ? 'text-ink-faint' : 'text-forest'}`}>
                {label}
            </Text>
        </Pressable>
    );
}
