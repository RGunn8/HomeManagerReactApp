import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDatePickerField } from '@/components/calendar-date-picker-field';
import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import ProjectDetailCard from '@/project/compoment/project-detail-card';
import { ProjectTaskListItem, type ProjectTask } from '@/project/component/project-task-list-item';

type ProjectMaterial = {
	id: string;
	name: string;
	price?: number;
};

const startingTasks: ProjectTask[] = [
	{ id: 'measure', title: 'Measure the kitchen walls', dueDate: 'Oct 2', completed: true },
	{ id: 'choose-tile', title: 'Choose backsplash tile', dueDate: 'Oct 4', completed: false },
	{ id: 'order-faucet', title: 'Order a new faucet', dueDate: 'Oct 6', completed: false },
	{ id: 'clear-cabinets', title: 'Clear the lower cabinets', dueDate: 'Oct 8', completed: false },
	{ id: 'install-shelves', title: 'Install open shelves', dueDate: 'Oct 10', completed: false },
];

const projectMaterials: ProjectMaterial[] = [
	{ id: 'tile', name: 'Ceramic backsplash tile', price: 186 },
	{ id: 'faucet', name: 'Brushed steel faucet', price: 145 },
	{ id: 'grout', name: 'Tile grout' },
];

export function ProjectDetailScreen() {
	const { title, room, dueDate, totalBudget: totalBudgetParam, spentBudget: spentBudgetParam } = useLocalSearchParams<{
		title?: string;
		room?: string;
		dueDate?: string;
		totalBudget?: string;
		spentBudget?: string;
	}>();
	const initialTotalBudget = Number(totalBudgetParam);
	const initialSpentBudget = Number(spentBudgetParam);
	const [totalBudget, setTotalBudget] = useState(Number.isFinite(initialTotalBudget) ? initialTotalBudget : 1200);
	const [spentBudget, setSpentBudget] = useState(Number.isFinite(initialSpentBudget) ? initialSpentBudget : 460);
	const [isEditingBudget, setIsEditingBudget] = useState(false);
	const [budgetInput, setBudgetInput] = useState(String(Number.isFinite(initialTotalBudget) ? initialTotalBudget : 1200));
	const [spentInput, setSpentInput] = useState(String(Number.isFinite(initialSpentBudget) ? initialSpentBudget : 460));
	const [tasks, setTasks] = useState(startingTasks);
	const [materials, setMaterials] = useState(projectMaterials);
	const [showAllTasks, setShowAllTasks] = useState(false);
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
	const [isAddingMaterial, setIsAddingMaterial] = useState(false);
	const [newMaterialName, setNewMaterialName] = useState('');
	const [newMaterialPrice, setNewMaterialPrice] = useState('');

	const completedTaskCount = tasks.filter((task) => task.completed).length;
	const visibleTasks = showAllTasks ? tasks : tasks.slice(0, 3);
	const nextTask = useMemo(() => tasks.find((task) => !task.completed), [tasks]);

	const saveBudget = () => {
		const nextTotalBudget = Number(budgetInput);
		const nextSpentBudget = Number(spentInput);
		if (!Number.isFinite(nextTotalBudget) || !Number.isFinite(nextSpentBudget) || nextTotalBudget < 0 || nextSpentBudget < 0) {
			return;
		}

		setTotalBudget(nextTotalBudget);
		setSpentBudget(nextSpentBudget);
		setIsEditingBudget(false);
	};

	const toggleTask = (taskId: string, completed: boolean) => {
		setTasks((currentTasks) => currentTasks.map((task) => task.id === taskId ? { ...task, completed } : task));
	};

	const addTask = () => {
		const trimmedTitle = newTaskTitle.trim();
		if (!trimmedTitle) {
			return;
		}

		setTasks((currentTasks) => [
			...currentTasks,
			{
				id: `${Date.now()}`,
				title: trimmedTitle,
				dueDate: newTaskDueDate?.toLocaleDateString(),
				completed: false,
			},
		]);
		setNewTaskTitle('');
		setNewTaskDueDate(null);
		setIsAddingTask(false);
		setShowAllTasks(true);
	};

	const addMaterial = () => {
		const trimmedName = newMaterialName.trim();
		if (!trimmedName) {
			return;
		}

		const parsedPrice = newMaterialPrice.trim() ? Number(newMaterialPrice) : undefined;
		if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
			return;
		}

		setMaterials((currentMaterials) => [
			...currentMaterials,
			{
				id: `${Date.now()}`,
				name: trimmedName,
				...(parsedPrice !== undefined ? { price: parsedPrice } : {}),
			},
		]);
		setNewMaterialName('');
		setNewMaterialPrice('');
		setIsAddingMaterial(false);
	};

	return (
		<SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
				keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
			>
			<ScrollView
				className="flex-1"
				contentContainerClassName="gap-5 px-screen pb-28 pt-2"
				keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
				keyboardShouldPersistTaps="handled"
			>
				<View className="h-12 flex-row items-center">
					<TopBarButton label="Back" onPress={() => router.back()} />
				</View>

				<View>
					<TitleText title={title ?? 'Project'} />
					<Text className="font-sans text-[15px] text-ink-muted">
						{[room, dueDate ? `Due ${dueDate}` : undefined].filter(Boolean).join(' · ')}
					</Text>
				</View>

				<ProjectDetailCard
					nextUpTasks={nextTask?.title}
					nextUpTasksDueDate={nextTask?.dueDate}
					numberOfTasks={tasks.length}
					spentBudget={spentBudget}
					onEditBudget={() => {
						setBudgetInput(String(totalBudget));
						setSpentInput(String(spentBudget));
						setIsEditingBudget(true);
					}}
					tasksCompleted={completedTaskCount}
					totalBudget={totalBudget}
				/>
				{isEditingBudget && (
					<View className="gap-3 rounded-card border border-hairline bg-white p-4">
						<Text className="font-serif-semibold text-[20px] text-ink">Edit budget</Text>
						<View className="gap-1">
							<Text className="font-sans-semibold text-[13px] text-ink-muted">Total spent</Text>
							<TextInput
								accessibilityLabel="Total spent"
								className="h-[48px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint"
								keyboardType="decimal-pad"
								onChangeText={setSpentInput}
								value={spentInput}
							/>
						</View>
						<View className="gap-1">
							<Text className="font-sans-semibold text-[13px] text-ink-muted">Total budget</Text>
							<TextInput
								accessibilityLabel="Total project budget"
								className="h-[48px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint"
								keyboardType="decimal-pad"
								onChangeText={setBudgetInput}
								value={budgetInput}
							/>
						</View>
						<View className="flex-row justify-end gap-2">
							<Pressable accessibilityRole="button" className="rounded-button bg-sage-tint px-4 py-2" onPress={() => setIsEditingBudget(false)}>
								<Text className="font-sans-semibold text-[14px] text-forest">Cancel</Text>
							</Pressable>
							<Pressable accessibilityRole="button" className="rounded-button bg-forest px-4 py-2" onPress={saveBudget}>
								<Text className="font-sans-semibold text-[14px] text-white">Save</Text>
							</Pressable>
						</View>
					</View>
				)}

				{tasks.length > 0 ? (
					<View className="gap-3">
						<View className="flex-row items-center justify-between">
							<Text className="font-serif-semibold text-[24px] text-ink">Tasks</Text>
							<View className="flex-row items-center gap-2">
								<Pressable
									accessibilityRole="button"
									accessibilityState={{ expanded: showAllTasks }}
									className="flex-row items-center gap-1 rounded-button px-2 py-2"
									onPress={() => setShowAllTasks((current) => !current)}
								>
									<Text className="font-sans-semibold text-[14px] text-forest">All {tasks.length}</Text>
									<Text className="text-[16px] text-forest">{showAllTasks ? '⌃' : '⌄'}</Text>
								</Pressable>
								<Pressable
									accessibilityRole="button"
									className="rounded-button bg-forest px-3 py-2"
									onPress={() => setIsAddingTask((current) => !current)}
								>
									<Text className="font-sans-semibold text-[14px] text-white">+ Add</Text>
								</Pressable>
							</View>
						</View>

						<View className="overflow-hidden rounded-card border border-hairline bg-white">
							{visibleTasks.map((task, index) => (
								<View className={index < visibleTasks.length - 1 ? 'border-b border-row-divider' : ''} key={task.id}>
									<ProjectTaskListItem onToggle={toggleTask} task={task} />
								</View>
							))}
						</View>

						{isAddingTask && (
											<View className="gap-2 rounded-card border border-hairline bg-white p-3">
								<TextInput
									accessibilityLabel="New project task"
									autoFocus
													className="h-[48px] rounded-input border border-hairline bg-white px-4 font-sans text-[15px] text-ink placeholder:text-ink-faint"
									onChangeText={setNewTaskTitle}
													returnKeyType="next"
									placeholder="Task name"
									value={newTaskTitle}
								/>
												<CalendarDatePickerField onChange={setNewTaskDueDate} value={newTaskDueDate} />
												<Pressable accessibilityRole="button" className="items-center justify-center self-end rounded-button bg-forest px-4 py-2" onPress={addTask}>
													<Text className="font-sans-semibold text-[14px] text-white">Add task</Text>
												</Pressable>
							</View>
						)}
					</View>
				) : null}

				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Text className="font-serif-semibold text-[24px] text-ink">Materials</Text>
						<Pressable
							accessibilityRole="button"
							className="rounded-button bg-forest px-3 py-2"
							onPress={() => setIsAddingMaterial((current) => !current)}
						>
							<Text className="font-sans-semibold text-[14px] text-white">+ Add</Text>
						</Pressable>
					</View>
					{isAddingMaterial && (
						<View className="gap-2 rounded-card border border-hairline bg-white p-3">
							<TextInput
								accessibilityLabel="Material name"
								autoFocus
								className="h-[46px] rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
								onChangeText={setNewMaterialName}
								onSubmitEditing={addMaterial}
								placeholder="Item name"
								returnKeyType="next"
								value={newMaterialName}
							/>
							<View className="flex-row gap-2">
								<TextInput
									accessibilityLabel="Optional material price"
									className="h-[46px] flex-1 rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint"
									keyboardType="decimal-pad"
									onChangeText={setNewMaterialPrice}
									onSubmitEditing={addMaterial}
									placeholder="Price (optional)"
									returnKeyType="done"
									value={newMaterialPrice}
								/>
								<Pressable accessibilityRole="button" className="items-center justify-center rounded-button bg-forest px-4" onPress={addMaterial}>
									<Text className="font-sans-semibold text-[14px] text-white">Add</Text>
								</Pressable>
							</View>
						</View>
					)}
					<View className="overflow-hidden rounded-card border border-hairline bg-white">
						{materials.map((material, index) => (
							<View className={`flex-row items-center justify-between px-4 py-3 ${index < materials.length - 1 ? 'border-b border-row-divider' : ''}`} key={material.id}>
								<Text className="flex-1 font-sans-semibold text-[15px] text-ink">{material.name}</Text>
								{material.price !== undefined ? (
									<Text className="ml-3 font-sans text-[14px] text-ink-muted">${material.price.toFixed(2)}</Text>
								) : null}
							</View>
						))}
					</View>
				</View>
			</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
