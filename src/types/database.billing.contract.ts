import type {
  BillingEntitlementCode,
  BillingFeatureCode,
  BillingPlanCode,
  BillingProvider,
} from './billing.types';
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

type HasTable<T extends PropertyKey> = T extends keyof Tables ? true : false;

const billingTableChecks: [
  HasTable<'subscriptions'>,
  HasTable<'entitlements'>,
  HasTable<'billing_events'>,
  HasTable<'feature_usage'>,
] = [true, true, true, true];

const subscriptionRow: Tables['subscriptions']['Row'] = {
  id: crypto.randomUUID(),
  user_id: crypto.randomUUID(),
  provider: 'cryptomus' satisfies BillingProvider,
  provider_customer_id: 'customer_123',
  provider_subscription_id: 'subscription_123',
  plan_code: 'pro_three_month' satisfies BillingPlanCode,
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date().toISOString(),
  cancel_at_period_end: false,
  canceled_at: null,
  trial_ends_at: null,
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const entitlementRow: Tables['entitlements']['Row'] = {
  id: crypto.randomUUID(),
  user_id: crypto.randomUUID(),
  entitlement_code: 'unlimited_lessons' satisfies BillingEntitlementCode,
  source: 'subscription',
  source_id: subscriptionRow.id,
  active: true,
  starts_at: new Date().toISOString(),
  ends_at: null,
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const billingEventRow: Tables['billing_events']['Row'] = {
  id: crypto.randomUUID(),
  provider: 'cryptomus' satisfies BillingProvider,
  provider_event_id: 'event_123',
  event_type: 'subscription.updated',
  user_id: subscriptionRow.user_id,
  subscription_id: subscriptionRow.id,
  payload: {},
  processed_at: null,
  created_at: new Date().toISOString(),
};

const featureUsageRow: Tables['feature_usage']['Row'] = {
  id: crypto.randomUUID(),
  user_id: subscriptionRow.user_id,
  feature_code: 'ai_hint' satisfies BillingFeatureCode,
  usage_date: '2026-03-17',
  usage_count: 1,
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const databaseBillingContract = {
  billingTableChecks,
  subscriptionRow,
  entitlementRow,
  billingEventRow,
  featureUsageRow,
};
