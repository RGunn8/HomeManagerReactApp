import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import ProjectListCard from '@/project/compoment/project-list-card';
import { useProjects } from '@/project/hooks/use-projects';
import { openProjectDetail } from '@/project/project-navigation';
import type { HomeProject } from '@/project/project-model';

type ProjectSort = 'dueDate' | 'status' | 'room';

const sortOptions: { id: ProjectSort; label: string }[] = [
	{ id: 'dueDate', label: 'Due date' },
	{ id: 'status', label: 'Status' },
	{ id: 'room', label: 'Room' },
];

function getDueDateTimestamp(dueDate?: string) {
	if (!dueDate) return Number.POSITIVE_INFINITY;
	const dateText = /\b\d{4}\b/.test(dueDate) ? dueDate : `${dueDate} ${new Date().getFullYear()}`;
	const timestamp = new Date(dateText).getTime();
	return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function ProjectScreen() {
	const { data: projects = [] } = useProjects();
	const [searchText, setSearchText] = useState('');
	const [showCompleted, setShowCompleted] = useState(false);
	const [sortBy, setSortBy] = useState<ProjectSort>('dueDate');
	const filteredProjects = useMemo(() => {
		const normalizedSearch = searchText.trim().toLowerCase();

		return projects.filter((project) => {
			const matchesSearch = `${project.title} ${project.room ?? ''}`.toLowerCase().includes(normalizedSearch);
			const matchesStatus = showCompleted || project.projectStatus !== 'Completed';
			return matchesSearch && matchesStatus;
		}).sort((first, second) => {
			if (sortBy === 'status') {
				const statusOrder = ['In progress', 'Planning', 'On hold', 'Completed'];
				return statusOrder.indexOf(first.projectStatus) - statusOrder.indexOf(second.projectStatus)
					|| first.title.localeCompare(second.title);
			}
			if (sortBy === 'room') {
				return (first.room ?? '').localeCompare(second.room ?? '') || first.title.localeCompare(second.title);
			}
			return getDueDateTimestamp(first.dueDate) - getDueDateTimestamp(second.dueDate)
				|| first.title.localeCompare(second.title);
		});
	}, [projects, searchText, showCompleted, sortBy]);
	const groupedProjects = useMemo(() => {
		const groups = new Map<string, typeof filteredProjects>();
		filteredProjects.forEach((project) => {
			const groupName = sortBy === 'status' ? project.projectStatus : project.room || 'No room';
			groups.set(groupName, [...(groups.get(groupName) ?? []), project]);
		});
		return [...groups.entries()].map(([title, groupProjects]) => ({ title, projects: groupProjects }));
	}, [filteredProjects, sortBy]);
	const handleCreateProject = () => router.push('/project-add');

	const renderProjectCard = (project: HomeProject) => (
		<ProjectListCard
			dueDate={project.dueDate}
			key={project.id}
			numberOfTasks={project.numberOfTasks}
			onPress={() => openProjectDetail(project)}
			projectStatus={project.projectStatus}
			projectStatusBackgroundClass={project.projectStatusBackgroundClass}
			projectStatusTextClass={project.projectStatusTextClass}
			room={project.room}
			spentBudget={project.spentBudget}
			tasksCompleted={project.tasksCompleted}
			title={project.title}
			totalBudget={project.totalBudget}
		/>
	);

	return (
		<SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
			<ScrollView
				className="flex-1"
				contentContainerClassName="gap-3 px-screen pb-28 pt-2">
				<View className="flex-row items-center justify-between">
					<TitleText title="Projects" />
					<TopBarButton label="+ New" onPress={handleCreateProject} />
				</View>
				<TextInput
					accessibilityLabel="Search projects"
					autoCapitalize="none"
					className="mb-2 mt-1 h-[52px] rounded-input border border-hairline bg-white px-4 font-sans text-[16px] text-ink placeholder:text-ink-faint"
					onChangeText={setSearchText}
					placeholder="Search projects"
					returnKeyType="search"
					value={searchText}
				/>
				<View
					className="mb-2 flex-row items-center justify-between rounded-card border border-hairline bg-white px-4 py-3"
				>
					<Text className="font-sans-semibold text-[14px] text-ink">Show completed projects</Text>
					<Switch
						accessibilityLabel="Show completed projects"
						onValueChange={setShowCompleted}
						value={showCompleted}
					/>
				</View>
				<View className="gap-2">
					<Text className="font-sans-semibold text-[14px] text-ink">Sort by</Text>
					<View className="flex-row rounded-button bg-sage-tint p-1">
						{sortOptions.map((option) => (
							<Pressable
								accessibilityRole="tab"
								accessibilityState={{ selected: sortBy === option.id }}
								className={`flex-1 items-center rounded-button px-1 py-2 ${sortBy === option.id ? 'bg-forest' : 'bg-transparent'}`}
								key={option.id}
								onPress={() => setSortBy(option.id)}
							>
								<Text className={`font-sans-semibold text-[12px] ${sortBy === option.id ? 'text-white' : 'text-ink-muted'}`}>
									{option.label}
								</Text>
							</Pressable>
						))}
					</View>
				</View>
				{projects.length > 0 ? filteredProjects.length > 0 ? sortBy === 'room' || sortBy === 'status' ? (
					<View className="gap-4">
						{groupedProjects.map((group) => (
							<View className="gap-2" key={group.title}>
								<Text className="font-serif-semibold text-[20px] text-ink">{group.title}</Text>
								{group.projects.map(renderProjectCard)}
							</View>
						))}
					</View>
				) : filteredProjects.map(renderProjectCard) : (
					<Text className="rounded-card border border-dashed border-hairline px-4 py-8 text-center font-sans text-[15px] text-ink-muted">
						{searchText.trim() ? 'No projects match your search.' : showCompleted ? 'No completed projects match your search.' : 'No active projects match your search.'}
					</Text>
				) : (
					<Text className="rounded-card border border-dashed border-hairline px-4 py-8 text-center font-sans text-[15px] text-ink-muted">
						No projects yet. Start one to track tasks and budget together.
					</Text>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
