import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemAutocompleteField } from '@/components/item-autocomplete-field';
import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import { useInventory } from '@/inventory/hooks/use-inventory';
import ProjectDetailCard from '@/project/compoment/project-detail-card';
import { useCreateProjectMaterial, useProject, useUpdateProject } from '@/project/hooks/use-projects';
import { toHomeProject } from '@/project/project-model';
import { useAddToShoppingList, useShoppingTrips } from '@/shopping/hooks/use-shopping';
import { useCreateTask, useSetTaskCompleted, useTasks } from '@/task/hooks/use-tasks';
import { toAddedTask } from '@/task/task-model';
import { sameId, useResolvedId } from '@/lib/offline/temp-ids';
import { AddTasks, type AddedTask } from '@/task/component/add-tasks';

type ProjectMaterial = {
	id: string;
	name: string;
	quantity: number;
	price?: number;
	inventoryItemId?: string;
};

type ProjectDetailTab = 'tasks' | 'materials';

export function ProjectDetailScreen() {
	const { projectId: projectIdParam, title: titleParam } = useLocalSearchParams<{
		projectId?: string;
		title?: string;
	}>();
	const projectId = useResolvedId(projectIdParam);
	const { data: apiProject } = useProject(projectId);
	const project = apiProject ? toHomeProject(apiProject) : undefined;
	const title = project?.title ?? titleParam;
	const room = project?.room;
	const dueDate = project?.dueDate;
	const totalBudget = project?.totalBudget ?? 0;
	const spentBudget = project?.spentBudget ?? 0;
	const updateProject = useUpdateProject();
	const { data: allTasks = [] } = useTasks();
	const createTask = useCreateTask();
	const setTaskCompleted = useSetTaskCompleted();
	const { data: inventoryItems = [] } = useInventory();
	const { data: trips = [] } = useShoppingTrips();
	const addToShoppingList = useAddToShoppingList();
	const [isEditingBudget, setIsEditingBudget] = useState(false);
	const [budgetInput, setBudgetInput] = useState('');
	const [spentInput, setSpentInput] = useState('');
	const tasks = useMemo<AddedTask[]>(
		() => allTasks.filter((task) => sameId(task.projectId, projectId)).map(toAddedTask),
		[allTasks, projectId],
	);
	const createMaterial = useCreateProjectMaterial();
	const materials = useMemo<ProjectMaterial[]>(() => (apiProject?.materials ?? []).map((material) => ({
		id: material.id,
		name: material.name,
		quantity: material.quantity,
		...(material.unitCost !== null ? { price: material.unitCost } : {}),
	})), [apiProject?.materials]);
	const [activeTab, setActiveTab] = useState<ProjectDetailTab>('tasks');
	const [isAddingMaterial, setIsAddingMaterial] = useState(false);
	const [newMaterialName, setNewMaterialName] = useState('');
	const [newMaterialQuantity, setNewMaterialQuantity] = useState('1');
	const [newMaterialPrice, setNewMaterialPrice] = useState('');
	const [selectedMaterialInventoryId, setSelectedMaterialInventoryId] = useState<string | null>(null);

	const completedTaskCount = tasks.filter((task) => task.checked).length;
	const nextTask = useMemo(() => tasks.find((task) => !task.checked), [tasks]);

	const saveBudget = () => {
		const nextTotalBudget = Number(budgetInput);
		const nextSpentBudget = Number(spentInput);
		if (!Number.isFinite(nextTotalBudget) || !Number.isFinite(nextSpentBudget) || nextTotalBudget < 0 || nextSpentBudget < 0) {
			return;
		}

		if (projectId) {
			updateProject.mutate({ projectId, estimatedCost: nextTotalBudget, actualCost: nextSpentBudget });
		}
		setIsEditingBudget(false);
	};

	const addMaterial = () => {
		const trimmedName = newMaterialName.trim();
		const quantity = Number(newMaterialQuantity);
		if (!trimmedName) {
			return;
		}

		if (!Number.isInteger(quantity) || quantity < 1) {
			return;
		}
		const inventoryItem = inventoryItems.find((item) => item.id === selectedMaterialInventoryId)
			?? inventoryItems.find((item) => item.name.trim().toLowerCase() === trimmedName.toLowerCase());
		const parsedPrice = newMaterialPrice.trim() ? Number(newMaterialPrice) : inventoryItem?.price;
		if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
			return;
		}

		if (projectId) {
			createMaterial.mutate({
				projectId,
				name: trimmedName,
				quantity,
				...(parsedPrice !== undefined ? { unitCost: parsedPrice } : {}),
			});
		}
		setNewMaterialName('');
		setNewMaterialQuantity('1');
		setNewMaterialPrice('');
		setSelectedMaterialInventoryId(null);
		setIsAddingMaterial(false);
	};

	const addMaterialToList = (material: ProjectMaterial) => {
		const inventoryItem = inventoryItems.find((item) => item.id === material.inventoryItemId)
			?? inventoryItems.find((item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase());
		const quantityToBuy = Math.max(0, material.quantity - (inventoryItem?.quantity ?? 0));
		if (quantityToBuy === 0) return;
		addToShoppingList.mutate(
			[{ name: material.name, quantity: quantityToBuy, price: material.price }],
			`${title ?? 'Project'} materials`,
		);
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
					nextUpTasks={nextTask?.name}
					nextUpTasksDueDate={nextTask?.date}
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

				<View className="mt-1 flex-row rounded-button bg-sage-tint p-1">
					{(['tasks', 'materials'] as ProjectDetailTab[]).map((tab) => (
						<Pressable
							accessibilityRole="tab"
							accessibilityState={{ selected: activeTab === tab }}
							className={`flex-1 items-center rounded-button px-2 py-2 ${activeTab === tab ? 'bg-forest' : 'bg-transparent'}`}
							key={tab}
							onPress={() => setActiveTab(tab)}
						>
							<Text className={`font-sans-semibold text-[14px] capitalize ${activeTab === tab ? 'text-white' : 'text-ink-muted'}`}>
								{tab}
							</Text>
						</Pressable>
					))}
				</View>

				{activeTab === 'tasks' && (
					<View className="gap-3">
						<Text className="font-serif-semibold text-[24px] text-ink">Tasks</Text>
						<AddTasks
							onAddTask={(task) => createTask.mutate({
								name: task.name,
								detail: task.detail,
								dueDate: task.dueDate,
								projectId,
								roomId: project?.roomId,
							})}
							onTaskCheckedChange={(task, checked) => task.id && setTaskCompleted.mutate({ taskId: task.id, checked })}
							roomName={room}
							tasks={tasks}
						/>
					</View>
				)}

				{activeTab === 'materials' && (
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
							<ItemAutocompleteField
								accessibilityLabel="Material name"
								autoFocus
								onChangeText={(value) => {
									setNewMaterialName(value);
									setSelectedMaterialInventoryId(null);
								}}
								onSelectSuggestion={(suggestion) => {
									setNewMaterialName(suggestion.name);
									setSelectedMaterialInventoryId(suggestion.id);
									setNewMaterialPrice(suggestion.price === undefined ? '' : String(suggestion.price));
								}}
								placeholder="Search or add a material"
								suggestions={inventoryItems}
								value={newMaterialName}
							/>
							<View className="flex-row gap-2">
								<TextInput
									accessibilityLabel="Material quantity"
									className="h-[46px] w-20 rounded-input border border-hairline bg-white px-3 text-center font-sans text-[15px] text-ink"
									keyboardType="number-pad"
									onChangeText={(value) => /^\d*$/.test(value) && setNewMaterialQuantity(value)}
									placeholder="Qty"
									value={newMaterialQuantity}
								/>
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
							</View>
							<Pressable accessibilityRole="button" className="self-end rounded-button bg-forest px-4 py-2" onPress={addMaterial}>
								<Text className="font-sans-semibold text-[14px] text-white">Add material</Text>
							</Pressable>
						</View>
					)}
					<View className="overflow-hidden rounded-card border border-hairline bg-white">
						{materials.map((material, index) => {
							const inventoryItem = inventoryItems.find((item) => item.id === material.inventoryItemId)
								?? inventoryItems.find((item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase());
							const quantityToBuy = Math.max(0, material.quantity - (inventoryItem?.quantity ?? 0));
							const shoppingTrip = trips.find((trip) => trip.status !== 'past'
								&& trip.items?.some((item) => item.name.trim().toLowerCase() === material.name.trim().toLowerCase()));

							return (
								<View className={`gap-1 px-4 py-3 ${index < materials.length - 1 ? 'border-b border-row-divider' : ''}`} key={material.id}>
									<View className="flex-row items-center justify-between">
										<Text className="flex-1 font-sans-semibold text-[15px] text-ink">{material.name}</Text>
										{material.price !== undefined ? (
											<Text className="ml-3 font-sans text-[14px] text-ink-muted">${material.price.toFixed(2)}</Text>
										) : null}
									</View>
									<Text className="font-sans text-[13px] text-ink-muted">
										Needed {material.quantity} · In stock {inventoryItem?.quantity ?? 0}
									</Text>
									{quantityToBuy > 0 ? shoppingTrip ? (
										<Text className="font-sans text-[12px] text-forest">On {shoppingTrip.title}</Text>
									) : (
										<Pressable
											accessibilityLabel={`Add ${quantityToBuy} ${material.name} to shopping list`}
											accessibilityRole="button"
											className="self-start rounded-button bg-sage-tint px-3 py-2"
											onPress={() => addMaterialToList(material)}
										>
											<Text className="font-sans-semibold text-[13px] text-forest">Add {quantityToBuy} to list</Text>
										</Pressable>
									) : null}
								</View>
							);
						})}
					</View>
				</View>
				)}
			</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
