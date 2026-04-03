# Binance Pay Checkout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale Cryptomus/manual billing path with a live one-time Binance Pay checkout that grants 30-day or 90-day Pro access after confirmed payment.

**Architecture:** The payment surface stays hosted-first on the frontend, while Supabase edge functions create Binance orders and consume Binance webhooks. Billing state is normalized through `payment_orders`, `subscriptions`, `entitlements`, and `billing_events`, with the frontend reading order state and redirecting users to Binance-hosted checkout.

**Tech Stack:** React, Vite, TypeScript, Zustand, Supabase DB/Auth/Edge Functions, Binance Pay API, Playwright.

---

## Chunk 1: Billing Foundation

### Task 1: Add Binance payment order model

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\migrations\20260325_binance_pay_checkout.sql`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\types\billing.types.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\types\database.types.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase_schema.sql`

- [ ] Add `binance` to billing provider unions and DB constraints.
- [ ] Create `payment_orders` with user-scoped RLS and indexes for `merchant_trade_no`, `provider_order_id`, and status lookups.
- [ ] Extend generated TS types for `payment_orders`.
- [ ] Mirror the schema change into `supabase_schema.sql`.

### Task 2: Add testable Binance helper surface

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\lib\binance-pay.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\unit\binance-pay.test.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\package.json`

- [ ] Add a minimal TS unit-test harness for pure helpers.
- [ ] Write failing tests for request signing, checkout redirect extraction, and webhook-to-access-window mapping.
- [ ] Implement the pure Binance helper functions shared by the frontend/backend code.

## Chunk 2: Edge Functions

### Task 3: Rewrite checkout creation

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\create-checkout-session\index.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\_shared\binance-pay.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\config.toml`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\.env.example`

- [ ] Replace Cryptomus recurrence code with Binance Pay order creation.
- [ ] Persist each created order into `payment_orders`.
- [ ] Return hosted checkout data (`checkoutUrl`, `prepayId`, expiry) to the frontend.
- [ ] Document required Binance secrets in `.env.example`.

### Task 4: Rewrite webhook sync

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\billing-webhook\index.ts`

- [ ] Verify Binance webhook headers and signature against Binance certificates.
- [ ] Store raw webhook payloads in `billing_events`.
- [ ] Upsert `payment_orders`, `subscriptions`, and `entitlements` idempotently.
- [ ] Convert paid orders into 30-day or 90-day Pro access without auto-renew.

## Chunk 3: Frontend State And UX

### Task 5: Replace manual payment state

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\lib\billing.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\stores\useBillingStore.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Pricing.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Profile.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\billing\Paywall.tsx`

- [ ] Remove tx-hash/manual wallet UX from the active flow.
- [ ] Redirect authenticated users into Binance hosted checkout from `/pricing`.
- [ ] Show latest order state and access-until copy in the profile.
- [ ] Surface honest checkout errors in the UI.

### Task 6: Verify the new payment route

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\e2e\billing.spec.ts`

- [ ] Cover guest redirect to auth from pricing.
- [ ] Cover authenticated checkout initiation with mocked Binance order data.
- [ ] Verify profile billing copy reflects order-driven status rather than manual tx-hash state.
- [ ] Run unit tests, lint, build, and Playwright smoke checks.

Plan complete and saved to `docs/superpowers/plans/2026-03-25-binance-pay-checkout.md`. Ready to execute.
