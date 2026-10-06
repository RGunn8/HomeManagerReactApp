import { apiDateToLocalIso } from '@/lib/dates';
import type { ApiTask, RecurrenceFrequency } from '@/lib/api-types';
import type { AddedTask } from '@/task/component/add-tasks';

export type HomeTask = {
    id: string;
    name: string;
    detail?: string;
    notes?: string;
    checked: boolean;
    dueDate?: string;
    room?: string;
    roomId?: string;
    projectId?: string;
};

export type TaskDateFilter = 'all' | 'today' | 'overdue' | 'this-week' | 'upcoming' | 'no-date';

export function isTaskDueToday(task: HomeTask, referenceDate = new Date()) {
    if (!task.dueDate) return false;
    const parsedDate = new Date(task.dueDate);
    return !Number.isNaN(parsedDate.getTime()) && parsedDate.toDateString() === referenceDate.toDateString();
}

export function getTaskDateGroup(task: HomeTask, referenceDate = new Date()): Exclude<TaskDateFilter, 'all'> {
    if (!task.dueDate) return 'no-date';
    const parsedDate = new Date(task.dueDate);
    if (Number.isNaN(parsedDate.getTime())) return 'no-date';

    const dueDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
    const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
    const dayDifference = Math.round((dueDay - today) / 86_400_000);

    if (dayDifference < 0) return 'overdue';
    if (dayDifference <= 7) return 'this-week';
    return 'upcoming';
}

const frequencyUnits: Record<Exclude<RecurrenceFrequency, 'NONE'>, string> = {
    DAILY: 'day',
    WEEKLY: 'week',
    MONTHLY: 'month',
    YEARLY: 'year',
};

const unitFrequencies: Record<string, Exclude<RecurrenceFrequency, 'NONE'>> = {
    day: 'DAILY',
    week: 'WEEKLY',
    month: 'MONTHLY',
    year: 'YEARLY',
};

/** "DAILY", 3 → "3 days"; NONE → undefined. */
export function describeRecurrence(frequency: RecurrenceFrequency, interval: number) {
    if (frequency === 'NONE') return undefined;
    const unit = frequencyUnits[frequency];
    return interval === 1 ? unit : `${interval} ${unit}s`;
}

/** Reverses describeRecurrence and the parse-task detail format ("3 days", "week", "Every 2 months"). */
export function parseRecurrence(detail?: string): { recurrenceFrequency: RecurrenceFrequency; recurrenceInterval: number } {
    const match = detail?.trim().replace(/^every\s+/i, '').match(/^(?:(\d+)\s+)?(day|week|month|year)s?$/i);
    if (!match) return { recurrenceFrequency: 'NONE', recurrenceInterval: 1 };

    return {
        recurrenceFrequency: unitFrequencies[match[2].toLowerCase()],
        recurrenceInterval: Math.max(1, Number(match[1] ?? 1)),
    };
}

export function toHomeTask(task: ApiTask, roomNamesById: Map<string, string>): HomeTask {
    const recurrence = describeRecurrence(task.recurrenceFrequency, task.recurrenceInterval);

    return {
        id: task.id,
        name: task.title,
        detail: recurrence ? `Every ${recurrence}` : undefined,
        notes: task.notes ?? undefined,
        checked: task.status === 'DONE',
        dueDate: apiDateToLocalIso(task.dueDate),
        room: task.roomId ? roomNamesById.get(task.roomId) : undefined,
        roomId: task.roomId ?? undefined,
        projectId: task.projectId ?? undefined,
    };
}

/** Adapts an API task for the AddTasks list used on the room and project screens. */
export function toAddedTask(task: HomeTask): AddedTask {
    const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;

    return {
        id: task.id,
        name: task.name,
        detail: task.detail?.replace(/^Every\s+/i, ''),
        notes: task.notes,
        checked: task.checked,
        dueDate,
        date: dueDate?.toLocaleDateString(),
    };
}
