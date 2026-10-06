import { Pressable, Text } from 'react-native';

type FloatingActionButtonProps = {
    icon: string;
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
};

export function FloatingActionButton({ icon, label, onPress, variant = 'primary', className }: FloatingActionButtonProps) {
    return (
        <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            className={`h-14 w-14 items-center justify-center rounded-full shadow-md active:opacity-80 ${variant === 'primary' ? 'bg-forest' : 'bg-clay'} ${className ?? ''}`}
            onPress={onPress}
        >
            <Text className="text-[22px] text-white">{icon}</Text>
        </Pressable>
    );
}
