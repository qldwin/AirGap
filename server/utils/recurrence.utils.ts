export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const NO_RECURRENCE = 'none';

const isValidFrequency = (value: string): value is RecurrenceFrequency =>
    ['daily', 'weekly', 'monthly', 'yearly'].includes(value);

export const computeNextOccurrenceDate = (from: Date, frequency: string): Date => {
    if (!isValidFrequency(frequency)) {
        throw new Error(`Invalid recurrence frequency: ${frequency}`);
    }

    const next = new Date(from);

    switch (frequency) {
        case 'daily':
            next.setUTCDate(next.getUTCDate() + 1);
            break;

        case 'weekly':
            next.setUTCDate(next.getUTCDate() + 7);
            break;

        case 'monthly': {
            const originalDate = next.getUTCDate();
            next.setUTCDate(1);
            next.setUTCMonth(next.getUTCMonth() + 1);
            const lastDayOfTargetMonth = new Date(
                Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
            ).getUTCDate();
            next.setUTCDate(Math.min(originalDate, lastDayOfTargetMonth));
            break;
        }

        case 'yearly': {
            const originalMonth = next.getUTCMonth();
            const originalDay = next.getUTCDate();
            next.setUTCFullYear(next.getUTCFullYear() + 1);
            if(originalMonth === 1 && originalDay === 29 && next.getUTCMonth() !== 1) {
                next.setUTCDate(28);
            }
            break;
        }
    }
    return next;
}

export const MAX_CATCHUP_OCCURRENCES = 366