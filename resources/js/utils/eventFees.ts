export interface EventFeeFields {
    entry_fee: string | null;
    pre_register_fee?: string | null;
    pre_register_until?: string | null;
}

/** Normalize API/form date to YYYY-MM-DD for comparisons and inputs. */
export function toDateInputValue(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    return value.split('T')[0];
}

/** Whether online pre-registration still uses the pre-register price. */
export function isPreRegisterPricingActive(event: EventFeeFields, now: Date = new Date()): boolean {
    if (!event.pre_register_fee?.trim()) {
        return false;
    }

    const until = toDateInputValue(event.pre_register_until);
    if (!until) {
        return true;
    }

    const cutoff = new Date(`${until}T23:59:59`);
    return !Number.isNaN(cutoff.getTime()) && now <= cutoff;
}

/** Fee shown to users registering online (pre-register). */
export function getRegistrationFee(event: EventFeeFields): string {
    if (isPreRegisterPricingActive(event)) {
        return event.pre_register_fee!.trim();
    }

    return event.entry_fee?.trim() || 'Free';
}

/** Human-readable fee line for event cards (door + optional pre-reg). */
export function formatEventFeeDisplay(event: EventFeeFields): string {
    const door = event.entry_fee?.trim() || null;
    const preReg = event.pre_register_fee?.trim() || null;
    const preActive = isPreRegisterPricingActive(event);

    if (preReg && door && preReg !== door) {
        if (preActive) {
            return `Pre-register: ${preReg} · Door: ${door}`;
        }

        return `Door: ${door} (pre-register ended)`;
    }

    if (preReg && preActive) {
        return preReg;
    }

    return door || preReg || 'Free';
}
