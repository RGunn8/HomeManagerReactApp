import type { ApiInventoryItem, InventoryStatus, InventoryTrackingModeValue } from '@/lib/api-types';

export type InventoryNote = {
    id: string;
    text: string;
    createdAt?: number;
};

export type InventoryTrackingMode = 'count' | 'level';
export type InventoryLevel = 'full' | 'half' | 'low';

export const INVENTORY_LEVELS: { id: InventoryLevel; label: string }[] = [
    { id: 'full', label: 'Full' },
    { id: 'half', label: 'Half' },
    { id: 'low', label: 'Low' },
];

export type InventoryItem = {
    id: string;
    name: string;
    room: string;
    roomId?: string;
    category: string;
    stores: string[];
    trackingMode: InventoryTrackingMode;
    level: InventoryLevel;
    // For level-tracked items this is the number of unopened spares.
    quantity: number;
    belowPar: number;
    price?: number;
    link?: string;
    notes: InventoryNote[];
};

export function isInventoryItemLow(item: InventoryItem) {
    if (item.trackingMode === 'level') {
        return item.level === 'low' && item.quantity === 0;
    }
    return item.quantity <= item.belowPar;
}

export const levelToStatus = (level: InventoryLevel) => level.toUpperCase() as InventoryStatus;
export const toTrackingModeValue = (mode: InventoryTrackingMode): InventoryTrackingModeValue => (mode === 'level' ? 'LEVEL' : 'COUNT');

// The API stores notes as a single text field; each line is one note, newest first.
export const joinNotes = (notes: string[]) => notes.join('\n');

export function toInventoryItem(item: ApiInventoryItem, roomNamesById: Map<string, string>): InventoryItem {
    const notes = (item.notes ?? '').split('\n').map((text) => text.trim()).filter(Boolean);

    return {
        id: item.id,
        name: item.name,
        room: (item.roomId && roomNamesById.get(item.roomId)) || 'Unassigned',
        roomId: item.roomId ?? undefined,
        category: item.category || 'Other',
        stores: item.stores ?? [],
        trackingMode: item.trackingMode === 'LEVEL' ? 'level' : 'count',
        level: (item.status?.toLowerCase() as InventoryLevel | undefined) ?? 'full',
        quantity: item.quantity,
        belowPar: item.minQuantity,
        price: item.price ?? undefined,
        link: item.link ?? undefined,
        notes: notes.map((text, index) => ({ id: `${item.id}-note-${index}`, text })),
    };
}
