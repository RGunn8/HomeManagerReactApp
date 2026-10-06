import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHomeId } from '@/home/hooks/use-home';
import type { CreateProjectMaterialRequest, CreateProjectRequest, Id, UpdateProjectMaterialRequest, UpdateProjectRequest } from '@/lib/api-types';
import { useOfflineMutation } from '@/lib/offline/offline-mutation';
import { createTempId, isTempId } from '@/lib/offline/temp-ids';
import { queryKeys } from '@/lib/query-keys';
import { getProject, getProjects } from '@/project/api/project-api';
import {
  createProjectMaterialMutation,
  createProjectMutation,
  deleteProjectMaterialMutation,
  deleteProjectMutation,
  updateProjectMaterialMutation,
  updateProjectMutation,
} from '@/project/project-mutations';
import { toHomeProject } from '@/project/project-model';
import { useTasks } from '@/task/hooks/use-tasks';

/** Projects with task progress taken from the task list, so offline task changes show immediately. */
export function useProjects() {
  const homeId = useHomeId();
  const { data: tasks } = useTasks();
  const query = useQuery({
    queryKey: queryKeys.projects(homeId ?? ''),
    queryFn: () => getProjects(homeId!),
    enabled: Boolean(homeId),
  });
  const projects = useMemo(() => query.data?.map((project) => {
    const homeProject = toHomeProject(project);
    const projectTasks = tasks?.filter((task) => task.projectId === project.id);
    return projectTasks
      ? { ...homeProject, numberOfTasks: projectTasks.length, tasksCompleted: projectTasks.filter((task) => task.checked).length }
      : homeProject;
  }), [query.data, tasks]);

  return { ...query, data: projects };
}

export function useProject(projectId: Id | undefined) {
  const homeId = useHomeId();

  return useQuery({
    queryKey: queryKeys.project(homeId ?? '', projectId ?? ''),
    queryFn: () => getProject(homeId!, projectId!),
    // A project created offline only exists in the cache until it syncs.
    enabled: Boolean(homeId && projectId && !isTempId(projectId)),
  });
}

/** Queues a new project and returns its temp id, so tasks and materials can be added to it straight away. */
export function useCreateProject() {
  const mutation = useOfflineMutation(createProjectMutation);
  return {
    ...mutation,
    mutate: (request: CreateProjectRequest) => {
      const tempId = createTempId();
      mutation.mutate({ tempId, request });
      return tempId;
    },
  };
}

export function useUpdateProject() {
  const mutation = useOfflineMutation(updateProjectMutation);
  return {
    ...mutation,
    mutate: ({ projectId, ...request }: UpdateProjectRequest & { projectId: Id }) => mutation.mutate({ projectId, request }),
  };
}

export function useDeleteProject() {
  const mutation = useOfflineMutation(deleteProjectMutation);
  return { ...mutation, mutate: (projectId: Id) => mutation.mutate({ projectId }) };
}

export function useCreateProjectMaterial() {
  const mutation = useOfflineMutation(createProjectMaterialMutation);
  return {
    ...mutation,
    mutate: ({ projectId, ...request }: CreateProjectMaterialRequest & { projectId: Id }) =>
      mutation.mutate({ projectId, tempId: createTempId(), request }),
  };
}

export function useUpdateProjectMaterial() {
  const mutation = useOfflineMutation(updateProjectMaterialMutation);
  return {
    ...mutation,
    mutate: ({ projectId, materialId, ...request }: UpdateProjectMaterialRequest & { projectId: Id; materialId: Id }) =>
      mutation.mutate({ projectId, materialId, request }),
  };
}

export function useDeleteProjectMaterial() {
  return useOfflineMutation(deleteProjectMaterialMutation);
}
