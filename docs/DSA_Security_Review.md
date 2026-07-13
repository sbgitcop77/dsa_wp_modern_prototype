# Security Review — Diamond Sports Academy Prototype

**Reviewed:** `dsa_wp_modern_prototype` (Next.js 15, deploying to Cloudflare Pages)
**Date:** July 12, 2026
**Scope:** Full source review + dependency audit. No live deployment was tested.

## Summary

This is a prototype with mock/local data, and it's already behaving like one: the "database" is the browser's `localStorage`, and the admin login doesn't actually check credentials on the server. That's expected at this stage — the developer notes (`docs/DEVELOPER_HANDOFF.md`) already flag most of this as known prototype debt. The purpose of this review is to make sure none of it survives into the version connected to NeonDB, Twilio, and SendGrid.

One point worth correcting up front: you described this as having "only 1 user," referring to the admin. But the public booking flow (`/manage/[ref]`) is used by every customer who books a session, and it has an access-control flaw (below) that exposes customer names, emails, and phone numbers to anyone who can guess a booking reference. That's a separate, larger blast radius than the single admin account.

## Critical findings

**1. The login API never checks the password.**
`src/app/api/admin/auth/route.ts` sets an authenticated session cookie for any `POST` with `{"action":"login"}` — it never reads or verifies `username`/`password`. The real check happens only in the browser (`src/app/admin/login/page.tsx`), comparing against a value in client-side state. Anyone can skip the UI and call the API directly to get an admin session. Anyone can also just open dev tools and set the cookie manually: `document.cookie = "admin_session=authenticated"` — `src/middleware.ts` only checks that the cookie's value equals the static string `"authenticated"`.

**2. Admin credentials are hardcoded, plaintext, and shipped to the browser.**
`src/data/store/useAppStore.ts` hardcodes `adminUsername: "admin"`, `adminPassword: "diamond123"` in a file that ships in the client JS bundle. This is visible to anyone who views page source. It's also the same password across the deployed build unless manually changed after every deploy (and the "change password" form doesn't actually persist a new one — see `DEVELOPER_HANDOFF.md` line 594).

**3. Customer bookings are exposed via predictable references (IDOR).**
`/manage/[ref]` looks up a booking using only `bookingReference` (format `DSA-2026-00001`, sequential — see `src/data/mock/bookings.ts`). There's a separate `cancellationToken` field defined in the data model specifically to gate this kind of access, but the manage page doesn't use it. Once real bookings exist, anyone can increment the number in the URL and view or cancel another customer's session, seeing their name, email, and phone number in the process.

**4. There is no real backend data store.**
All app data — bookings, customers, instructors, the admin password — lives in Zustand `persist`, i.e. the visitor's own browser `localStorage` (`src/data/store/useAppStore.ts`). This is fine for a prototype but means there is currently no server-side authorization boundary at all; every "protection" in the app today is enforced by JavaScript running in the attacker's own browser.

## High-severity findings

**5. Next.js has an actively disclosed critical RCE.**
Installed version is `15.5.2`. `npm audit` flags a critical advisory (GHSA-9qr9-h5gf-34mp, React Flight protocol RCE) plus ~20 other advisories (DoS, middleware bypass, cache poisoning, XSS) affecting this version range. A patched 15.x release (`15.5.20`) exists. **Update before any real deployment.**

**6. No re-validation when confirming waitlisted bookings.**
Already flagged in your own dev docs (`DEVELOPER_HANDOFF.md` §"Known Gaps"): `confirmWaitlisted` doesn't re-check slot availability before confirming, which can create double-bookings once concurrent real users exist.

**7. No security headers configured anywhere.**
No CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, or `Permissions-Policy`. Neither `next.config.mjs` nor the Cloudflare output config (`_headers`) sets any of these. Cloudflare Pages supports a `_headers` file or Next.js `headers()` — currently unused.

**8. Session cookie is missing `secure: true`.**
`response.cookies.set("admin_session", ...)` in the auth route sets `httpOnly` and `sameSite: "lax"` but not `secure`. Cloudflare will likely terminate TLS in front of it, but the cookie itself should still explicitly require HTTPS as defense in depth.

**9. `cancellationToken` isn't cryptographically random.**
`tok-b${cnt}-${((cnt * 2654435761) >>> 0).toString(16)}` (`src/data/mock/bookings.ts`) is a deterministic multiplicative hash of a sequential counter — trivially predictable, not suitable as a bearer secret once it's actually used for access control.

## Medium findings

**10. `.gitignore` doesn't exclude `.env*` files**, only `*.local`. No env files exist yet, but once NeonDB/Twilio/SendGrid keys are added to a `.env`, a typo'd filename (e.g. `.env.production` vs `.env.local`) could get committed. Add `.env*` explicitly (keep an `.env.example` un-ignored if you want one).

**11. No rate limiting on the auth endpoint.** Once real password verification exists, `/api/admin/auth` needs brute-force protection — Cloudflare's rate limiting rules are the easiest fit given the target platform.

**12. Dev-tooling dependency vulnerabilities** (`npm audit`, full report): high-severity issues in `undici`, `ws`, and `node-tar`, but these come from `wrangler`/`@vercel/*`/`miniflare` devDependencies used only for local builds and deploys — they don't ship in the production bundle. Still worth updating tooling periodically since these run with your local filesystem access.

## Pre-production checklist (NeonDB + Twilio + SendGrid)

Given the target stack, before connecting real infrastructure:

- **Auth:** Move `username`/`password` verification server-side. Hash the admin password with bcrypt/argon2 in a NeonDB `admin_users` table (your own dev docs already call this out) and validate it inside `/api/admin/auth`, not in the browser. Rotate away from `admin`/`diamond123` as the first step, even in staging.
- **Booking access:** Require the random `cancellationToken` (generated with `crypto.randomUUID()` or equivalent, not a hash of a counter) to view or modify a booking via `/manage/[ref]`, in addition to or instead of the sequential reference.
- **Secrets:** Store NeonDB connection strings, Twilio auth tokens, and SendGrid API keys as Cloudflare Pages **encrypted environment variables**, never in the repo or client bundle. Any call to Twilio/SendGrid must happen from a server/edge function — never from client-side code, since those keys grant send-as-you access to your accounts.
- **Database access:** If using `drizzle-orm/neon-http` as your docs suggest, use parameterized queries throughout (Drizzle does this by default) — just don't drop to raw string-interpolated SQL anywhere.
- **Twilio/SendGrid webhooks (if used):** Validate inbound webhook signatures (Twilio's `X-Twilio-Signature`, SendGrid's signed event webhook) so attackers can't forge delivery-status callbacks.
- **Headers:** Add a CSP, HSTS, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` via Cloudflare Pages `_headers` or Next `headers()`.
- **Rate limiting:** Put Cloudflare rate limiting on `/api/admin/auth` and any public booking-mutation endpoints.
- **Next.js:** Update to the patched 15.x release before going live, and keep it current — this app is thin enough that upgrades should be low-risk.
- **Cookies:** Add `secure: true` to the session cookie.

## What's *not* a concern right now

No payment processing exists, so PCI scope is a non-issue. No secrets are currently committed to git (checked full history). No hallucinated/typosquatted npm packages — all dependencies resolve to real, correctly-versioned packages on the registry.
