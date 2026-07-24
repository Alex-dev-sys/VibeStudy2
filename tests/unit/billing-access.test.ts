import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveAccessState, hasEntitlement } from '../../src/lib/billing.ts';
import type { EntitlementRecord, SubscriptionRecord } from '../../src/types/database.types.ts';

function subscription(overrides: Partial<SubscriptionRecord>): SubscriptionRecord {
    return {
        id: 'subscription-id',
        user_id: 'user-id',
        provider: 'binance',
        provider_customer_id: null,
        provider_subscription_id: 'provider-id',
        plan_code: 'pro_monthly',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 60_000).toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
        trial_ends_at: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

test('paid access requires an entitled status and a future end date', () => {
    assert.equal(deriveAccessState(subscription({ current_period_end: null })).canAccessPaidFeatures, false);
    assert.equal(deriveAccessState(subscription({ status: 'past_due' })).canAccessPaidFeatures, false);
    assert.equal(deriveAccessState(subscription({ status: 'active' })).canAccessPaidFeatures, true);

    const expired = deriveAccessState(
        subscription({ current_period_end: new Date(Date.now() - 60_000).toISOString() })
    );
    assert.equal(expired.status, 'expired');
    assert.equal(expired.planCode, 'free');
});

test('entitlements are valid only inside their active time window', () => {
    const entitlement = {
        entitlement_code: 'all_tracks',
        active: true,
        starts_at: new Date(Date.now() - 60_000).toISOString(),
        ends_at: new Date(Date.now() + 60_000).toISOString(),
    } as EntitlementRecord;

    assert.equal(hasEntitlement([entitlement], 'all_tracks'), true);
    assert.equal(
        hasEntitlement([{ ...entitlement, ends_at: new Date(Date.now() - 60_000).toISOString() }], 'all_tracks'),
        false
    );
    assert.equal(
        hasEntitlement([{ ...entitlement, starts_at: new Date(Date.now() + 60_000).toISOString() }], 'all_tracks'),
        false
    );
});
