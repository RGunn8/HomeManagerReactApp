import type { QueryClient } from '@tanstack/react-query';

import type {
  ApiProject,
  ApiProjectMaterial,
  ApiRoom,
  CreateProjectMaterialRequest,
  CreateProjectRequest,
  Id,
  UpdateProjectMaterialRequest,
  UpdateProjectRequest,
} from '@/lib/api-types';
import { nowIso, updateQuery } from '@/lib/offline/cache';
import { defineOfflineMutation } from '@/lib/offline/offline-mutation';
import { queryKeys } from '@/lib/query-keys';
import {
  createProject,
  createProjectMaterial,
  deleteProject,
  deleteProjectMaterial,
  updateProject,
  updateProjectMaterial,
} from '@/project/api/project-api';

/** Applies an update to a project in both the list and its detail query. */
function updateProjectInCache(queryClient: QueryClient, homeId: Id, projectId: Id, update: (project: ApiProject) => ApiProject) {
  updateQuery<ApiProject[]>(queryClient, queryKeys.projects(homeId), (projects) =>
    projects.map((project) => (project.id === projectId ? update(project) : project)));
  updateQuery<ApiProject>(queryClient, queryKeys.project(homeId, projectId), update);
}

function findRoom(queryClient: QueryClient, homeId: Id, roomId: Id | undefined) {
  const room = roomId ? queryClient.getQueryData<ApiRoom[]>(queryKeys.rooms(homeId))?.find((candidate) => candidate.roomId === roomId) : undefined;
  return room ? { id: room.roomId, name: room.name } : null;
}

function applyProjectChanges(project: ApiProject, { targetDate, assigneeId, ...changes }: UpdateProjectRequest): ApiProject {
  return {
    ...project,
    ...changes,
    ...(targetDate !== undefined ? { targetCompletionDate: targetDate.slice(0, 10) } : {}),
    ...(assigneeId !== undefined ? { assigneeId } : {}),
    updatedAt: nowIso(),
  };
}

export const createProjectMutation = defineOfflineMutation({
  key: 'projects.create',
  mutationFn: ({ homeId, request }: { homeId: Id; tempId: Id; request: CreateProjectRequest }) => createProject(homeId, request),
  optimistic: (queryClient, { homeId, tempId, request }) => {
    const now = nowIso();
    const project: ApiProject = {
      id: tempId,
      name: request.name,
      description: request.description ?? null,
      status: request.status ?? 'NOT_STARTED',
      targetCompletionDate: request.targetDate?.slice(0, 10) ?? null,
      completedDate: null,
      estimatedCost: request.estimatedCost ?? null,
      actualCost: request.actualCost ?? null,
      homeId,
      roomId: request.roomId ?? null,
      assigneeId: request.assigneeId ?? null,
      room: findRoom(queryClient, homeId, request.roomId),
      tasks: [],
      materials: [],
      createdAt: now,
      updatedAt: now,
    };
    updateQuery<ApiProject[]>(queryClient, queryKeys.projects(homeId), (projects) => [...projects, project]);
    queryClient.setQueryData(queryKeys.project(homeId, tempId), project);
  },
  createdIds: (project, { tempId }) => [[tempId, project.id]],
});

export const updateProjectMutation = defineOfflineMutation({
  key: 'projects.update',
  mutationFn: ({ homeId, projectId, request }: { homeId: Id; projectId: Id; request: UpdateProjectRequest }) =>
    updateProject(homeId, projectId, request),
  optimistic: (queryClient, { homeId, projectId, request }) =>
    updateProjectInCache(queryClient, homeId, projectId, (project) => applyProjectChanges(project, request)),
});

export const deleteProjectMutation = defineOfflineMutation({
  key: 'projects.delete',
  mutationFn: ({ homeId, projectId }: { homeId: Id; projectId: Id }) => deleteProject(homeId, projectId),
  optimistic: (queryClient, { homeId, projectId }) =>
    updateQuery<ApiProject[]>(queryClient, queryKeys.projects(homeId), (projects) => projects.filter((project) => project.id !== projectId)),
});

export const createProjectMaterialMutation = defineOfflineMutation({
  key: 'projects.materials.create',
  mutationFn: ({ homeId, projectId, request }: { homeId: Id; projectId: Id; tempId: Id; request: CreateProjectMaterialRequest }) =>
    createProjectMaterial(homeId, projectId, request),
  optimistic: (queryClient, { homeId, projectId, tempId, request }) => {
    const now = nowIso();
    const material: ApiProjectMaterial = {
      id: tempId,
      name: request.name,
      quantity: request.quantity ?? 1,
      unitCost: request.unitCost ?? null,
      purchased: request.purchased ?? false,
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    updateProjectInCache(queryClient, homeId, projectId, (project) => ({ ...project, materials: [...project.materials, material] }));
  },
  createdIds: (material, { tempId }) => [[tempId, material.id]],
});

export const updateProjectMaterialMutation = defineOfflineMutation({
  key: 'projects.materials.update',
  mutationFn: ({ homeId, projectId, materialId, request }: { homeId: Id; projectId: Id; materialId: Id; request: UpdateProjectMaterialRequest }) =>
    updateProjectMaterial(homeId, projectId, materialId, request),
  optimistic: (queryClient, { homeId, projectId, materialId, request }) =>
    updateProjectInCache(queryClient, homeId, projectId, (project) => ({
      ...project,
      materials: project.materials.map((material) => (material.id === materialId ? { ...material, ...request, updatedAt: nowIso() } : material)),
    })),
});

export const deleteProjectMaterialMutation = defineOfflineMutation({
  key: 'projects.materials.delete',
  mutationFn: ({ homeId, projectId, materialId }: { homeId: Id; projectId: Id; materialId: Id }) =>
    deleteProjectMaterial(homeId, projectId, materialId),
  optimistic: (queryClient, { homeId, projectId, materialId }) =>
    updateProjectInCache(queryClient, homeId, projectId, (project) => ({
      ...project,
      materials: project.materials.filter((material) => material.id !== materialId),
    })),
});
