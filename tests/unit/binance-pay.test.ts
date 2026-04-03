import test from 'node:test';
import assert from 'node:assert/strict';
import {
    buildBinancePaySignaturePayload,
    calculatePaidAccessEnd,
    getBinanceCheckoutRedirectUrl,
    getPaidAccessWindowDays,
    mapBinanceOrderStatusToSubscriptionStatus,
    signBinancePayPayload,
} from '../../supabase/functions/_shared/binance-pay.ts';

test('buildBinancePaySignaturePayload keeps Binance required line breaks', () => {
    const payload = buildBinancePaySignaturePayload({
        timestamp: 1700000000123,
        nonce: 'ABCDEFGHIJKLMNOPQRSTUVWX12345678',
        body: '{"foo":"bar"}',
    });

    assert.equal(payload, '1700000000123\nABCDEFGHIJKLMNOPQRSTUVWX12345678\n{"foo":"bar"}\n');
});

test('signBinancePayPayload returns uppercase hmac-sha512 hex', async () => {
    const signature = await signBinancePayPayload(
        '1700000000123\nABCDEFGHIJKLMNOPQRSTUVWX12345678\n{"foo":"bar"}\n',
        'secret123'
    );

    assert.equal(
        signature,
        '0B15AF4CE69C1539381FB4C112D15027969227B7E2989D954765474DA583B68AD20ACA1C346CECF02083B44E0D9C01ECF574D916C859CC7011D1D88F096E4217'
    );
});

test('paid access windows are fixed 30 or 90 days', () => {
    assert.equal(getPaidAccessWindowDays('pro_monthly'), 30);
    assert.equal(getPaidAccessWindowDays('pro_three_month'), 90);
    assert.equal(
        calculatePaidAccessEnd('2026-03-01T00:00:00.000Z', 'pro_three_month'),
        '2026-05-30T00:00:00.000Z'
    );
});

test('mapBinanceOrderStatusToSubscriptionStatus keeps access semantics honest', () => {
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('PAID'), 'active');
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('INITIAL'), 'incomplete');
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('PENDING'), 'incomplete');
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('CANCELED'), 'canceled');
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('EXPIRED'), 'expired');
    assert.equal(mapBinanceOrderStatusToSubscriptionStatus('ERROR'), 'past_due');
});

test('getBinanceCheckoutRedirectUrl prefers hosted checkout url', () => {
    const redirectUrl = getBinanceCheckoutRedirectUrl({
        checkoutUrl: 'https://pay.binance.com/en/checkout/123',
        universalUrl: 'https://app.binance.com/payment/123',
        deeplink: 'bnc://app.binance.com/payment/123',
    });

    assert.equal(redirectUrl, 'https://pay.binance.com/en/checkout/123');
});
