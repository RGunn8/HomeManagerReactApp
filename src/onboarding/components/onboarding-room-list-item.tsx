import { preview } from 'radon-ide';
import { Pressable, Text, View } from 'react-native';

import { getRoomEmoji } from '@/constants/room-emojis';


export default function OnboardingRoomListItem({ roomName, taskDetail, isOpen, showArrow = true, onClick }: { roomName: string; taskDetail?: string; isOpen?: boolean; showArrow?: boolean; onClick?: () => void }) {
    return (
        <Pressable className="flex-row w-full items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3" onPress={onClick}>
            <Text className="pl-4 text-[24px]">{getRoomEmoji(roomName)}</Text>
            <View className="flex-1 gap-1">
                <Text className="font-sans-semibold text-[18px] text-ink">{roomName}</Text>
                {taskDetail ? <Text className="font-sans text-[14px] text-ink-muted">{taskDetail}</Text> : null}
            </View>
            {showArrow && <Text className="pr-4 font-sans-semibold text-[24px] text-ink-faint">{isOpen ? '⌃' : '⌄'}</Text>}
        </Pressable>
    );
}

preview(<OnboardingRoomListItem roomName="Living Room" taskDetail="1 of 3 added" isOpen={true} onClick={() => console.log("Room clicked")} />);
