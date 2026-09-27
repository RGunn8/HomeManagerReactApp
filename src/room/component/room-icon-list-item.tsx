import { Pressable, Text } from 'react-native';

type RoomIconListItemProps = {
    icon: string;
    isCustom?: boolean;
    isSelected?: boolean;
    onPress?: () => void;
};

export function RoomIconListItem({ icon, isCustom = false, isSelected = false, onPress }: RoomIconListItemProps) {
    return (
        <Pressable
            accessibilityLabel={isCustom ? 'Choose a custom icon' : `${icon} icon`}
            className={`h-12 w-12 items-center justify-center rounded-icon-tile ${isCustom ? 'border border-dashed border-ink-faint bg-transparent' : ''} ${isSelected ? 'bg-sage-tint' : ''}`}
            onPress={onPress}
        >
            <Text className={`text-[24px] ${isCustom ? 'text-ink-faint' : ''}`}>{icon}</Text>
        </Pressable>
    );
}
