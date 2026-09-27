export type ParsedTask = {
    name: string;
    detail?: string;
};

const recurrencePattern = /\s+every\s+(\d+)\s+(day|days|week|weeks|month|months|year|years)\s*$/i;

export function parseNaturalLanguageTask(input: string): ParsedTask | null {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
        return null;
    }

    const recurrenceMatch = trimmedInput.match(recurrencePattern);

    if (!recurrenceMatch) {
        return { name: trimmedInput };
    }

    const taskName = trimmedInput.slice(0, recurrenceMatch.index ?? 0).trim();
    const count = Number(recurrenceMatch[1]);
    const unit = recurrenceMatch[2].toLowerCase().replace(/s$/, '');
    const detail = `${count} ${count === 1 ? unit : `${unit}s`}`;

    return taskName ? { name: taskName, detail } : null;
}
