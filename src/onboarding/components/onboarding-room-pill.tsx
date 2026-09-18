import { preview } from 'radon-ide';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';


type OnboardingRoomPillProps = {
    roomName: string;
    isSelected?: boolean;
    isCustomRoom?: boolean;
    onPress?: () => void;
    onCustomRoomSubmit?: (roomName: string) => void;
};

export function OnboardingRoomPill({ roomName, isSelected = false, isCustomRoom = false, onPress, onCustomRoomSubmit }: OnboardingRoomPillProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [customRoomName, setCustomRoomName] = useState('');

    function handlePress() {
        if (isCustomRoom) {
            setIsEditing(true);
            return;
        }

        onPress?.();
    }

    function handleSubmit() {
        const trimmedRoomName = customRoomName.trim();

        if (!trimmedRoomName) {
            return;
        }

        onCustomRoomSubmit?.(trimmedRoomName);
        setCustomRoomName('');
        setIsEditing(false);
    }

    return (
        <Pressable accessibilityRole="button" onPress={handlePress}>
            <View className={`flex-row items-center gap-1 rounded-full px-5 py-3 ${isCustomRoom ? 'border border-forest bg-transparent' : isSelected ? 'border border-forest bg-forest' : 'border border-hairline bg-card'}`}>
                {isCustomRoom && isEditing ? (
                    <TextInput
                        autoFocus
                        className="min-w-[120px] p-0 font-sans-semibold text-[18px] text-forest"
                        onChangeText={setCustomRoomName}
                        onSubmitEditing={handleSubmit}
                        placeholderTextColor="#2c4a3a"
                        returnKeyType="done"
                        value={customRoomName}
                    />
                ) : (
                    <>
                        {isSelected && (
                            <Text className="font-sans-semibold text-[18px] text-white">✓</Text>
                        )}
                        <Text className={`font-sans-semibold text-[18px] ${isCustomRoom ? 'text-forest' : isSelected ? 'text-white' : 'text-forest'}`}>
                            {roomName}
                        </Text>
                    </>
                )}
            </View>
        </Pressable>
    );
}

preview(<OnboardingRoomPill roomName="Add room" isCustomRoom onCustomRoomSubmit={() => {}} />);