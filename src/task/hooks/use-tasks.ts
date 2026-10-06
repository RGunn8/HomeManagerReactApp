import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHomeId } from '@/home/hooks/use-home';
import type { CreateTaskRequest, Id, UpdateTaskRequest } from '@/lib/api-types';
import { toApiDate } from '@/lib/dates';
import { useOfflineMutation } from '@/lib/offline/offline-mutation';
import { createTempId } from '@/lib/offline/temp-ids';
import { queryKeys } from '@/lib/query-keys';
import { useRoomNamesById } from '@/room/hooks/use-rooms';
import { getTasks } from '@/task/api/task-api';
import { createTaskMutation, deleteTaskMutation, updateTaskMutation } from '@/task/task-mutations';
import { parseRecurrence, toHomeTask } from '@/task/task-model';

export function useTasks() {
  const homeId = useHomeId();
  const roomNamesById = useRoomNamesById();
  const query = useQuery({
    queryKey: queryKeys.tasks(homeId ?? ''),
    queryFn: () => getTasks(homeId!),
    enabled: Boolean(homeId),
  });
  const tasks = useMemo(
    () => query.data?.map((task) => toHomeTask(task, roomNamesById)),
    [query.data, roomNamesById],
  );

  return { ...query, data: tasks };
}

/** A task drafted in the UI: a name, optional "3 days"-style recurrence detail and optional due date. */
export type TaskDraft = {
  name: string;
  detail?: string;
  notes?: string;
  dueDate?: Date | string;
  roomId?: Id;
  projectId?: Id;
  type?: CreateTaskRequest['type'];
};

export function toCreateTaskRequest({ name, detail, notes, dueDate, roomId, projectId, type }: TaskDraft): CreateTaskRequest {
  return {
    title: name,
    type: type ?? (projectId ? 'PROJECT' : 'CLEANING'),
    ...parseRecurrence(detail),
    ...(notes ? { notes } : {}),
    ...(dueDate ? { dueDate: toApiDate(dueDate) } : {}),
    ...(roomId ? { roomId } : {}),
    ...(projectId ? { projectId } : {}),
  };
}

export function useCreateTask() {
  const mutation = useOfflineMutation(createTaskMutation);
  return { ...mutation, mutate: (draft: TaskDraft) => mutation.mutate({ tempId: createTempId(), request: toCreateTaskRequest(draft) }) };
}

export function useUpdateTask() {
  const mutation = useOfflineMutation(updateTaskMutation);
  return {
    ...mutation,
    mutate: ({ taskId, ...request }: UpdateTaskRequest & { taskId: Id }) => mutation.mutate({ taskId, request }),
  };
}

export function useSetTaskCompleted() {
  const mutation = useOfflineMutation(updateTaskMutation);
  return {
    ...mutation,
    mutate: ({ taskId, checked }: { taskId: Id; checked: boolean }) =>
      mutation.mutate({ taskId, request: { status: checked ? 'DONE' : 'TODO' } }),
  };
}

export function useDeleteTasks() {
  const mutation = useOfflineMutation(deleteTaskMutation);
  return { ...mutation, mutate: (taskIds: Id[]) => taskIds.forEach((taskId) => mutation.mutate({ taskId })) };
}

export function useScheduleTasks() {
  const mutation = useOfflineMutation(updateTaskMutation);
  return {
    ...mutation,
    mutate: ({ taskIds, dueDate }: { taskIds: Id[]; dueDate: Date | string }) =>
      taskIds.forEach((taskId) => mutation.mutate({ taskId, request: { dueDate: toApiDate(dueDate) } })),
  };
}
