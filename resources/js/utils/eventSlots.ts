export function parseEventSlots(slots: string | null | undefined): number | null {
    if (!slots?.trim()) {
        return null;
    }

    const parsed = parseInt(slots.trim(), 10);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function isEventSlotsFull(
    slots: string | null | undefined,
    registeredCount: number,
): boolean {
    const maxSlots = parseEventSlots(slots);

    return maxSlots !== null && registeredCount >= maxSlots;
}
