import { homePath } from '@/home/api/home-api';
import { apiJson, jsonBody } from '@/lib/api-client';
import type {
  ApiNote,
  ApiRoom,
  ApiRoomCreated,
  ApiRoomDetail,
  ApiRoomSummary,
  CreateInventoryRequest,
  CreateTaskRequest,
  Id,
} from '@/lib/api-types';

export type CreateRoomRequest = {
  name: string;
  roomEmoji: string;
  tasks?: Omit<CreateTaskRequest, 'roomId'>[];
  inventory?: Omit<CreateInventoryRequest, 'roomId'>[];
};

export function getRooms(homeId: Id) {
  return apiJson<ApiRoom[]>(homePath(homeId, '/rooms'));
}

export function getRoom(homeId: Id, roomId: Id) {
  return apiJson<ApiRoomDetail>(homePath(homeId, `/rooms/${roomId}`));
}

export function createRoom(homeId: Id, request: CreateRoomRequest) {
  return apiJson<ApiRoomCreated>(homePath(homeId, '/rooms'), { method: 'POST', ...jsonBody(request) });
}

export function updateRoom(homeId: Id, roomId: Id, request: { name?: string; roomEmoji?: string }) {
  return apiJson<ApiRoomSummary>(homePath(homeId, `/rooms/${roomId}`), { method: 'PATCH', ...jsonBody(request) });
}

export function deleteRoom(homeId: Id, roomId: Id) {
  return apiJson<void>(homePath(homeId, `/rooms/${roomId}`), { method: 'DELETE' });
}

export function getRoomNotes(homeId: Id, roomId: Id) {
  return apiJson<ApiNote[]>(homePath(homeId, `/rooms/${roomId}/notes`));
}

export function createRoomNote(homeId: Id, roomId: Id, content: string) {
  return apiJson<ApiNote>(homePath(homeId, `/rooms/${roomId}/notes`), { method: 'POST', ...jsonBody({ content }) });
}

export function updateRoomNote(homeId: Id, roomId: Id, noteId: Id, content: string) {
  return apiJson<ApiNote>(homePath(homeId, `/rooms/${roomId}/notes/${noteId}`), { method: 'PATCH', ...jsonBody({ content }) });
}

export function deleteRoomNote(homeId: Id, roomId: Id, noteId: Id) {
  return apiJson<void>(homePath(homeId, `/rooms/${roomId}/notes/${noteId}`), { method: 'DELETE' });
}
