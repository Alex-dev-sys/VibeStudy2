# VibeStudy Analytics Dashboard Requirements

## Goal

Track the first monetization loop end to end:

`signup -> onboarding -> lesson start -> first task completion -> paywall -> checkout -> subscription`

## 1. Required Events

These events already exist or should exist in the current implementation:

- `auth_viewed`
- `magic_link_requested`
- `oauth_google_started`
- `signup_completed`
- `onboarding_completed`
- `first_lesson_started`
- `task_completed`
- `paywall_viewed`
- `checkout_started`
- `subscription_started`

## 2. Required Event Properties

At minimum, dashboards should be able to break down by:

- `userId`
- `trackId`
- `lessonDay`
- `planCode`
- `status`
- `source`

Recommended source values:

- `auth`
- `home`
- `lessons`
- `paywall`
- `profile`

## 3. Core Launch Dashboards

### A. Activation Funnel

Question:
how many users get to first real value?

Stages:

1. `signup_completed`
2. `onboarding_completed`
3. `first_lesson_started`
4. first `task_completed`

Primary metric:

- activation rate = users with at least one `task_completed` / users with `signup_completed`

### B. Paywall Funnel

Question:
how many activated users hit monetization and start checkout?

Stages:

1. users with first `task_completed`
2. `paywall_viewed`
3. `checkout_started`
4. `subscription_started`

Primary metrics:

- paywall view rate after activation
- checkout start rate after paywall
- paid conversion after checkout

### C. Track Performance

Question:
which learning track converts better?

Break down by `trackId`:

- signup to onboarding completion
- onboarding to first lesson
- first lesson to first task
- paywall views
- checkout starts
- subscriptions

### D. Retention Proxy

Question:
are users coming back after first value?

Track:

- users with `first_lesson_started`
- users with a second session or another `task_completed` on a later date

Primary proxy:

- day-2 return rate

## 4. Billing State Dashboard

Need a table or chart for:

- active subscriptions by plan
- canceled subscriptions
- failed or missing entitlement syncs
- checkout starts without subscription start

This dashboard should join provider events with internal rows:

- `subscriptions`
- `entitlements`
- `billing_events`

## 5. AI Usage Dashboard

Need visibility into:

- lesson generations per day
- hint requests per day
- review requests per day
- failures per function action
- free-limit hits vs successful requests

This should use:

- `feature_usage`
- edge function logs

## 6. Launch Questions The Dashboard Must Answer

- Are users finishing onboarding?
- Are users reaching the first solved task?
- Which track gets the best activation?
- Where do users drop before payment?
- Are people clicking checkout but failing to become subscribers?
- Are AI requests failing enough to hurt activation?
- Are free users hitting limits and then upgrading?

## 7. Minimum Dashboard Delivery For Soft Launch

The dashboard is good enough for launch if it can show:

- daily new users
- onboarding completion
- first lesson start
- first task completion
- paywall views
- checkout starts
- active subscribers

Anything beyond that is useful, but not required for first paid traffic.
