import { useSyncExternalStore } from 'react';

import { offlineSyncStorage } from '@/lib/offline/storage';

/**
 * Records created while offline get a temporary id (`tmp-…`) so later queued changes can refer to
 * them (e.g. add a task to a room that hasn't synced yet). When the create reaches the server, the
 * real id is recorded here and every queued change is rewritten to use it before it is sent.
 */
const TEMP_PREFIX = 'tmp-';
const STORAGE_KEY = 'offline-temp-ids';

let tempIds: Record<string, string> | undefined;
const listeners = new Set<() => void>();

function load() {
  if (!tempIds) {
    try {
      tempIds = JSON.parse(offlineSyncStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, string>;
    } catch {
      tempIds = {};
    }
  }
  return tempIds;
}

export const isTempId = (id: unknown): id is string => typeof id === 'string' && id.startsWith(TEMP_PREFIX);

export function createTempId() {
  return `${TEMP_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function recordTempId(tempId: string, realId: string) {
  tempIds = { ...load(), [tempId]: realId };
  offlineSyncStorage.setItem(STORAGE_KEY, JSON.stringify(tempIds));
  listeners.forEach((listener) => listener());
}

export function resolveId<T extends string | undefined>(id: T): T {
  return (isTempId(id) ? load()[id] ?? id : id) as T;
}

/**
 * Replaces every synced temp id inside a queued change's variables. Unsynced ones are left as is:
 * that is either the create's own temp id, or a parent whose create failed, in which case the
 * server rejects the change.
 */
export function resolveTempIds<T>(value: T): T {
  if (isTempId(value)) return resolveId(value);
  if (Array.isArray(value)) return value.map(resolveTempIds) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveTempIds(entry)])) as T;
  }
  return value;
}

/** True when two ids refer to the same record, even if one is a temp id that has since synced. */
export function sameId(first: string | undefined, second: string | undefined) {
  return first !== undefined && second !== undefined && resolveId(first) === resolveId(second);
}

export function clearTempIds() {
  tempIds = {};
  offlineSyncStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** A route param id that follows its record through sync (temp id → real id). */
export function useResolvedId<T extends string | undefined>(id: T): T {
  return useSyncExternalStore(subscribe, () => resolveId(id));
}
