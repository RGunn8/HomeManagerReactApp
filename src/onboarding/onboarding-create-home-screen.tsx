import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRoomEmoji } from '@/constants/room-emojis';
import { useCreateHome } from '@/home/hooks/use-home';
import { OnboardingHomeTextField } from '@/onboarding/components/onboarding-home-text-field';
import OnboardingRoomListItem from '@/onboarding/components/onboarding-room-list-item';
import { OnboardingRoomPill } from '@/onboarding/components/onboarding-room-pill';
import { OnboardingStep } from '@/onboarding/components/onboarding-step';
import { OnboardingTitle } from '@/onboarding/components/onboarding-title';
import { getDefaultTasks, suggestedRooms } from '@/onboarding/const/onboarding-constants';
import { useAppStore } from '@/store/use-app-store';
import { createRoom } from '@/room/api/room-api';
import { updateTask } from '@/task/api/task-api';
import { toCreateTaskRequest } from '@/task/hooks/use-tasks';
import { TaskListItem } from '@/task/component/task-list-item';

type RoomTask = { name: string; interval?: string; checked: boolean };
type RoomTasks = Record<string, RoomTask[]>;

export default function OnboardingCreateHomeScreen() {
	const router = useRouter();
	const completeOnboarding = useAppStore((state) => state.completeOnboarding);
	const [stepIndex, setStepIndex] = useState(0);
	const [homeName, setHomeName] = useState('');
	const [rooms, setRooms] = useState<string[]>([]);
	const [roomTasks, setRoomTasks] = useState<RoomTasks>({});
	const [openRooms, setOpenRooms] = useState<Record<string, boolean>>({});
	const [customTasks, setCustomTasks] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const createHome = useCreateHome();

	function toggleRoom(roomName: string) {
		setRooms((currentRooms) => {
			if (currentRooms.includes(roomName)) {
				setRoomTasks((currentTasks) => {
					const nextTasks = { ...currentTasks };
					delete nextTasks[roomName];
					return nextTasks;
				});
				return currentRooms.filter((room) => room !== roomName);
			}

			setRoomTasks((currentTasks) => ({
				...currentTasks,
				[roomName]: currentTasks[roomName] ?? getDefaultTasks(roomName),
			}));
			return [...currentRooms, roomName];
		});
	}

	function addCustomRoom(roomName: string) {
		setRooms((currentRooms) => (currentRooms.includes(roomName) ? currentRooms : [...currentRooms, roomName]));
		setRoomTasks((currentTasks) => ({
			...currentTasks,
			[roomName]: currentTasks[roomName] ?? [],
		}));
		setOpenRooms((currentOpenRooms) => ({ ...currentOpenRooms, [roomName]: true }));
	}

	function toggleRoomOpen(roomName: string) {
		setOpenRooms((currentOpenRooms) => ({ ...currentOpenRooms, [roomName]: !currentOpenRooms[roomName] }));
	}

	function toggleTask(roomName: string, taskName: string, checked: boolean) {
		setRoomTasks((currentTasks) => ({
			...currentTasks,
			[roomName]: currentTasks[roomName].map((task) => (task.name === taskName ? { ...task, checked } : task)),
		}));
	}

	function addCustomTask(roomName: string) {
		const trimmedTask = (customTasks[roomName] ?? '').trim();

		if (!trimmedTask || roomTasks[roomName]?.some((task) => task.name === trimmedTask)) {
			return;
		}

		setRoomTasks((currentTasks) => ({
			...currentTasks,
			[roomName]: [...(currentTasks[roomName] ?? []), { name: trimmedTask, checked: false }],
		}));
		setCustomTasks((currentCustomTasks) => ({ ...currentCustomTasks, [roomName]: '' }));
	}

	async function goNext() {
		if (stepIndex < 2) {
			setStepIndex((currentStep) => currentStep + 1);
			return;
		}

		setIsSubmitting(true);
		setErrorMessage('');

		try {
			const home = await createHome.mutateAsync(homeName.trim());
			for (const roomName of rooms) {
				const tasks = roomTasks[roomName] ?? [];
				const room = await createRoom(home.id, {
					name: roomName,
					roomEmoji: getRoomEmoji(roomName),
					tasks: tasks.map((task) => toCreateTaskRequest({ name: task.name, detail: task.interval })),
				});
				const completedTitles = new Set(tasks.filter((task) => task.checked).map((task) => task.name));
				await Promise.all(room.tasks
					.filter((task) => completedTitles.has(task.title))
					.map((task) => updateTask(home.id, task.id, { status: 'DONE' })));
			}
			completeOnboarding();
			router.replace('/(tabs)');
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Could not create your home. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}

	function goBack() {
		if (stepIndex === 0) {
			router.back();
			return;
		}

		setStepIndex((currentStep) => currentStep - 1);
	}

	const canContinue = stepIndex === 0 ? homeName.trim().length > 0 : true;

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			className="flex-1 bg-canvas dark:bg-forest-deep"
		>
			<SafeAreaView className="flex-1" edges={['top']}>
			<ScrollView contentContainerClassName="flex-grow px-5 pb-8" keyboardShouldPersistTaps="handled">
				<OnboardingStep onSkipPressed={() => setStepIndex(1)} stepIndex={stepIndex} totalSteps={3} />

				<View className="flex-1 pt-12">
					{stepIndex === 0 && (
						<View className="flex-1 gap-8">
							<OnboardingTitle
								subtitle="Just a name you'll recognize. You can change it any time in settings."
								title="Welcome - what should we call your home?"
							/>
							<OnboardingHomeTextField onChange={setHomeName} placeholder="Enter your home name" value={homeName} />
						</View>
					)}

					{stepIndex === 1 && (
						<View className="flex-1 gap-8">
							<OnboardingTitle
								subtitle="Tap the ones you have. Two or three is plenty to start - add the rest later."
								title="Which rooms are in your home?"
							/>
							<View className="flex-row flex-wrap gap-3">
								{suggestedRooms.map((roomName) => (
									<OnboardingRoomPill
										isSelected={rooms.includes(roomName)}
										key={roomName}
										onPress={() => toggleRoom(roomName)}
										roomName={roomName}
									/>
								))}
								{rooms.filter((roomName) => !suggestedRooms.includes(roomName)).map((roomName) => (
									<OnboardingRoomPill
										isSelected
										key={roomName}
										onPress={() => toggleRoom(roomName)}
										roomName={roomName}
									/>
								))}
								<OnboardingRoomPill isCustomRoom onCustomRoomSubmit={addCustomRoom} roomName="＋ Add room" />
							</View>
							{rooms.length > 0 && (
								<View className="gap-3">
									<Text className="font-sans-semibold text-[13px] uppercase tracking-[1px] text-ink-muted">Your rooms</Text>
									{rooms.map((roomName) => (
										<OnboardingRoomListItem key={roomName} roomName={roomName} showArrow={false} />
									))}
								</View>
							)}
						</View>
					)}

					{stepIndex === 2 && (
						<View className="flex-1 gap-8">
							<OnboardingTitle
								subtitle="We picked one per room. Open a room to add more, or untick anything that isn't yours"
								title="A few things to start with"
							/>
							<View className="gap-3">
								{rooms.length === 0 ? (
									<Text className="rounded-lg border border-dashed border-hairline px-4 py-5 text-center font-sans text-[15px] text-ink-muted">Go back and add at least one room to create tasks.</Text>
								) : rooms.map((roomName) => {
									const tasksForRoom = roomTasks[roomName] ?? [];
									const completedTasks = tasksForRoom.filter((task) => task.checked).length;

									return (
										<View key={roomName} className="gap-2">
											<OnboardingRoomListItem
												isOpen={openRooms[roomName]}
												onClick={() => toggleRoomOpen(roomName)}
												roomName={roomName}
												taskDetail={`${completedTasks} of ${tasksForRoom.length} added`}
											/>
											{openRooms[roomName] && (
												<View className="ml-4 gap-2 border-l border-hairline pl-3">
													{tasksForRoom.map((task) => (
														<TaskListItem
															checked={task.checked}
															key={task.name}
															onChange={(checked) => toggleTask(roomName, task.name, checked)}
															taskDetail={task.interval}
															taskName={task.name}
														/>
														))}
													<TextInput
														className="rounded-lg border border-dashed border-forest px-3 py-3 font-sans text-[16px] text-ink"
														onChangeText={(text) => setCustomTasks((current) => ({ ...current, [roomName]: text }))}
														onSubmitEditing={() => addCustomTask(roomName)}
														placeholder="Add a task"
														placeholderTextColor="#8b938a"
														returnKeyType="done"
														value={customTasks[roomName] ?? ''}
													/>
												</View>
											)}
										</View>
									);
								})}
							</View>
						</View>
					)}
				</View>

				<View className="mt-10 gap-3">
					{stepIndex > 0 && (
						<Pressable accessibilityRole="button" className="h-[54px] items-center justify-center" onPress={goBack}>
							<Text className="font-sans-semibold text-[16px] text-forest">Back</Text>
						</Pressable>
					)}
					{errorMessage ? (
						<Text accessibilityRole="alert" className="mb-3 text-center font-sans text-[14px] text-overdue">{errorMessage}</Text>
					) : null}
					<Pressable
						accessibilityRole="button"
						className="h-[54px] items-center justify-center rounded-button bg-forest active:opacity-80 disabled:opacity-50"
						disabled={!canContinue || isSubmitting}
						onPress={goNext}
					>
						<Text className="font-sans-semibold text-[16.5px] text-card">{isSubmitting ? 'Saving...' : stepIndex === 2 ? 'Finish setup' : 'Continue'}</Text>
					</Pressable>
				</View>
			</ScrollView>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}
