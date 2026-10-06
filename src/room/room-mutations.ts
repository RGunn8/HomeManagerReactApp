import type { QueryClient } from '@tanstack/react-query';

import { addInventoryItemsToCache, toOptimisticInventoryItem } from '@/inventory/inventory-mutations';
import type { ApiRoom, ApiRoomDetail, Id } from '@/lib/api-types';
import { nowIso, updateQuery } from '@/lib/offline/cache';
import { defineOfflineMutation } from '@/lib/offline/offline-mutation';
import { queryKeys } from '@/lib/query-keys';
import {
  createRoom,
  createRoomNote,
  deleteRoom,
  deleteRoomNote,
  updateRoom,
  updateRoomNote,
  type CreateRoomRequest,
} from '@/room/api/room-api';
import { addTasksToCache, toOptimisticTask } from '@/task/task-mutations';

type CreateRoomVariables = {
  homeId: Id;
  tempId: Id;
  /** Temp ids for the nested tasks and inventory, in the same order as the request. */
  taskTempIds: Id[];
  inventoryTempIds: Id[];
  request: CreateRoomRequest;
};

export const createRoomMutation = defineOfflineMutation({
  key: 'rooms.create',
  mutationFn: ({ homeId, request }: CreateRoomVariables) => createRoom(homeId, request),
  optimistic: (queryClient, { homeId, tempId, taskTempIds, inventoryTempIds, request }) => {
    const tasks = request.tasks ?? [];
    updateQuery<ApiRoom[]>(queryClient, queryKeys.rooms(homeId), (rooms) => [...rooms, {
      roomId: tempId,
      homeId,
      name: request.name,
      roomEmoji: request.roomEmoji,
      openTasks: tasks.length,
      lowStockItems: 0,
      itemsTracked: request.inventory?.length ?? 0,
    }]);
    queryClient.setQueryData<ApiRoomDetail>(queryKeys.room(homeId, tempId), {
      roomId: tempId,
      homeId,
      name: request.name,
      roomEmoji: request.roomEmoji,
      notes: [],
      projects: 0,
      tasks: tasks.length,
      inventory: request.inventory?.length ?? 0,
    });
    addTasksToCache(queryClient, homeId, tasks.map((task, index) =>
      toOptimisticTask(homeId, taskTempIds[index], { ...task, roomId: tempId })));
    addInventoryItemsToCache(queryClient, homeId, (request.inventory ?? []).map((item, index) =>
      toOptimisticInventoryItem(homeId, inventoryTempIds[index], { ...item, roomId: tempId })));
  },
  createdIds: (room, { tempId, taskTempIds, inventoryTempIds }) => {
    const pairs: [string, string][] = [
      [tempId, room.roomId],
      ...room.tasks.map((task, index): [string, string] => [taskTempIds[index], task.id]),
      ...room.inventory.map((item, index): [string, string] => [inventoryTempIds[index], item.id]),
    ];
    return pairs.filter(([id]) => Boolean(id));
  },
});

type RoomChanges = { name?: string; roomEmoji?: string };

export const updateRoomMutation = defineOfflineMutation({
  key: 'rooms.update',
  mutationFn: ({ homeId, roomId, request }: { homeId: Id; roomId: Id; request: RoomChanges }) => updateRoom(homeId, roomId, request),
  optimistic: (queryClient, { homeId, roomId, request }) => {
    updateQuery<ApiRoom[]>(queryClient, queryKeys.rooms(homeId), (rooms) =>
      rooms.map((room) => (room.roomId === roomId ? { ...room, ...request } : room)));
    updateQuery<ApiRoomDetail>(queryClient, queryKeys.room(homeId, roomId), (room) => ({ ...room, ...request }));
  },
});

export const deleteRoomMutation = defineOfflineMutation({
  key: 'rooms.delete',
  mutationFn: ({ homeId, roomId }: { homeId: Id; roomId: Id }) => deleteRoom(homeId, roomId),
  optimistic: (queryClient, { homeId, roomId }) =>
    updateQuery<ApiRoom[]>(queryClient, queryKeys.rooms(homeId), (rooms) => rooms.filter((room) => room.roomId !== roomId)),
});

const updateRoomNotes = (
  queryClient: QueryClient,
  homeId: Id,
  roomId: Id,
  update: (notes: ApiRoomDetail['notes']) => ApiRoomDetail['notes'],
) => updateQuery<ApiRoomDetail>(queryClient, queryKeys.room(homeId, roomId), (room) => ({ ...room, notes: update(room.notes) }));

export const createRoomNoteMutation = defineOfflineMutation({
  key: 'rooms.notes.create',
  mutationFn: ({ homeId, roomId, content }: { homeId: Id; roomId: Id; tempId: Id; content: string }) =>
    createRoomNote(homeId, roomId, content),
  optimistic: (queryClient, { homeId, roomId, tempId, content }) => {
    const now = nowIso();
    updateRoomNotes(queryClient, homeId, roomId, (notes) => [{ id: tempId, content, roomId, createdAt: now, updatedAt: now }, ...notes]);
  },
  createdIds: (note, { tempId }) => [[tempId, note.id]],
});

export const updateRoomNoteMutation = defineOfflineMutation({
  key: 'rooms.notes.update',
  mutationFn: ({ homeId, roomId, noteId, content }: { homeId: Id; roomId: Id; noteId: Id; content: string }) =>
    updateRoomNote(homeId, roomId, noteId, content),
  optimistic: (queryClient, { homeId, roomId, noteId, content }) =>
    updateRoomNotes(queryClient, homeId, roomId, (notes) =>
      notes.map((note) => (note.id === noteId ? { ...note, content, updatedAt: nowIso() } : note))),
});

export const deleteRoomNoteMutation = defineOfflineMutation({
  key: 'rooms.notes.delete',
  mutationFn: ({ homeId, roomId, noteId }: { homeId: Id; roomId: Id; noteId: Id }) => deleteRoomNote(homeId, roomId, noteId),
  optimistic: (queryClient, { homeId, roomId, noteId }) =>
    updateRoomNotes(queryClient, homeId, roomId, (notes) => notes.filter((note) => note.id !== noteId)),
});
