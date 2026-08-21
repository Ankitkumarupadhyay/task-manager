import { format, formatDistanceToNow, isValid, parseISO, isBefore, startOfDay } from 'date-fns';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
}

export function formatRelative(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function isOverdue(dueDateStr: string | null | undefined, status: string): boolean {
  if (!dueDateStr || status === 'completed') return false;
  const dueDate = parseISO(dueDateStr);
  if (!isValid(dueDate)) return false;
  return isBefore(startOfDay(dueDate), startOfDay(new Date()));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function toISODateString(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return format(date, 'yyyy-MM-dd');
}
