export const INVENTORY_CATEGORIES = [
    'Cleaning',
    'Kitchen',
    'Bathroom',
    'Laundry',
    'Home',
    'Other',
] as const;

export type InventoryCategory = typeof INVENTORY_CATEGORIES[number];
