/**
 * The API stores due dates as calendar days at UTC midnight. These helpers convert between that
 * and local-midnight dates so a task due "Oct 4" stays on Oct 4 in every timezone.
 */
export function apiDateToLocalIso(value: string | null | undefined) {
  const match = typeof value === 'string' ? value.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
  if (!match) return undefined;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toISOString();
}

export function toApiDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatShortDate(value: string | null | undefined) {
  const iso = apiDateToLocalIso(value);
  return iso ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(iso)) : undefined;
}
