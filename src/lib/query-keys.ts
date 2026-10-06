import type { Id, TaskStatus } from '@/lib/api-types';

export const queryKeys = {
  homes: ['homes'] as const,
  home: (homeId: Id) => ['homes', homeId] as const,
  members: (homeId: Id) => ['homes', homeId, 'members'] as const,
  rooms: (homeId: Id) => ['homes', homeId, 'rooms'] as const,
  room: (homeId: Id, roomId: Id) => ['homes', homeId, 'rooms', roomId] as const,
  tasks: (homeId: Id, status?: TaskStatus) =>
    (status ? ['homes', homeId, 'tasks', { status }] : ['homes', homeId, 'tasks']) as readonly unknown[],
  projects: (homeId: Id) => ['homes', homeId, 'projects'] as const,
  project: (homeId: Id, projectId: Id) => ['homes', homeId, 'projects', projectId] as const,
  inventory: (homeId: Id) => ['homes', homeId, 'inventory'] as const,
  inventoryAutocomplete: (homeId: Id, query: string) => ['homes', homeId, 'inventory', 'autocomplete', query] as const,
  shoppingTrips: (homeId: Id) => ['homes', homeId, 'shopping-trips'] as const,
  shoppingMode: (homeId: Id, tripId: Id) => ['homes', homeId, 'shopping-trips', tripId, 'shopping-mode'] as const,
  today: (homeId: Id) => ['homes', homeId, 'today'] as const,
};
