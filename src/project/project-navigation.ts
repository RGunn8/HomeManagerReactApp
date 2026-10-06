import { router } from 'expo-router';

import type { HomeProject } from '@/project/project-model';

export function openProjectDetail(project: HomeProject) {
    router.push({ pathname: '/project-detail', params: { projectId: project.id, title: project.title } });
}
