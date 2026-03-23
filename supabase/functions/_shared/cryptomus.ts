import CryptoJS from 'npm:crypto-js@4.2.0';

export type CryptomusRecurrencePeriod = 'monthly' | 'three_month';
export type CryptomusRecurrenceStatus = 'wait_accept' | 'active' | 'cancel_by_user' | 'cancel_by_merchant';

export interface CryptomusRecurrence {
    uuid: string;
    name: string;
    order_id: string;
    amount: string;
    currency: string;
    payer_currency: string | null;
    url_callback: string | null;
    period: CryptomusRecurrencePeriod;
    status: CryptomusRecurrenceStatus;
    url: string;
    last_pay_off: string | null;
    additional_data?: string | null;
}

export interface CryptomusPaymentWebhook {
    uuid: string;
    order_id: string;
    status: string;
    is_final: boolean;
    amount: string;
    currency: string;
    payment_amount: string | null;
    payment_amount_usd: string | null;
    payer_currency: string | null;
    additional_data?: string | null;
    sign?: string;
}

interface CryptomusEnvelope<T> {
    state: number;
    result?: T;
    message?: string;
    errors?: unknown;
}

function jsonForSign(data: unknown) {
    return JSON.stringify(data).replace(/\//g, '\\/');
}

export function getCryptomusEnv(name: string) {
    const value = Deno.env.get(name);
    if (!value) {
        throw new Error(`Missing ${name} secret in Edge Functions environment.`);
    }
    return value;
}

export function createCryptomusSign(body: string, apiKey = getCryptomusEnv('CRYPTOMUS_PAYMENT_API_KEY')) {
    const payload = CryptoJS.enc.Utf8.parse(body);
    const base64 = CryptoJS.enc.Base64.stringify(payload);
    return CryptoJS.MD5(base64 + apiKey).toString();
}

export async function cryptomusRequest<T>(path: string, payload: Record<string, unknown>) {
    const body = jsonForSign(payload);
    const response = await fetch(`https://api.cryptomus.com${path}`, {
        method: 'POST',
        headers: {
            merchant: getCryptomusEnv('CRYPTOMUS_MERCHANT_UUID'),
            sign: createCryptomusSign(body),
            'Content-Type': 'application/json',
        },
        body,
    });

    const envelope = (await response.json()) as CryptomusEnvelope<T>;
    if (!response.ok || envelope.state !== 0 || !envelope.result) {
        const message =
            envelope.message ||
            (typeof envelope.errors === 'string' ? envelope.errors : null) ||
            `Cryptomus request failed for ${path}.`;
        throw new Error(message);
    }

    return envelope.result;
}

export function verifyCryptomusWebhook(body: string) {
    const payload = JSON.parse(body) as Record<string, unknown>;
    const signature = typeof payload.sign === 'string' ? payload.sign : '';

    if (!signature) {
        throw new Error('Missing Cryptomus signature.');
    }

    delete payload.sign;
    const expected = createCryptomusSign(jsonForSign(payload));
    if (signature !== expected) {
        throw new Error('Cryptomus webhook signature verification failed.');
    }

    return payload;
}

export function parseCryptomusAdditionalData<T>(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export function normalizeCryptomusDate(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (/([+-]\d{2}:\d{2}|Z)$/i.test(trimmed)) {
        return new Date(trimmed).toISOString();
    }

    return new Date(`${trimmed}+03:00`).toISOString();
}
