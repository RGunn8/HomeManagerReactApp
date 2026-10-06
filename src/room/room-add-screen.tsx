import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBarButton } from '@/components/top-bar-button';
import { COMMON_ROOM_EMOJIS, isRoomEmoji } from '@/constants/room-emojis';
import { RoomIconListItem } from '@/room/component/room-icon-list-item';
import { useCreateRoom } from '@/room/hooks/use-rooms';
import { toCreateTaskRequest } from '@/task/hooks/use-tasks';
import { AddTasks, type AddedTask } from '@/task/component/add-tasks';

export function RoomAddScreen() {
	const createRoom = useCreateRoom();
	const [roomName, setRoomName] = useState('');
	const [selectedIcon, setSelectedIcon] = useState('🏠');
	const [customIcon, setCustomIcon] = useState('');
	const [isChoosingCustomIcon, setIsChoosingCustomIcon] = useState(false);
	const [tasks, setTasks] = useState<AddedTask[]>([]);
	const canSave = roomName.trim().length > 0 && (!isChoosingCustomIcon || isRoomEmoji(customIcon));

	const selectIcon = (icon: string) => {
		setSelectedIcon(icon);
		setCustomIcon('');
		setIsChoosingCustomIcon(false);
	};

	const selectCustomIcon = () => {
		setIsChoosingCustomIcon(true);
		setSelectedIcon(customIcon || '…');
	};

	const saveRoom = () => {
		if (!canSave) {
			return;
		}

		createRoom.mutate({
			name: roomName.trim(),
			roomEmoji: isChoosingCustomIcon && isRoomEmoji(customIcon) ? customIcon.trim() : selectedIcon,
			tasks: tasks.map((task) => toCreateTaskRequest({ name: task.name, detail: task.detail, dueDate: task.dueDate })),
		});
		router.back();
	};

	return (
		<SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
				<ScrollView
					className="flex-1"
					contentContainerClassName="px-screen pb-12"
					keyboardShouldPersistTaps="handled"
				>
				<View className="h-14 flex-row items-center justify-between">
					<TopBarButton label="Cancel" onPress={() => router.back()} />
					<Text className="font-sans text-[16px] text-ink">New room</Text>
					<TopBarButton disabled={!canSave} label="Save" onPress={saveRoom} />
				</View>

				<View className="mt-5 flex-row items-center rounded-input border border-hairline bg-white px-4">
					<View className="mr-3 h-9 w-9 items-center justify-center rounded-icon-tile bg-sage-tint">
						<Text className="text-[22px]">{selectedIcon}</Text>
					</View>
					<TextInput
						accessibilityLabel="Room name"
						autoCapitalize="words"
						className="h-[52px] flex-1 p-0 font-sans text-[16px] text-ink placeholder:text-ink-faint"
						onChangeText={setRoomName}
						placeholder="Room name"
						value={roomName}
					/>
				</View>

				<View className="mt-5 flex-row flex-wrap gap-3">
					<RoomIconListItem icon="🏠" isSelected={selectedIcon === '🏠'} onPress={() => selectIcon('🏠')} />
					{COMMON_ROOM_EMOJIS.map((icon) => (
						<RoomIconListItem
							icon={icon}
							key={icon}
							isSelected={selectedIcon === icon}
							onPress={() => selectIcon(icon)}
						/>
					))}
					<RoomIconListItem
						icon="…"
						isCustom
						isSelected={isChoosingCustomIcon}
						onPress={selectCustomIcon}
					/>
				</View>
				{isChoosingCustomIcon && (
					<TextInput
						accessibilityLabel="Custom icon"
						autoFocus
						className="mt-3 h-[48px] rounded-input border border-hairline bg-white px-4 text-center text-[22px] placeholder:text-ink-faint"
						keyboardType="default"
						maxLength={8}
						onChangeText={(value) => {
							setCustomIcon(value);
							setSelectedIcon(isRoomEmoji(value) ? value.trim() : '…');
						}}
						placeholder="Choose an icon"
						value={customIcon}
					/>
				)}
				{isChoosingCustomIcon && customIcon.trim().length > 0 && !isRoomEmoji(customIcon) && (
					<Text accessibilityRole="alert" className="mt-2 font-sans text-[14px] text-overdue">
						Please pick an emoji.
					</Text>
				)}

				<Text className="mb-3 mt-8 font-serif-semibold text-[24px] text-ink">Add tasks</Text>
				<AddTasks onTasksChange={setTasks} />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
