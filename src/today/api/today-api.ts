import { homePath } from '@/home/api/home-api';
import { apiJson } from '@/lib/api-client';
import type { ApiToday, Id } from '@/lib/api-types';

export function getToday(homeId: Id, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  return apiJson<ApiToday>(homePath(homeId, `/today?timezone=${encodeURIComponent(timezone)}`));
}
