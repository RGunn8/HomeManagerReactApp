import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { NewRoomListItem } from '@/room/component/new-room-list-item';
import { RoomListItem } from '@/room/component/room-list-item';
import { useRooms } from '@/room/hooks/use-rooms';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RoomScreen() {
    const [searchText, setSearchText] = useState('');
    const { data: rooms, isLoading } = useRooms();
    const isSearching = searchText.trim().length > 0;
    const filteredRooms = useMemo(() => {
        const normalizedSearch = searchText.trim().toLowerCase();

        return rooms.filter((room) => room.name.toLowerCase().includes(normalizedSearch));
    }, [rooms, searchText]);

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
                        <View key={room.id} className="w-[48%]">
                            <RoomListItem
                                icon={room.icon}
                                name={room.name}
                                numOfItems={room.numOfItems}
                                numOfLowItems={room.numOfLowItems}
                                numOfTask={room.numOfTask}
                                onPress={() => router.push({ pathname: '/room-detail', params: { roomId: room.id, roomName: room.name } })}
                            />
                        </View>
                    ))}
                    {!isSearching && (
                        <View className="w-[48%]">
                            <NewRoomListItem onPress={handleAddRoom} />
                        </View>
                    )}
                </View>
                {filteredRooms.length === 0 && !isLoading && (
                    <Text className="mt-3 rounded-lg border border-dashed border-hairline px-4 py-6 text-center font-sans text-[15px] text-ink-muted">
                        {isSearching ? 'No rooms match your search.' : 'No rooms yet. Add one to start tracking tasks and items.'}
                    </Text>
                )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}