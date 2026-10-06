import type { ProjectStatus, ProjectStatusBackgroundClass, ProjectStatusTextClass } from '@/project/component/project-status-pill';
import { formatShortDate } from '@/lib/dates';
import type { ApiProject, ProjectStatusValue } from '@/lib/api-types';

export type HomeProject = {
    id: string;
    title: string;
    description?: string;
    status: ProjectStatusValue;
    projectStatus: ProjectStatus;
    projectStatusTextClass: ProjectStatusTextClass;
    projectStatusBackgroundClass: ProjectStatusBackgroundClass;
    room?: string;
    roomId?: string;
    dueDate?: string;
    numberOfTasks: number;
    tasksCompleted: number;
    totalBudget?: number;
    spentBudget?: number;
};

const statusDisplay: Record<ProjectStatusValue, Pick<HomeProject, 'projectStatus' | 'projectStatusTextClass' | 'projectStatusBackgroundClass'>> = {
    NOT_STARTED: { projectStatus: 'Planning', projectStatusTextClass: 'text-clay', projectStatusBackgroundClass: 'bg-clay-tint' },
    IN_PROGRESS: { projectStatus: 'In progress', projectStatusTextClass: 'text-forest', projectStatusBackgroundClass: 'bg-sage-tint' },
    COMPLETED: { projectStatus: 'Completed', projectStatusTextClass: 'text-forest', projectStatusBackgroundClass: 'bg-sage-tint' },
    CANCELLED: { projectStatus: 'On hold', projectStatusTextClass: 'text-overdue', projectStatusBackgroundClass: 'bg-error-tint' },
};

export const projectStatusValues: Record<ProjectStatus, ProjectStatusValue> = {
    Planning: 'NOT_STARTED',
    'In progress': 'IN_PROGRESS',
    Completed: 'COMPLETED',
    'On hold': 'CANCELLED',
};

export function toHomeProject(project: ApiProject): HomeProject {
    const tasks = project.tasks ?? [];

    return {
        id: project.id,
        title: project.name,
        description: project.description ?? undefined,
        status: project.status,
        ...statusDisplay[project.status] ?? statusDisplay.NOT_STARTED,
        room: project.room?.name,
        roomId: project.roomId ?? undefined,
        dueDate: formatShortDate(project.targetCompletionDate),
        numberOfTasks: tasks.length,
        tasksCompleted: tasks.filter((task) => task.status === 'DONE').length,
        totalBudget: project.estimatedCost ?? undefined,
        spentBudget: project.actualCost ?? undefined,
    };
}
