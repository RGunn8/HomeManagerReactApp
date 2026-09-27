import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { getRoomEmoji } from '@/constants/room-emojis';
import { NewRoomListItem } from '@/room/component/new-room-list-item';
import { RoomListItem } from '@/room/component/room-list-item';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rooms = [
    { name: 'Living Room', numOfTask: 4, numOfItems: 8, numOfLowItems: 1 },
    { name: 'Kitchen', numOfTask: 6, numOfItems: 14, numOfLowItems: 2 },
    { name: 'Bedroom', numOfTask: 2, numOfItems: 5, numOfLowItems: 0 },
    { name: 'Bathroom', numOfTask: 3, numOfItems: 7, numOfLowItems: 1 },
];

export function RoomScreen() {
    const [searchText, setSearchText] = useState('');
    const isSearching = searchText.trim().length > 0;
    const filteredRooms = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return rooms.filter((room) => room.name.toLowerCase().includes(normalizedSearch));
    }, [searchText]);

    const handleAddRoom = () => router.push('/room-add');

    return (
        <SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-screen pb-28 pt-2"
                    keyboardShouldPersistTaps="handled"
                >
                <View className="flex-row items-center justify-between">
                    <TitleText title="Rooms" />
                    <TopBarButton label="+ Add" onPress={handleAddRoom} />
                </View>
                <TextInput
                    accessibilityLabel="Search rooms"
                    autoCapitalize="none"
                    className="mb-6 mt-4 h-[52px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                    onChangeText={setSearchText}
                    placeholder="Search rooms"
                    returnKeyType="search"
                    value={searchText}
                />

                <View className="flex-row flex-wrap gap-3">
                    {filteredRooms.map((room) => (
                        <View key={room.name} className="w-[48%]">
                            <RoomListItem
                                {...room}
                                icon={getRoomEmoji(room.name)}
                                onPress={() => router.push({ pathname: '/room-detail', params: { roomName: room.name } })}
                            />
                        </View>
                    ))}
                    {!isSearching && (
                        <View className="w-[48%]">
                            <NewRoomListItem onPress={handleAddRoom} />
                        </View>
                    )}
                </View>
                {filteredRooms.length === 0 && (
                    <Text className="mt-3 rounded-lg border border-dashed border-hairline px-4 py-6 text-center font-sans text-[15px] text-ink-muted">
                        No rooms match your search.
                    </Text>
                )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}