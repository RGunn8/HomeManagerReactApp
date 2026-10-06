import type { AddShoppingItemRequest, ApiShoppingItem, ApiShoppingTrip } from '@/lib/api-types';

export type ShoppingListEntry = {
    id: string;
    name: string;
    quantity: number;
    price?: number;
    salePrice?: number;
    dealQuantity?: number;
    dealPrice?: number;
    checked?: boolean;
};

export type ShoppingTrip = {
    id: string;
    title: string;
    itemsPicked: number;
    totalItems: number;
    spent: number;
    budget: number;
    status: 'ready' | 'active' | 'past';
    items?: ShoppingListEntry[];
};

export function summarizeItems(items: ShoppingListEntry[]) {
    return {
        itemsPicked: items.filter((item) => item.checked).reduce((total, item) => total + item.quantity, 0),
        totalItems: items.reduce((total, item) => total + item.quantity, 0),
        spent: items.filter((item) => item.checked).reduce((total, item) => total + getShoppingItemTotal(item), 0),
    };
}

export function getShoppingItemTotal(item: ShoppingListEntry) {
    const unitPrice = item.salePrice ?? item.price ?? 0;
    const dealQuantity = item.dealQuantity;

    if (!dealQuantity || dealQuantity < 2 || item.dealPrice === undefined) {
        return unitPrice * item.quantity;
    }

    const bundleCount = Math.floor(item.quantity / dealQuantity);
    const remainingCount = item.quantity % dealQuantity;
    return bundleCount * item.dealPrice + remainingCount * unitPrice;
}

export function getShoppingDealSummary(item: ShoppingListEntry) {
    const dealQuantity = item.dealQuantity;
    if (!Number.isInteger(item.quantity) || item.quantity < 1
        || dealQuantity === undefined || !Number.isInteger(dealQuantity) || dealQuantity < 2
        || item.dealPrice === undefined || !Number.isFinite(item.dealPrice) || item.dealPrice < 0
        || item.price === undefined || !Number.isFinite(item.price) || item.price < 0
        || (item.salePrice !== undefined && (!Number.isFinite(item.salePrice) || item.salePrice < 0))) {
        return undefined;
    }

    const regularUnitPrice = item.salePrice ?? item.price;
    const extraText = item.quantity > dealQuantity
        ? ` Extra items are $${regularUnitPrice.toFixed(2)} each.`
        : '';

    return `Buy ${dealQuantity} for $${item.dealPrice.toFixed(2)}.${extraText} ${item.quantity} ${item.quantity === 1 ? 'item' : 'items'} total: $${getShoppingItemTotal(item).toFixed(2)}.`;
}

const isSet = (value: number | null | undefined): value is number => value !== null && value !== undefined;

export function toShoppingListEntry(item: ApiShoppingItem): ShoppingListEntry {
    // `price` is what is actually paid per item; `regularPrice` is the undiscounted shelf price.
    const regularPrice = isSet(item.regularPrice) ? item.regularPrice : item.price;
    const hasDiscount = isSet(item.regularPrice) && item.price !== item.regularPrice;

    return {
        id: item.id,
        name: item.name ?? '',
        quantity: item.quantity ?? 1,
        // Items added without a price come back as 0.
        ...(regularPrice > 0 || hasDiscount ? { price: regularPrice } : {}),
        ...(hasDiscount ? { salePrice: item.price } : {}),
        ...(item.dealType === 'MULTI_BUY' && isSet(item.multiBuyQuantity) && isSet(item.multiBuyPrice)
            ? { dealQuantity: item.multiBuyQuantity, dealPrice: item.multiBuyPrice }
            : {}),
        checked: item.status === 'CONFIRMED' || item.status === 'APPLIED',
    };
}

export type NewShoppingItem = Pick<ShoppingListEntry, 'name' | 'quantity' | 'price' | 'salePrice' | 'dealQuantity' | 'dealPrice'>;

export function toAddShoppingItemRequest(item: NewShoppingItem): AddShoppingItemRequest {
    const paidPrice = item.salePrice ?? item.price;
    const hasMultiBuy = item.dealQuantity !== undefined && item.dealPrice !== undefined;
    const dealType = hasMultiBuy ? 'MULTI_BUY' : item.salePrice !== undefined ? 'SALE' : undefined;

    return {
        name: item.name,
        quantity: item.quantity,
        ...(paidPrice !== undefined ? { price: paidPrice } : {}),
        ...(dealType ? { dealType, regularPrice: item.price ?? null } : {}),
        ...(hasMultiBuy ? { multiBuyQuantity: item.dealQuantity, multiBuyPrice: item.dealPrice } : {}),
    };
}

export function toShoppingTrip(trip: ApiShoppingTrip): ShoppingTrip {
    const items = trip.items.filter((item) => item.status !== 'REJECTED').map(toShoppingListEntry);
    const status: ShoppingTrip['status'] = trip.status === 'COMPLETED' || trip.status === 'CANCELLED'
        ? 'past'
        : trip.status === 'ACTIVE' ? 'active' : 'ready';

    return {
        id: trip.id,
        title: trip.name,
        ...summarizeItems(items),
        budget: trip.budget ?? 0,
        status,
        items,
    };
}
