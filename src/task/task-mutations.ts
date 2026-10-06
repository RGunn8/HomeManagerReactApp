import type { QueryClient } from '@tanstack/react-query';

import type { ApiTask, CreateTaskRequest, Id, UpdateTaskRequest } from '@/lib/api-types';
import { nowIso, updateQuery } from '@/lib/offline/cache';
import { defineOfflineMutation } from '@/lib/offline/offline-mutation';
import { queryKeys } from '@/lib/query-keys';
import { createTask, deleteTask, updateTask } from '@/task/api/task-api';

/** Builds the task the server will create, so it can be shown before the request is sent. */
export function toOptimisticTask(homeId: Id, id: Id, request: CreateTaskRequest): ApiTask {
  const now = nowIso();
  return {
    id,
    title: request.title,
    notes: request.notes ?? null,
    type: request.type,
    status: 'TODO',
    dueDate: request.dueDate ?? null,
    completedAt: null,
    recurrenceFrequency: request.recurrenceFrequency,
    recurrenceInterval: request.recurrenceInterval,
    homeId,
    roomId: request.roomId ?? null,
    projectId: request.projectId ?? null,
    assigneeId: request.assigneeId ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function addTasksToCache(queryClient: QueryClient, homeId: Id, tasks: ApiTask[]) {
  updateQuery<ApiTask[]>(queryClient, queryKeys.tasks(homeId), (current) => [...current, ...tasks]);
}

export const createTaskMutation = defineOfflineMutation({
  key: 'tasks.create',
  mutationFn: ({ homeId, request }: { homeId: Id; tempId: Id; request: CreateTaskRequest }) => createTask(homeId, request),
  optimistic: (queryClient, { homeId, tempId, request }) =>
    addTasksToCache(queryClient, homeId, [toOptimisticTask(homeId, tempId, request)]),
  createdIds: (task, { tempId }) => [[tempId, task.id]],
});

export const updateTaskMutation = defineOfflineMutation({
  key: 'tasks.update',
  mutationFn: ({ homeId, taskId, request }: { homeId: Id; taskId: Id; request: UpdateTaskRequest }) =>
    updateTask(homeId, taskId, request),
  optimistic: (queryClient, { homeId, taskId, request }) =>
    updateQuery<ApiTask[]>(queryClient, queryKeys.tasks(homeId), (tasks) => tasks.map((task) => {
      if (task.id !== taskId) return task;
      const completedAt = request.status === undefined ? task.completedAt : request.status === 'DONE' ? nowIso() : null;
      return { ...task, ...request, completedAt, updatedAt: nowIso() } as ApiTask;
    })),
});

export const deleteTaskMutation = defineOfflineMutation({
  key: 'tasks.delete',
  mutationFn: ({ homeId, taskId }: { homeId: Id; taskId: Id }) => deleteTask(homeId, taskId),
  optimistic: (queryClient, { homeId, taskId }) =>
    updateQuery<ApiTask[]>(queryClient, queryKeys.tasks(homeId), (tasks) => tasks.filter((task) => task.id !== taskId)),
});
