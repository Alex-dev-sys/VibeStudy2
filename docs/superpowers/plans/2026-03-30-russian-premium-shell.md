# Russian Premium Shell Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `Landing`, `Auth`, `Privacy`, `Terms`, and `Support` to a fully Russian, premium-quality shell that matches the strength of the internal product pages.

**Architecture:** Keep the existing route structure and auth behavior intact while replacing broken copy and weak shell layouts with a cohesive Russian editorial-dark presentation. Verification relies on Playwright smoke tests for trust routes plus lint/build.

**Tech Stack:** React, Vite, TypeScript, Framer Motion, React Router, Playwright.

---

## Chunk 1: Verification First

### Task 1: Add failing smoke coverage for the Russian shell

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\tests\e2e\auth.spec.ts`

- [ ] Add assertions for Russian trust-link copy on `/auth`.
- [ ] Add assertions for Russian headings on `/terms` and `/privacy`.
- [ ] Add at least one assertion for the landing hero copy in Russian.
- [ ] Run `npm run test:e2e -- tests/e2e/auth.spec.ts` and verify it fails before code changes.

## Chunk 2: Public Surface Redesign

### Task 2: Rebuild landing in Russian premium style

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Landing.tsx`

- [ ] Replace all broken text with coherent Russian copy.
- [ ] Keep the premium-dark visual language but make the page feel more editorial and intentional.
- [ ] Keep strong CTA flow to auth, pricing, and trust pages.
- [ ] Preserve responsive behavior.

### Task 3: Rebuild auth in Russian premium style

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Auth.tsx`

- [ ] Replace broken text and messages with clean Russian wording.
- [ ] Keep Google OAuth and magic-link logic unchanged.
- [ ] Make the auth screen feel like part of the product, not a utility form.
- [ ] Keep legal links readable and product-grade.

## Chunk 3: Trust Pages

### Task 4: Redesign privacy, terms, and support pages

**Files:**
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Privacy.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Terms.tsx`
- Modify: `C:\Users\LXKLGNV\Новая папка\VibeStudy2\src\pages\Support.tsx`

- [ ] Rewrite each page fully in Russian.
- [ ] Keep the draft/legal honesty but remove the placeholder feel.
- [ ] Use a consistent visual shell that matches the new landing/auth.
- [ ] Make support feel operational and trustworthy.

## Chunk 4: Final Verification

### Task 5: Run full project verification

**Files:**
- No new files.

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Run `npm run test:e2e`.
- [ ] Manually verify `/`, `/auth`, `/privacy`, `/terms`, `/support`.

Plan complete and saved to `docs/superpowers/plans/2026-03-30-russian-premium-shell.md`. Ready to execute.
