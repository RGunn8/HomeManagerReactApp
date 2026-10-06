import { homePath } from '@/home/api/home-api';
import { apiJson, jsonBody } from '@/lib/api-client';
import type { ApiTask, CreateTaskRequest, Id, UpdateTaskRequest } from '@/lib/api-types';

export function getTasks(homeId: Id) {
  return apiJson<ApiTask[]>(homePath(homeId, '/tasks'));
}

export function createTask(homeId: Id, request: CreateTaskRequest) {
  return apiJson<ApiTask>(homePath(homeId, '/tasks'), { method: 'POST', ...jsonBody(request) });
}

export function updateTask(homeId: Id, taskId: Id, request: UpdateTaskRequest) {
  return apiJson<ApiTask>(homePath(homeId, `/tasks/${taskId}`), { method: 'PATCH', ...jsonBody(request) });
}

export function deleteTask(homeId: Id, taskId: Id) {
  return apiJson<void>(homePath(homeId, `/tasks/${taskId}`), { method: 'DELETE' });
}
