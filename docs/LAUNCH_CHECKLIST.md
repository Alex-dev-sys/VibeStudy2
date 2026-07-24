# VibeStudy Soft Launch Checklist

## 1. Product Readiness

- [ ] New account lands in onboarding, not on a fake-progress screen.
- [ ] User can complete the first real value loop:
  `sign up -> onboarding -> first lesson -> first completed task -> saved progress`.
- [ ] Free tier is honest:
  one selected track, first 3 days, limited AI hints.
- [ ] Paywall appears after real value, not before the first lesson.
- [ ] Profile shows real subscription state and real progress.

## 2. Auth And Session

- [ ] Google OAuth works for the launch domain.
- [ ] Magic link returns the user to the correct domain.
- [ ] Logout clears local state and does not leak progress between accounts.
- [ ] Protected routes redirect guests to `/auth`.
- [ ] `site_url` and redirect allow list are aligned with the deployed frontend URL.

## 3. Supabase And Data

- [ ] Latest schema is applied in the production project:
  `profiles`, `user_progress`, `completed_tasks`, `lesson_cache`, `subscriptions`,
  `entitlements`, `billing_events`, `feature_usage`.
- [ ] RLS policies are enabled and verified for user-owned rows.
- [ ] Edge Functions deployed:
  `generate-lesson`, `reset-user-state`, `create-checkout-session`, `billing-webhook`,
  `cancel-crypto-subscription`.
- [ ] Required function secrets are present:
  `OPENAI_API_KEY`, `APP_BASE_URL`, `CRYPTOMUS_MERCHANT_UUID`, `CRYPTOMUS_PAYMENT_API_KEY`,
  `CRYPTOMUS_INVOICE_CURRENCY`, `CRYPTOMUS_PRO_MONTHLY_AMOUNT`, `CRYPTOMUS_PRO_THREE_MONTH_AMOUNT`.

## 4. Billing

- [ ] Binance Pay one-time plans are ready for 30-day and 90-day access; no auto-renew is advertised.
- [ ] Checkout success URL points back to the correct app domain.
- [ ] Checkout cancel URL returns to a meaningful in-product screen.
- [ ] Webhook endpoint is configured to call `billing-webhook`.
- [ ] Test a successful checkout and confirm:
  subscription row created or updated,
  entitlements granted,
  profile state changes from `Free` to `Pro`.
- [ ] Test expiry, refund, refunding and provider error states; confirm they never retain paid entitlements.

## 5. AI And Learning Runtime

- [ ] Lesson generation works from the deployed frontend.
- [ ] Hint and review requests return stable responses.
- [ ] Lesson cache works for repeated requests.
- [ ] Free-limit enforcement works on both frontend and backend.
- [ ] Fallback lesson flow stays usable if AI generation fails.

## 6. Analytics

- [ ] `window.dataLayer` or the chosen analytics sink receives launch events.
- [ ] These events are visible in debug mode or in the destination:
  `signup_completed`,
  `onboarding_completed`,
  `first_lesson_started`,
  `task_completed`,
  `paywall_viewed`,
  `checkout_started`,
  `subscription_started`.
- [ ] Event payloads include stable context:
  `userId`, `trackId`, `lessonDay`, `planCode`, `source`.

## 7. Legal And Trust

- [ ] `/pricing` is public and accurate.
- [ ] `/privacy`, `/terms`, and `/support` are public and linked from landing/auth/profile.
- [ ] Final legal copy has been reviewed and replaced if the launch is public-facing.
- [ ] Support contact address is monitored.

## 8. E2E Verification

- [ ] Run guest smoke suite:
  `npm run test:e2e`
- [ ] Run authenticated smoke suite with a seeded storage state:
  set `E2E_AUTH_STORAGE_STATE=/absolute/path/to/storage-state.json`
  then run `npm run test:e2e`
- [ ] Guest smoke must cover:
  public trust pages,
  guest redirect from private routes,
  pricing-to-auth fallback.
- [ ] Authenticated smoke must cover:
  `/home`, `/lessons`, `/profile`, and current billing state.

## 9. Launch Day Go / No-Go

Go only if all are true:

- [ ] No critical auth failures in the last manual check.
- [ ] No critical AI generation failures in the last manual check.
- [ ] Billing checkout and webhook were verified on the current environment.
- [ ] Smoke tests are green.
- [ ] Support owner knows where issues will arrive.
- [ ] Dashboard for activation, paywall, and subscription metrics is ready.

If any of these fail, do not start paid traffic.
