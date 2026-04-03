import type {
  BillingEntitlementCode,
  BillingFeatureCode,
  BillingPlanCode,
  BillingProvider,
  BillingSubscriptionStatus,
  ManualPaymentRequestStatus,
  PaymentOrderStatus,
} from './billing.types';

export type JsonObject = Record<string, unknown>;

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_day: number;
  completed_days: number[];
  last_activity: string;
  created_at: string;
}

export interface CompletedTask {
  id: string;
  user_id: string;
  course_id: string;
  day: number;
  task_id: number;
  code: string | null;
  xp_earned: number;
  completed_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achieved_at: string;
}

export interface GeneratedTask {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  codeTemplate?: string;
}

export interface LessonCache {
  id: string;
  language: string;
  day: number;
  title: string;
  topics_hash: string;
  theory: string;
  tasks: GeneratedTask[];
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  provider: BillingProvider;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  plan_code: BillingPlanCode;
  status: BillingSubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_ends_at: string | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface EntitlementRecord {
  id: string;
  user_id: string;
  entitlement_code: BillingEntitlementCode;
  source: 'subscription' | 'grant' | 'promotion';
  source_id: string | null;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface BillingEventRecord {
  id: string;
  provider: BillingProvider;
  provider_event_id: string;
  event_type: string;
  user_id: string | null;
  subscription_id: string | null;
  payload: JsonObject;
  processed_at: string | null;
  created_at: string;
}

export interface FeatureUsageRecord {
  id: string;
  user_id: string;
  feature_code: BillingFeatureCode;
  usage_date: string;
  usage_count: number;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrderRecord {
  id: string;
  user_id: string;
  provider: BillingProvider;
  plan_code: Exclude<BillingPlanCode, 'free'>;
  status: PaymentOrderStatus;
  merchant_trade_no: string;
  provider_order_id: string | null;
  provider_transaction_id: string | null;
  amount: string;
  currency: string;
  checkout_url: string | null;
  deeplink: string | null;
  universal_url: string | null;
  qr_code_link: string | null;
  order_expires_at: string | null;
  paid_at: string | null;
  last_checked_at: string | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface ManualPaymentRequestRecord {
  id: string;
  user_id: string;
  plan_code: Exclude<BillingPlanCode, 'free'>;
  wallet_address: string;
  network: string;
  asset_symbol: string;
  expected_amount: string;
  tx_hash: string;
  status: ManualPaymentRequestStatus;
  reviewer_note: string | null;
  reviewed_at: string | null;
  metadata: JsonObject;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert extends Partial<Profile> {
  id: string;
}

export type UserProgressInsert = Omit<UserProgress, 'id' | 'created_at'>;

export type CompletedTaskInsert = Omit<CompletedTask, 'id' | 'completed_at'>;

export type AchievementInsert = Omit<Achievement, 'id' | 'achieved_at'>;

export interface LessonCacheInsert
  extends Omit<LessonCache, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface SubscriptionInsert
  extends Omit<SubscriptionRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface EntitlementInsert
  extends Omit<EntitlementRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface BillingEventInsert extends Omit<BillingEventRecord, 'id' | 'created_at'> {
  id?: string;
}

export interface FeatureUsageInsert
  extends Omit<FeatureUsageRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface PaymentOrderInsert
  extends Omit<PaymentOrderRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface ManualPaymentRequestInsert
  extends Omit<ManualPaymentRequestRecord, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: Partial<Profile>;
      };
      user_progress: {
        Row: UserProgress;
        Insert: UserProgressInsert;
        Update: Partial<UserProgress>;
      };
      completed_tasks: {
        Row: CompletedTask;
        Insert: CompletedTaskInsert;
        Update: Partial<CompletedTask>;
      };
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: Partial<Achievement>;
      };
      lesson_cache: {
        Row: LessonCache;
        Insert: LessonCacheInsert;
        Update: Partial<LessonCache>;
      };
      subscriptions: {
        Row: SubscriptionRecord;
        Insert: SubscriptionInsert;
        Update: Partial<SubscriptionRecord>;
      };
      entitlements: {
        Row: EntitlementRecord;
        Insert: EntitlementInsert;
        Update: Partial<EntitlementRecord>;
      };
      billing_events: {
        Row: BillingEventRecord;
        Insert: BillingEventInsert;
        Update: Partial<BillingEventRecord>;
      };
      feature_usage: {
        Row: FeatureUsageRecord;
        Insert: FeatureUsageInsert;
        Update: Partial<FeatureUsageRecord>;
      };
      payment_orders: {
        Row: PaymentOrderRecord;
        Insert: PaymentOrderInsert;
        Update: Partial<PaymentOrderRecord>;
      };
      manual_payment_requests: {
        Row: ManualPaymentRequestRecord;
        Insert: ManualPaymentRequestInsert;
        Update: Partial<ManualPaymentRequestRecord>;
      };
    };
  };
}
