import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useHomeId } from '@/home/hooks/use-home';
import { useInventory } from '@/inventory/hooks/use-inventory';
import { isInventoryItemLow } from '@/inventory/inventory-model';
import type { Id } from '@/lib/api-types';
import { useOfflineMutation } from '@/lib/offline/offline-mutation';
import { createTempId, isTempId } from '@/lib/offline/temp-ids';
import { queryKeys } from '@/lib/query-keys';
import { getRoom, getRooms, type CreateRoomRequest } from '@/room/api/room-api';
import {
  createRoomMutation,
  createRoomNoteMutation,
  deleteRoomMutation,
  deleteRoomNoteMutation,
  updateRoomMutation,
  updateRoomNoteMutation,
} from '@/room/room-mutations';
import { getRoomIcon, type HomeRoom } from '@/room/room-model';
import { useTasks } from '@/task/hooks/use-tasks';

export function useApiRooms() {
  const homeId = useHomeId();

  return useQuery({
    queryKey: queryKeys.rooms(homeId ?? ''),
    queryFn: () => getRooms(homeId!),
    enabled: Boolean(homeId),
  });
}

export function useRoomNamesById() {
  const { data: rooms } = useApiRooms();
  return useMemo(() => new Map((rooms ?? []).map((room) => [room.roomId, room.name])), [rooms]);
}

/**
 * Rooms with open-task and inventory counts. Counts are derived from the cached task and inventory
 * lists when available, so changes made offline show up immediately; otherwise the server's counts are used.
 */
export function useRooms() {
  const roomsQuery = useApiRooms();
  const { data: tasks } = useTasks();
  const { data: items } = useInventory();

  const rooms = useMemo<HomeRoom[]>(() => (roomsQuery.data ?? []).map((room) => {
    const roomItems = items?.filter((item) => item.roomId === room.roomId);
    return {
      id: room.roomId,
      name: room.name,
      icon: getRoomIcon(room),
      numOfTask: tasks ? tasks.filter((task) => task.roomId === room.roomId && !task.checked).length : room.openTasks,
      numOfItems: roomItems ? roomItems.length : room.itemsTracked,
      numOfLowItems: roomItems ? roomItems.filter(isInventoryItemLow).length : room.lowStockItems,
    };
  }), [items, roomsQuery.data, tasks]);

  return { ...roomsQuery, data: rooms };
}

/** Room detail, including its notes. */
export function useRoom(roomId: Id | undefined) {
  const homeId = useHomeId();

  return useQuery({
    queryKey: queryKeys.room(homeId ?? '', roomId ?? ''),
    queryFn: () => getRoom(homeId!, roomId!),
    // A room created offline only exists in the cache until it syncs.
    enabled: Boolean(homeId && roomId && !isTempId(roomId)),
  });
}

export function useCreateRoom() {
  const mutation = useOfflineMutation(createRoomMutation);
  return {
    ...mutation,
    mutate: (request: CreateRoomRequest) => {
      const tempId = createTempId();
      mutation.mutate({
        tempId,
        taskTempIds: (request.tasks ?? []).map(() => createTempId()),
        inventoryTempIds: (request.inventory ?? []).map(() => createTempId()),
        request,
      });
      return tempId;
    },
  };
}

export function useUpdateRoom() {
  const mutation = useOfflineMutation(updateRoomMutation);
  return {
    ...mutation,
    mutate: ({ roomId, ...request }: { roomId: Id; name?: string; roomEmoji?: string }) => mutation.mutate({ roomId, request }),
  };
}

export function useDeleteRoom() {
  const mutation = useOfflineMutation(deleteRoomMutation);
  return { ...mutation, mutate: (roomId: Id) => mutation.mutate({ roomId }) };
}

export function useCreateRoomNote() {
  const mutation = useOfflineMutation(createRoomNoteMutation);
  return {
    ...mutation,
    mutate: ({ roomId, content }: { roomId: Id; content: string }) => mutation.mutate({ roomId, content, tempId: createTempId() }),
  };
}

export function useUpdateRoomNote() {
  return useOfflineMutation(updateRoomNoteMutation);
}

export function useDeleteRoomNote() {
  return useOfflineMutation(deleteRoomNoteMutation);
}
