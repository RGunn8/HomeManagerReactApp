import { ProjectStatusPill, type ProjectStatus, type ProjectStatusBackgroundClass, type ProjectStatusTextClass } from '@/project/component/project-status-pill';
import { Pressable, Text, View } from 'react-native';

export type { ProjectStatus } from '@/project/component/project-status-pill';

type ProjectListCardProps = {
  title: string;
  projectStatus: ProjectStatus;
  projectStatusTextClass: ProjectStatusTextClass;
  projectStatusBackgroundClass: ProjectStatusBackgroundClass;
  room?: string; 
  dueDate?: string;
  numberOfTasks: number;
  tasksCompleted: number;
  totalBudget?: number;
  spentBudget?: number;
  onPress: () => void;
};

const ProjectListCard = ({title, projectStatus, projectStatusTextClass, projectStatusBackgroundClass, room, dueDate, numberOfTasks, tasksCompleted, totalBudget, spentBudget, onPress}: ProjectListCardProps) => {
  const progress = numberOfTasks > 0
    ? Math.min(100, Math.max(0, (tasksCompleted / numberOfTasks) * 100))
    : 0;

  return (
   <Pressable className='flex  flex-col w-full bg-white p-4 m-2 rounded-lg shadow-sm' onPress={onPress}>
    <View className='flex w-full flex-row items-center justify-between'>    
    <View className='flex min-w-0 flex-col'> 
     <Text className='text-lg font-ink font-bold'>{title}</Text>
    <Text className='text-m font-ink'>{room} * due {dueDate}</Text>

   </View>
  <ProjectStatusPill
    backgroundClass={projectStatusBackgroundClass}
    status={projectStatus}
    textClass={projectStatusTextClass}
  />
   </View>

   <View className='mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas'>
    <View
      accessibilityRole='progressbar'
      accessibilityValue={{min: 0, max: 100, now: progress}}
      className='h-full rounded-full bg-forest'
      style={{width: `${progress}%`}}
    />
   </View>

   <View className='flex flex-row w-full justify-between mt-3'>
    <Text className='text-m font-ink'>Tasks: {tasksCompleted}/{numberOfTasks}</Text>
    <Text className='text-m font-ink'>Budget: ${spentBudget ?? 0}/${totalBudget ?? 0}</Text>
   </View>
   
   </Pressable>
  );
};



export default ProjectListCard;