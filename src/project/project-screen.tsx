import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TitleText } from '@/components/title-text';
import { TopBarButton } from '@/components/top-bar-button';
import ProjectListCard, { type ProjectStatus } from '@/project/compoment/project-list-card';

const projects = [
	{
		id: 'kitchen-refresh',
		title: 'Kitchen refresh',
		projectStatus: 'In progress' as ProjectStatus,
		projectStatusTextClass: 'text-forest' as const,
		projectStatusBackgroundClass: 'bg-sage-tint' as const,
		room: 'Kitchen',
		dueDate: 'Oct 12',
		numberOfTasks: 8,
		tasksCompleted: 3,
		totalBudget: 1200,
		spentBudget: 460,
	},
	{
		id: 'guest-room',
		title: 'Prepare guest room',
		projectStatus: 'Planning' as ProjectStatus,
		projectStatusTextClass: 'text-clay' as const,
		projectStatusBackgroundClass: 'bg-clay-tint' as const,
		room: 'Guest room',
		dueDate: 'Nov 2',
		numberOfTasks: 6,
		tasksCompleted: 1,
		totalBudget: 500,
		spentBudget: 75,
	},
	{
		id: 'garden-beds',
		title: 'Refresh garden beds',
		projectStatus: 'In progress' as ProjectStatus,
		projectStatusTextClass: 'text-forest' as const,
		projectStatusBackgroundClass: 'bg-sage-tint' as const,
		room: 'Garden',
		dueDate: 'Oct 25',
		numberOfTasks: 5,
		tasksCompleted: 4,
		totalBudget: 350,
		spentBudget: 290,
	},
];

export function ProjectScreen() {
	const handleCreateProject = () => router.push('/project-add');

	return (
		<SafeAreaView className="flex-1 bg-canvas-tint" edges={['top']}>
			<ScrollView
				className="flex-1"
				contentContainerClassName="gap-3 px-screen pb-28 pt-2"
			>
				<View className="flex-row items-center justify-between">
					<TitleText title="Projects" />
					<TopBarButton label="+ New" onPress={handleCreateProject} />
				</View>
				{projects.map((project) => (
					<ProjectListCard
						dueDate={project.dueDate}
						key={project.id}
						numberOfTasks={project.numberOfTasks}
						onPress={() => router.push({
							pathname: '/project-detail',
							params: {
								title: project.title,
								room: project.room,
								dueDate: project.dueDate,
								totalBudget: String(project.totalBudget),
								spentBudget: String(project.spentBudget),
							},
						})}
						projectStatus={project.projectStatus}
						projectStatusBackgroundClass={project.projectStatusBackgroundClass}
						projectStatusTextClass={project.projectStatusTextClass}
						room={project.room}
						spentBudget={project.spentBudget}
						tasksCompleted={project.tasksCompleted}
						title={project.title}
						totalBudget={project.totalBudget}
					/>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}
