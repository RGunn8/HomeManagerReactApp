import { useQuery } from '@tanstack/react-query';

import { useHomeId } from '@/home/hooks/use-home';
import { queryKeys } from '@/lib/query-keys';
import { getToday } from '@/today/api/today-api';

export function useToday() {
  const homeId = useHomeId();

  return useQuery({
    queryKey: queryKeys.today(homeId ?? ''),
    queryFn: () => getToday(homeId!),
    enabled: Boolean(homeId),
  });
}
