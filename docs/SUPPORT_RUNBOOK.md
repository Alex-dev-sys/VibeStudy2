# VibeStudy Support Runbook

## Purpose

This document is for the first soft-launch support pass. The goal is speed and clarity:
identify the failure mode, decide whether it is account-specific or systemic, and either
fix it immediately or give the user a concrete next step.

## 1. Auth Issues

### Symptom

- user cannot log in with Google;
- magic link never arrives;
- user returns from login but lands in a broken session state;
- a different account's progress appears after switching users.

### First checks

- Confirm the exact login method used.
- Confirm the frontend domain where the issue happened.
- Confirm whether the user completed the Google OAuth screen or only clicked the button.
- Check Supabase auth provider configuration and redirect allow list.

### Likely causes

- wrong OAuth redirect URI;
- Google app still in testing mode and the email is not in test users;
- stale local session in the browser;
- incorrect `site_url` or redirect target.

### Operator action

1. Ask the user for the account email and a screenshot of the error.
2. If it is a browser-state issue, ask them to hard refresh and log out/in.
3. If it is an account-mix issue, verify that local state clears on logout.
4. If it is OAuth-specific, compare the current domain to the Google callback settings.

## 2. AI Generation Failures

### Symptom

- lesson does not generate;
- hint or review fails;
- user sees fallback content repeatedly;
- function errors appear in logs.

### First checks

- Confirm whether the failure is for lesson generation, hint, or review.
- Check `generate-lesson` logs in Supabase.
- Check whether `HF_TOKEN` is present and valid; if fallback is enabled, also check `OPENAI_API_KEY`.
- Check whether the user is free-tier locked by track/day/hint limits.

### Likely causes

- Hugging Face/provider outage or key issue;
- function deployment mismatch;
- billing/free-tier enforcement blocking the request;
- malformed request payload from frontend.

### Operator action

1. Reproduce with the same track/day.
2. Check function logs and payload type.
3. If AI is unavailable but fallback works, communicate that learning can continue while the issue is being fixed.
4. If the failure is tied to free limits, explain the exact rule that blocked the action.

## 3. Billing Failures

### Symptom

- checkout does not open;
- checkout succeeds but profile still shows `Free`;
- cancellation does not downgrade access;
- webhook events do not update entitlements.

### First checks

- Confirm the current environment and app URL.
- Check whether checkout session creation returned a URL.
- Check Cryptomus callback delivery and `billing-webhook` logs.
- Check the `subscriptions`, `entitlements`, and `billing_events` rows for the user.

### Likely causes

- missing Cryptomus merchant UUID, payment API key, or amount configuration;
- webhook endpoint not configured correctly;
- webhook signature mismatch;
- duplicate event handled incorrectly;
- billing tables not migrated in the live project.

### Operator action

1. Inspect the latest checkout session and provider event.
2. Confirm `billing_events` contains the event id.
3. Confirm `subscriptions` status matches the provider.
4. Confirm entitlements exist for active or trialing states.
5. If checkout succeeded but access did not change, treat it as a billing-priority incident.

## 4. Progress Issues

### Symptom

- user sees non-zero progress on a new account;
- finished lesson is not reflected in profile;
- reset did not clear the account;
- task completion count does not match lesson completion.

### First checks

- Confirm the account email and whether it is actually a reused test account.
- Check `profiles`, `user_progress`, and `completed_tasks`.
- Check whether the user switched accounts in the same browser session.

### Operator action

1. Verify whether the data is in Supabase or only in client state.
2. If the account is a test account, use the reset flow.
3. If counts are inconsistent, inspect the lesson and task rows for duplicate completion.
4. If state only looks wrong in the client, ask the user to hard refresh once before deeper action.

## 5. Resetting A Test Account

### Preferred path

- Ask the user to open `/profile`.
- Use `Сбросить мой прогресс`.

### Operator path

- If the user cannot access the UI reset flow, invoke the backend reset flow for the authenticated account.
- After reset, confirm:
  `profiles.total_xp = 0`,
  `profiles.level = 1`,
  `profiles.current_streak = 0`,
  `completed_tasks` empty,
  `user_progress` empty or reset,
  achievements reset if applicable.

## 6. Escalation Rules

Escalate immediately if:

- payment succeeded but user has no Pro access;
- multiple users report login failure at the same time;
- AI generation fails for all users;
- progress leaks between accounts again.

These are systemic launch blockers, not individual support tickets.
