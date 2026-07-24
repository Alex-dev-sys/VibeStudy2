export type BinancePaidPlanCode = 'pro_monthly' | 'pro_three_month';

export type BinanceOrderStatus =
    | 'INITIAL'
    | 'PENDING'
    | 'PAID'
    | 'CANCELED'
    | 'ERROR'
    | 'REFUNDING'
    | 'REFUNDED'
    | 'FULL_REFUNDED'
    | 'EXPIRED';

export type LocalSubscriptionStatus =
    | 'incomplete'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'paused';

export interface BinanceOrderResult {
    prepayId: string;
    terminalType: string;
    expireTime: number;
    qrcodeLink?: string;
    qrContent?: string;
    checkoutUrl?: string;
    deeplink?: string;
    universalUrl?: string;
    currency: string;
    totalFee: string;
    fiatCurrency?: string;
    fiatAmount?: string;
}

export interface BinanceQueryOrderResult {
    merchantId: number;
    prepayId: string;
    transactionId?: string;
    merchantTradeNo: string;
    status: BinanceOrderStatus;
    currency: string;
    orderAmount: string;
    openUserId?: string;
    passThroughInfo?: string;
    transactTime?: number;
    createTime: number;
    paymentInfo?: Record<string, unknown>;
}

interface BinanceEnvelope<T> {
    status: 'SUCCESS' | 'FAIL';
    code: string;
    data?: T;
    errorMessage?: string;
}

interface BinanceCertificateRecord {
    certSerial: string;
    certPublic: string;
}

interface SignaturePayloadOptions {
    timestamp: string | number;
    nonce: string;
    body: string;
}

const BINANCE_PAY_HOST = 'https://bpay.binanceapi.com';
const NONCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function getRuntimeEnv(name: string) {
    if (typeof Deno !== 'undefined' && typeof Deno.env?.get === 'function') {
        return Deno.env.get(name);
    }

    if (typeof process !== 'undefined' && process.env) {
        return process.env[name];
    }

    return undefined;
}

function bytesToHex(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function base64ToBytes(value: string) {
    const decoded = atob(value);
    return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

function pemToArrayBuffer(pem: string) {
    const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/g, '');
    return base64ToBytes(base64).buffer;
}

function createRandomNonce(length = 32) {
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, (value) => NONCE_ALPHABET[value % NONCE_ALPHABET.length]).join('');
}

export function getBinancePayEnv(name: string) {
    const value = getRuntimeEnv(name);
    if (!value) {
        throw new Error(`Missing ${name} secret in Edge Functions environment.`);
    }
    return value;
}

export function buildBinancePaySignaturePayload({ timestamp, nonce, body }: SignaturePayloadOptions) {
    return `${timestamp}\n${nonce}\n${body}\n`;
}

export async function signBinancePayPayload(payload: string, secretKey: string) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secretKey),
        { name: 'HMAC', hash: 'SHA-512' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return bytesToHex(signature).toUpperCase();
}

export function getPaidAccessWindowDays(planCode: BinancePaidPlanCode) {
    return planCode === 'pro_monthly' ? 30 : 90;
}

export function calculatePaidAccessEnd(startIso: string, planCode: BinancePaidPlanCode) {
    const date = new Date(startIso);
    date.setUTCDate(date.getUTCDate() + getPaidAccessWindowDays(planCode));
    return date.toISOString();
}

export function mapBinanceOrderStatusToSubscriptionStatus(status: BinanceOrderStatus): LocalSubscriptionStatus {
    switch (status) {
        case 'PAID':
            return 'active';
        case 'CANCELED':
            return 'canceled';
        case 'ERROR':
            return 'incomplete';
        case 'EXPIRED':
        case 'REFUNDED':
        case 'FULL_REFUNDED':
            return 'expired';
        case 'REFUNDING':
            return 'paused';
        case 'INITIAL':
        case 'PENDING':
        default:
            return 'incomplete';
    }
}

export function buildTrustedCheckoutRedirectUrl(path: string, appBaseUrl: string) {
    const value = path.trim();
    if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.length > 512) {
        throw new Error('Checkout redirect must be a safe application-relative path.');
    }

    const baseUrl = new URL(appBaseUrl);
    if (
        (baseUrl.protocol !== 'https:' && baseUrl.protocol !== 'http:') ||
        baseUrl.username ||
        baseUrl.password
    ) {
        throw new Error('APP_BASE_URL must be a trusted HTTP(S) origin.');
    }

    const redirectUrl = new URL(value, baseUrl);
    if (redirectUrl.origin !== baseUrl.origin) {
        throw new Error('Checkout redirect cannot leave the configured application origin.');
    }

    if (Array.from(redirectUrl.searchParams.keys()).length > 1) {
        throw new Error('Binance Pay redirect URLs can only contain one query parameter.');
    }

    return redirectUrl.toString();
}
export function getBinanceCheckoutRedirectUrl(order: Pick<BinanceOrderResult, 'checkoutUrl' | 'universalUrl' | 'deeplink'>) {
    const redirectUrl = order.checkoutUrl || order.universalUrl || order.deeplink;
    if (!redirectUrl) {
        throw new Error('Binance Pay order was created without any redirect URL.');
    }
    return redirectUrl;
}

export function createMerchantTradeNo(userId: string, planCode: BinancePaidPlanCode, now = Date.now()) {
    const normalizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const planSegment = planCode === 'pro_monthly' ? 'M30' : 'M90';
    const timestampSegment = now.toString(36).toUpperCase();
    const randomSegment = createRandomNonce(6).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `VS${planSegment}${timestampSegment}${normalizedUserId.slice(0, 12)}${randomSegment}`.slice(0, 32);
}

export function parseBinancePassThroughInfo(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as Record<string, unknown>;
    } catch {
        return null;
    }
}

export function buildBinancePayUrl(path: string) {
    return `${getRuntimeEnv('BINANCE_PAY_BASE_URL') ?? BINANCE_PAY_HOST}${path}`;
}

export async function createBinancePayHeaders(
    body: string,
    options?: {
        timestamp?: number;
        nonce?: string;
        apiKey?: string;
        secretKey?: string;
    }
) {
    const timestamp = options?.timestamp ?? Date.now();
    const nonce = options?.nonce ?? createRandomNonce();
    const apiKey = options?.apiKey ?? getBinancePayEnv('BINANCE_PAY_API_KEY');
    const secretKey = options?.secretKey ?? getBinancePayEnv('BINANCE_PAY_SECRET_KEY');
    const payload = buildBinancePaySignaturePayload({ timestamp, nonce, body });
    const signature = await signBinancePayPayload(payload, secretKey);

    return {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': String(timestamp),
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': apiKey,
        'BinancePay-Signature': signature,
    };
}

export async function binancePayRequest<T>(path: string, payload: Record<string, unknown>) {
    const body = JSON.stringify(payload);
    const headers = await createBinancePayHeaders(body);
    const response = await fetch(buildBinancePayUrl(path), {
        method: 'POST',
        headers,
        body,
    });

    const envelope = (await response.json()) as BinanceEnvelope<T>;
    if (!response.ok || envelope.status !== 'SUCCESS' || !envelope.data) {
        throw new Error(envelope.errorMessage || `Binance Pay request failed for ${path}.`);
    }

    return envelope.data;
}

export async function queryBinanceOrder(query: { prepayId?: string; merchantTradeNo?: string }) {
    if (!query.prepayId && !query.merchantTradeNo) {
        throw new Error('Binance order query needs prepayId or merchantTradeNo.');
    }

    return await binancePayRequest<BinanceQueryOrderResult>('/binancepay/openapi/v2/order/query', query);
}

async function queryBinanceCertificates() {
    const certificates = await binancePayRequest<BinanceCertificateRecord[] | BinanceCertificateRecord>(
        '/binancepay/openapi/certificates',
        {}
    );

    return Array.isArray(certificates) ? certificates : [certificates];
}

export async function verifyBinanceWebhook(body: string, headers: Headers) {
    const timestamp = headers.get('BinancePay-Timestamp');
    const nonce = headers.get('BinancePay-Nonce');
    const signature = headers.get('BinancePay-Signature');
    const certificateSn = headers.get('BinancePay-Certificate-SN');

    if (!timestamp || !nonce || !signature || !certificateSn) {
        throw new Error('Missing Binance Pay webhook signature headers.');
    }

    const certificate = (await queryBinanceCertificates()).find((item) => item.certSerial === certificateSn);
    if (!certificate) {
        throw new Error(`No Binance Pay certificate found for serial ${certificateSn}.`);
    }

    const payload = buildBinancePaySignaturePayload({ timestamp, nonce, body });
    const publicKey = await crypto.subtle.importKey(
        'spki',
        pemToArrayBuffer(certificate.certPublic),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
    );
    const verified = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        base64ToBytes(signature),
        new TextEncoder().encode(payload)
    );

    if (!verified) {
        throw new Error('Binance Pay webhook signature verification failed.');
    }

    return JSON.parse(body) as Record<string, unknown>;
}
