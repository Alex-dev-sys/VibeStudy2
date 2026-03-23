# VibeStudy Monetization Launch Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** превратить текущий VibeStudy MVP в продукт, готовый к платному soft launch с первым revenue.

**Architecture:** запуск строится вокруг трёх слоёв: `core learning loop`, `billing/entitlement`, `analytics/launch ops`. На первом этапе убираются все оставшиеся моки и расхождения данных, на втором добавляется платный контур, на третьем закрываются продуктовые и операционные требования soft launch.

**Tech Stack:** React, Vite, TypeScript, Zustand, Supabase Auth/DB/Edge Functions, OpenAI, payment provider (Stripe/YooKassa/Tinkoff depending on target market), analytics SDK, Playwright.

---

## Chunk 1: Product Foundation

### Task 1: Finish honest product surfaces

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Lessons.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Analytics.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Landing.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\layout\Header.tsx`
- Test: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\*.tsx`

- [ ] Step 1: Audit all remaining mocked blocks and broken locale strings on user-facing pages.
- [ ] Step 2: Replace mocked copy and fake KPI cards with real data or explicit empty states.
- [ ] Step 3: Normalize Russian copy where it is still broken by encoding.
- [ ] Step 4: Run `npm run lint`.
- [ ] Step 5: Run `npm run build`.
- [ ] Step 6: Commit with `git commit -m "feat: finish honest user-facing surfaces"`.

### Task 2: Add onboarding state machine

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\stores\useOnboardingStore.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\onboarding\OnboardingFlow.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\onboarding\GoalStep.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\onboarding\TrackStep.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Home.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\types\database.types.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase_schema.sql`

- [ ] Step 1: Add onboarding persistence model for goal, selected track, and completion timestamp.
- [ ] Step 2: Write a small onboarding store that can determine whether onboarding should appear.
- [ ] Step 3: Implement onboarding UI with goal selection and track recommendation.
- [ ] Step 4: Route users from onboarding directly to first lesson.
- [ ] Step 5: Verify new accounts land in onboarding and existing users bypass it.
- [ ] Step 6: Run `npm run lint`.
- [ ] Step 7: Run `npm run build`.
- [ ] Step 8: Commit with `git commit -m "feat: add onboarding flow"`.

### Task 3: Make lesson loop monetization-ready

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Lessons.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\hooks\useAIGeneration.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\stores\useProgressStore.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\generate-lesson\index.ts`

- [ ] Step 1: Add AI hint and AI review sections as separate UI states, not only lesson generation.
- [ ] Step 2: Persist partial lesson state so user can resume mid-session.
- [ ] Step 3: Verify XP, completed task count, and lesson completion update consistently.
- [ ] Step 4: Add graceful retry UI for generation failures.
- [ ] Step 5: Run `npm run lint`.
- [ ] Step 6: Run `npm run build`.
- [ ] Step 7: Commit with `git commit -m "feat: make lesson loop monetization ready"`.

## Chunk 2: Billing And Entitlement

### Task 4: Add subscription data model

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase_schema.sql`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\types\billing.types.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\types\database.types.ts`

- [ ] Step 1: Add tables for `subscriptions`, `entitlements`, `billing_events`, and optional `feature_usage`.
- [ ] Step 2: Add RLS policies so users can only view their own subscription state.
- [ ] Step 3: Extend frontend types for subscription and entitlement reads.
- [ ] Step 4: Run schema review for nullability, indexes, and foreign keys.
- [ ] Step 5: Commit with `git commit -m "feat: add billing data model"`.

### Task 5: Implement payment provider integration

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\create-checkout-session\index.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\supabase\functions\billing-webhook\index.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\lib\billing.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\stores\useBillingStore.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\.env.example`

- [ ] Step 1: Choose the provider for the target market and document required secrets.
- [ ] Step 2: Implement checkout session creation on the backend.
- [ ] Step 3: Implement webhook sync to update subscription and entitlement state.
- [ ] Step 4: Expose a frontend billing store for current plan and checkout link.
- [ ] Step 5: Add idempotency handling for duplicate webhook events.
- [ ] Step 6: Verify successful checkout updates entitlement.
- [ ] Step 7: Verify cancellation or failed payment downgrades access correctly.
- [ ] Step 8: Commit with `git commit -m "feat: integrate billing and entitlements"`.

### Task 6: Add paywall and free limits

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\billing\Paywall.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\components\billing\PlanCard.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Lessons.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Profile.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\App.tsx`

- [ ] Step 1: Define free tier rules: one track, first three days, limited hints.
- [ ] Step 2: Enforce these rules in frontend visibility and backend entitlement checks.
- [ ] Step 3: Add paywall entry points after first value, not before.
- [ ] Step 4: Add subscription status panel to profile.
- [ ] Step 5: Verify a free user can still complete onboarding and first lesson.
- [ ] Step 6: Commit with `git commit -m "feat: add paywall and free limits"`.

## Chunk 3: Analytics, Ops, And Launch Readiness

### Task 7: Instrument funnel analytics

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\lib\analytics.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Auth.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Home.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Lessons.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Profile.tsx`

- [ ] Step 1: Add a thin analytics wrapper so events are not scattered across vendor-specific calls.
- [ ] Step 2: Emit lifecycle events for signup, onboarding, lesson start, task completion, paywall view, checkout, and subscription.
- [ ] Step 3: Verify events include stable user and track context.
- [ ] Step 4: Validate event fire order using local logs or analytics debug mode.
- [ ] Step 5: Commit with `git commit -m "feat: instrument launch funnel analytics"`.

### Task 8: Add support, legal, and launch trust pages

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Pricing.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Privacy.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Terms.tsx`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Support.tsx`
- Modify: `C:\Users\LXКLGNV\Новая папка\VibeStudy2\src\App.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Landing.tsx`

- [ ] Step 1: Add a transparent pricing page with one clear plan.
- [ ] Step 2: Add privacy policy and terms placeholders that can be replaced with legal copy.
- [ ] Step 3: Add support channel page or in-app contact flow.
- [ ] Step 4: Link these pages from landing, auth, and profile.
- [ ] Step 5: Commit with `git commit -m "feat: add launch trust pages"`.

### Task 9: Build launch verification suite

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\e2e\auth.spec.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\e2e\lesson-flow.spec.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\e2e\billing.spec.ts`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\playwright.config.ts`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\package.json`

- [ ] Step 1: Add Playwright config for local and preview environments.
- [ ] Step 2: Cover guest, authenticated, progress, and billing smoke paths.
- [ ] Step 3: Add one seeded test account strategy.
- [ ] Step 4: Verify the suite can run before every launch candidate.
- [ ] Step 5: Commit with `git commit -m "test: add monetization launch e2e suite"`.

### Task 10: Prepare soft launch operations

**Files:**
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\docs\LAUNCH_CHECKLIST.md`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\docs\SUPPORT_RUNBOOK.md`
- Create: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\docs\ANALYTICS_DASHBOARD_REQUIREMENTS.md`

- [ ] Step 1: Write pre-launch checklist for secrets, webhooks, policies, pricing, and analytics.
- [ ] Step 2: Write support runbook for auth issues, generation failures, payment failures, and progress reset.
- [ ] Step 3: Write dashboard requirements for activation, retention, paywall, and subscription metrics.
- [ ] Step 4: Commit with `git commit -m "docs: add soft launch operations runbooks"`.

## Execution Order

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9
10. Task 10

## Launch Gate

Do not attempt paid traffic or public launch until all of these are true:
- onboarding works for a new user;
- first lesson and first task can be completed without manual intervention;
- paywall appears after real value;
- checkout creates entitlement;
- subscription state is visible in profile;
- analytics events are observable;
- legal/support pages exist;
- smoke/e2e checks pass on release candidate build.

Plan complete and saved to `docs/superpowers/plans/2026-03-16-monetization-launch.md`. Ready to execute.
