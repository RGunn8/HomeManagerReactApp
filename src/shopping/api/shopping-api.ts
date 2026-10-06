import { Platform } from 'react-native';

import { homePath } from '@/home/api/home-api';
import { apiJson, jsonBody } from '@/lib/api-client';
import type {
  AddShoppingItemRequest,
  ApiShoppingCaptureJob,
  ApiShoppingMode,
  ApiShoppingTrip,
  CreateShoppingTripRequest,
  Id,
  UpdateCapturedItemRequest,
} from '@/lib/api-types';

const tripPath = (homeId: Id, tripId: Id, path = '') => homePath(homeId, `/shopping-trips/${tripId}${path}`);

export function getShoppingTrips(homeId: Id) {
  return apiJson<ApiShoppingTrip[]>(homePath(homeId, '/shopping-trips'));
}

export function createShoppingTrip(homeId: Id, request: CreateShoppingTripRequest) {
  return apiJson<ApiShoppingTrip>(homePath(homeId, '/shopping-trips'), { method: 'POST', ...jsonBody(request) });
}

export function getShoppingMode(homeId: Id, tripId: Id) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/shopping-mode'));
}

export function addShoppingItem(homeId: Id, tripId: Id, request: AddShoppingItemRequest) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/items'), { method: 'POST', ...jsonBody(request) });
}

export function addShoppingItems(homeId: Id, tripId: Id, items: AddShoppingItemRequest[]) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/items/bulk'), { method: 'POST', ...jsonBody({ items }) });
}

export function startShoppingTrip(homeId: Id, tripId: Id) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/start'), { method: 'POST' });
}

export function pauseShoppingTrip(homeId: Id, tripId: Id) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/pause'), { method: 'POST' });
}

export function setShoppingItemChecked(homeId: Id, tripId: Id, itemId: Id, checked: boolean, price?: number) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, `/items/${itemId}/checked`), {
    method: 'PATCH',
    ...jsonBody({ checked, ...(price !== undefined ? { price } : {}) }),
  });
}

export function completeShoppingTrip(homeId: Id, tripId: Id) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, '/complete'), { method: 'POST' });
}

/** Server-sent events stream for live trip updates (`event: shopping-trip-updated`). */
export function getShoppingTripEventsPath(homeId: Id, tripId: Id) {
  return tripPath(homeId, tripId, '/events');
}

/** Uploads a recording; the server transcribes it into items with status NEEDS_REVIEW. */
export async function uploadShoppingTripAudio(homeId: Id, tripId: Id, audioUri: string) {
  const body = new FormData();

  if (Platform.OS === 'web') {
    const audioBlob = await (await fetch(audioUri)).blob();
    body.append('audio', audioBlob, 'shopping-list-voice.webm');
  } else {
    body.append('audio', {
      uri: audioUri,
      name: 'shopping-list-voice.m4a',
      type: 'audio/mp4',
    } as unknown as Blob);
  }

  return apiJson<ApiShoppingCaptureJob>(tripPath(homeId, tripId, '/capture/audio'), { method: 'POST', body });
}

export function updateCapturedItem(homeId: Id, tripId: Id, itemId: Id, request: UpdateCapturedItemRequest) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, `/capture/items/${itemId}`), { method: 'PATCH', ...jsonBody(request) });
}

export function applyCapture(homeId: Id, tripId: Id, captureJobId: Id) {
  return apiJson<ApiShoppingMode>(tripPath(homeId, tripId, `/capture/${captureJobId}/apply`), { method: 'POST' });
}
