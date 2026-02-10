# Security + Privacy Audit (BoracayBistro)

Audit date: 2026-02-09  
Repo root: `/Users/hb/Desktop/BoracayBistro`

## Scope

* Server: `server/` (Express + sessions, JSON APIs, file-backed visitor/offers storage, Postgres via Drizzle)
* Client: `client/` (Vite + React SPA, admin UI under `/admin/*`)
* Shared types/schema: `shared/`
* Repo hygiene: tracked/untracked sensitive data, build/deploy config coherence

## High-Level Architecture (Observed)

* `server/index.ts` starts an Express app, mounts JSON APIs from `server/routes.ts`, and serves the SPA via Vite (dev) or static assets (prod).
* Admin auth is a custom session flag `req.session.isAdmin` set by `/api/admin/login`.
* Menu/drinks/categories are stored in Postgres (Drizzle ORM) via `server/storage.ts`.
* Visitor tracking writes a JSON file `visitors.json` in the repo root and exposes aggregate stats at `/api/visitor-stats`.
* Offers storage writes a JSON file `offers.json` in the repo root.

## Threat Model (What A Hostile Actor Might Do)

* External unauthenticated attacker on the public website:
  * brute-force or guess admin credentials
  * abuse missing rate limits to DoS CPU/IO or fill disks (especially file-backed visitor tracking)
  * scrape analytics/business metrics (visitor stats) if exposed
* Web attacker with CSRF/XSS capabilities:
  * perform admin actions if admin session cookie is present and protections are weak
* Insider or anyone with repo access:
  * obtain secrets from committed or accidentally-committed `.env`/logs/JSON data
* Supply-chain attacker:
  * exploit vulnerable npm dependencies if they exist (needs regular SCA, see “Recommendations”)

## Findings (Prioritized)

Severity legend:
* Critical: likely compromise with minimal effort, or severe privacy incident
* High: meaningful compromise/impact, but needs more conditions/effort
* Medium: weaker security posture, plausible exploitation
* Low: hygiene/quality issues that increase risk over time

### 1) Default Admin Credentials (Critical)

**What**
* If `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars are not set, the server accepts a hardcoded fallback (`admin` / `kestia2024`).

**Evidence**
* `server/routes.ts:20` to `server/routes.ts:29`

**Impact**
* If deployed without overriding these env vars, any attacker can log in as admin and modify menu/drinks/categories/offers and access admin-only debug endpoints.
* Even if currently set correctly in production, this is a high-risk footgun for future deploys/staging environments.

**Hostile actor scenario**
1. Attacker hits `/api/admin/login` with common defaults.
2. If env vars are missing/misconfigured, attacker obtains admin session and modifies content or uses endpoints for further probing.

**Recommendations**
* Remove all hardcoded fallback credentials.
* Fail closed: if `ADMIN_USERNAME`/`ADMIN_PASSWORD` are missing, return `503` (or refuse to boot) with a clear operator message.
* Store/admin-check a **password hash** (e.g., `ADMIN_PASSWORD_HASH`) rather than plaintext.
* Add rate limiting + lockout (see Finding #3).

### 2) Insecure Session Secret Fallback + Weak Session Hardening (High)

**What**
* Session secret defaults to `"change-me"` when `SESSION_SECRET` is not set.
* Session ID is not regenerated on privilege change (login).
* Cookie settings are minimal; no explicit expiry/rotation.

**Evidence**
* `server/index.ts:21` to `server/index.ts:34`
* `server/routes.ts:20` to `server/routes.ts:29`

**Impact**
* A predictable/known session secret weakens cookie integrity and increases risk of session attacks (especially if configuration changes later, or if any middleware uses signed values more broadly).
* Without session regeneration on login, session fixation risks increase (attacker pre-sets a session ID and gets the victim/admin to authenticate into it).

**Recommendations**
* Require `SESSION_SECRET` in production; fail closed if missing.
* Regenerate the session on successful login (`req.session.regenerate(...)`) and set `isAdmin` in the new session.
* Consider setting `cookie.maxAge` and `rolling: true` for controlled expiry.
* Consider `sameSite: "strict"` for admin surfaces if it doesn’t break your flows.

### 3) No Brute-Force Protection / Rate Limiting on Admin Login (High)

**What**
* `/api/admin/login` has no throttling, lockout, IP-based limits, or captcha.

**Evidence**
* `server/routes.ts:20` to `server/routes.ts:29`

**Impact**
* Enables online password guessing; with any weak password this becomes practical quickly.
* Amplifies impact of Finding #1.

**Recommendations**
* Add `express-rate-limit` (or equivalent) specifically on `/api/admin/login`.
* Add account lockout/backoff after repeated failures (even a simple in-memory counter is better than nothing; DB/Redis is better).
* Log failed attempts with minimal data (no passwords), and monitor/alert.

### 4) Production Session Store Is In-Memory (High)

**What**
* Sessions are stored in `memorystore` (in-memory) regardless of environment.

**Evidence**
* `server/index.ts:21` to `server/index.ts:34`

**Impact**
* Session loss on restart and non-functional sessions under multi-instance deployments (horizontal scaling).
* Memory exhaustion risk: an attacker can attempt to create many sessions and grow memory.

**Recommendations**
* Use a durable store in production (you already depend on `connect-pg-simple`): Postgres, Redis, etc.
* Add server-side session TTL and consider limiting session creation.

### 5) API Response Body Logging (High, Privacy + Future-Proofing Risk)

**What**
* Middleware captures and logs JSON responses for `/api/*` endpoints.

**Evidence**
* `server/index.ts:49` to `server/index.ts:77`

**Impact**
* Easy to accidentally log sensitive payloads (PII, tokens, internal errors) as the API evolves.
* Logs can become regulated data (privacy/compliance burden) and increase breach impact.

**Recommendations**
* Do not log response bodies in production.
* If you need structured logging, log: route, status, duration, request ID, and a redacted/error-safe message.
* Add a redaction layer for known sensitive keys (`password`, `email`, `phone`, etc.).

### 6) Visitor Tracking Collects Pseudonymous Identifiers + User Agents; Data Is Committed to Git (Critical, Privacy)

**What**
* Visitor tracking uses `ip + userAgent` to generate a stable visitor ID and stores `userAgent` plus timestamps and counts in `visitors.json`.
* `visitors.json` is tracked by git (contains device/browser fingerprint-ish data).
* `/api/visitor-stats` is publicly accessible (no admin required).

**Evidence**
* `server/routes.ts:44` to `server/routes.ts:63` (tracking middleware + stats endpoint)
* `server/visitor-tracking.ts:20` to `server/visitor-tracking.ts:70` (file write + ID generation + stored fields)
* `visitors.json` is in the repo and contains user agents (checked in local workspace)

**Impact**
* Privacy:
  * IP-derived identifiers and user-agent strings are generally considered personal data in many jurisdictions, especially when stored as stable identifiers.
  * Committing visitor data into the repository is a serious data-handling error: it can leak via repo sharing, backups, or CI logs.
* Security/abuse:
  * Anyone can spam requests to inflate visitors and grow `visitors.json` (disk/IO DoS).
  * Public stats endpoint leaks business metrics.

**Recommendations**
* Immediately stop committing runtime visitor data:
  * Remove `visitors.json` from git tracking and add it to `.gitignore`.
  * Add `.env`, log files (e.g. `dev.log`), and other runtime artifacts to `.gitignore`.
* Rework visitor tracking:
  * Prefer privacy-preserving analytics (aggregate, no stable identifiers), or a vendor with consent tooling.
  * If you keep it in-house: use an HMAC with a server secret (prevents cross-system correlation) and avoid storing raw user agent; store coarse categories instead.
  * Add retention (e.g., purge records older than N days).
* Protect `/api/visitor-stats` behind `requireAdmin` (or remove it from public API).

### 7) `trust proxy` Enabled Unconditionally (Medium)

**What**
* `app.set("trust proxy", 1)` is always on.

**Evidence**
* `server/index.ts:17`

**Impact**
* If the app is deployed without a trusted reverse proxy in front, clients can spoof `X-Forwarded-For` which affects `req.ip` (used for visitor tracking today, and commonly used for auth/rate limiting later).

**Recommendations**
* Make `trust proxy` an environment-based setting (enable only when behind a known proxy/load balancer).

### 8) Missing Standard Security Headers (Medium)

**What**
* No `helmet` usage and no explicit disabling of `X-Powered-By`.

**Evidence**
* No references found for `helmet()`; Express defaults apply.

**Impact**
* Weaker baseline protections (CSP, HSTS, X-Content-Type-Options, frameguard, etc.), increasing exploitability of any future XSS/misconfig.

**Recommendations**
* Add `helmet` with a tuned CSP suitable for Vite/React.
* `app.disable("x-powered-by")`.
* Ensure HTTPS-only + HSTS in production (usually at the reverse proxy, but can be done in app too).

### 9) No CSRF Defense for Cookie-Authenticated Admin Actions (Medium)

**What**
* Admin APIs use cookies (`express-session`) and do not implement CSRF tokens.

**Evidence**
* Session cookie usage in `server/index.ts:21` to `server/index.ts:34`
* State-changing endpoints protected only by `requireAdmin` (e.g., `server/routes.ts:76` and many others)

**Impact**
* Depending on browser behavior and your deployment topology, a cross-site request could trigger admin actions if an admin is logged in and protections are insufficient.

**Recommendations**
* Implement CSRF protection for admin routes (token-based, double-submit, or `csurf`).
* Consider isolating admin under a separate subdomain with stricter cookie settings.

### 10) Input Validation Gaps on Admin-Controlled Write Endpoints (Medium)

**What**
* Many admin endpoints pass `req.body` directly into storage/DB writes without runtime validation.

**Evidence**
* Example: `server/routes.ts:76` to `server/routes.ts:93` (categories create/update)
* Example: menu/drinks/offers create/update routes further down in `server/routes.ts`

**Impact**
* Overposting and data integrity problems; potential to store unexpected strings that could become XSS later if rendering changes (e.g., if a component starts using `dangerouslySetInnerHTML`).

**Recommendations**
* Use Zod schemas from `shared/schema.ts` (`createInsertSchema(...)`) for server-side validation on writes.
* Reject unknown keys (`.strict()`) for admin writes to prevent overposting.

### 11) Build/Serve Path Mismatch (Operational Risk) (Low/Medium)

**What**
* Vite builds to `dist/public` but the server’s production static path expects `server/public`.

**Evidence**
* `vite.config.ts:22` to `vite.config.ts:25` (build outDir to `dist/public`)
* `server/vite.ts:72` to `server/vite.ts:95` (serveStatic uses `server/public`)

**Impact**
* Production boot can fail or serve stale/missing assets. This can create emergency deploy behavior (ad-hoc fixes) that often introduces security mistakes.

**Recommendations**
* Align production static serving to the actual build output (`dist/public`) or change the build output to match what the server expects.

### 12) Repo Hygiene: Missing Ignores for Secrets/Runtime Artifacts (High)

**What**
* `.gitignore` does not ignore `.env` files or `dev.log` or `visitors.json`.
* A `server/.env` exists locally and contains database credentials; it is untracked, but could be accidentally committed later.

**Evidence**
* `.gitignore:1` to `.gitignore:6`
* Local workspace contains `server/.env` (untracked) and `dev.log` (untracked)

**Impact**
* High risk of accidental secret leakage or committing user data/logs.

**Recommendations**
* Add ignores for `.env`, `.env.*`, `*.log`, `visitors.json`, and any other runtime data files.
* Add `server/.env.example` with placeholders (no real secrets).
* Rotate any credentials that may have been exposed in logs, terminals, or shared copies.

## Supply Chain / Dependency Risk (Needs Routine Checks)

This repo uses a sizable npm dependency set (Express, Vite, Drizzle, etc.). I did not run network-based vulnerability checks in this audit environment.

Recommended routine:
* Run `npm audit` (or a better SCA tool like Snyk/GitHub Dependabot) in CI.
* Pin and regularly update dependencies (avoid long-lived `^` drift without monitoring).
* Add automated checks for leaked secrets (e.g., gitleaks) in CI.

## Immediate Action Checklist (Do These First)

1. Remove default admin fallback credentials; fail closed if env vars are missing.
2. Require a strong `SESSION_SECRET` and regenerate sessions on login.
3. Add rate limiting for `/api/admin/login`.
4. Remove/stop tracking `visitors.json` in git; add ignores for `.env` and logs.
5. Protect `/api/visitor-stats` behind admin auth (or remove it).
6. Remove response-body logging in production.

## Longer-Term Improvements

* Use Postgres/Redis session store in production (`connect-pg-simple` already present).
* Add `helmet` and a CSP.
* Add CSRF protection for admin actions.
* Implement structured, redacted logging + request IDs.
* Define a privacy policy and (if applicable) consent mechanism for any analytics/third-party embeds (Google Maps/Fonts).

