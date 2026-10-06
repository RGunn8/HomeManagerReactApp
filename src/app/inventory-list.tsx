import { router } from 'expo-router';

import { InventoryScreen } from '@/inventory/inventory-screen';

export default function InventoryListRoute() {
  return <InventoryScreen onBack={() => router.back()} />;
}
