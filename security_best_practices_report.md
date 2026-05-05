# Security Audit And Roadmap

## Executive Summary

This Express/Handlebars app already uses server-side sessions, Sequelize query APIs, password hashing, and escaped Handlebars templates. The main risks were missing CSRF friction for cookie-authenticated API writes, disabled CSP, weak production/session defaults, loose request/upload limits, direct error object responses, and high-severity dependency advisories.

This pass implemented the app-level hardening items that are low-risk to ship now and cleared the dependency audit. Remaining work is deeper integration coverage, stronger CSRF tokens, and deployment/data migration polish.

## Findings

### SEC-1: Cookie-authenticated writes needed CSRF protection

- Severity: High
- Location: `controllers/api/post-routes.js:68`, `controllers/api/post-routes.js:85`, `controllers/api/comment-routes.js:17`, `controllers/api/user-routes.js:57`
- Evidence: POST/PUT/DELETE API routes rely on the session cookie for auth and mutate data.
- Impact: A malicious site could attempt cross-site state changes against a logged-in user.
- Fix shipped: Added session-backed CSRF tokens in `middleware/csrfProtection.js:1-49`, mounted them in `server.js:86-87`, exposed the token in `views/layouts/main.handlebars:8`, and send it from browser API calls in `public/javascript/ui-feedback.js:43-57`. The same-origin custom header remains as defense-in-depth in `server.js:105-108`.

### SEC-2: Security headers and CSP were too loose

- Severity: Medium
- Location: `server.js:23-41`
- Evidence: CSP was previously disabled in Helmet configuration.
- Impact: Stored or reflected XSS would have fewer browser-level guardrails.
- Fix shipped: Enabled Helmet CSP with `self` scripts/styles, image allowance for HTTPS profile images, `form-action self`, `object-src none`, and disabled `x-powered-by`.

### SEC-3: Session production defaults needed tightening

- Severity: Medium
- Location: `server.js:16-20`, `server.js:68-79`
- Evidence: A fallback session secret was usable before this pass.
- Impact: Accidentally deploying without `SESSION_SECRET` weakens session integrity.
- Fix shipped: Production now fails fast without `SESSION_SECRET`; the session cookie uses a non-default name plus `httpOnly`, `sameSite`, `secure` in production, bounded expiry, and Sequelize-backed storage.

### SEC-4: Request, upload, and static serving limits were under-specified

- Severity: Medium
- Location: `server.js:44-53`, `server.js:110-111`, `controllers/api/user-routes.js:57-68`
- Evidence: Body parsers, file upload middleware, and static serving had few explicit safety limits.
- Impact: Larger request bodies or upload edge cases could increase DoS and unsafe-file risk.
- Fix shipped: Added JSON/urlencoded limits, upload size enforcement, safe upload filename options, and hardened static serving options.
- Follow-up: Add file content sniffing or image metadata validation before Cloudinary upload.

### SEC-5: Error responses could leak internals

- Severity: Low
- Location: `server.js:112-119` and route catch blocks
- Evidence: Several routes returned raw `err` objects before this pass.
- Impact: ORM or runtime details could leak to clients during failures.
- Fix shipped: Added a 404 handler, kept a generic global error handler, and changed route catches to generic client messages while logging server-side.

### SEC-6: Dependency audit had high-severity advisories

- Severity: High
- Location: `package.json:24-25`
- Evidence: `npm audit --omit=dev --json` reported high advisories through `bcrypt@5.1.1`, `cloudinary@1.41.3`, and transitive packages.
- Impact: Known package vulnerabilities can expose the app through runtime dependencies or vulnerable install-time tooling.
- Fix shipped: Upgraded to `bcrypt@6.0.0` and `cloudinary@2.10.0`, then ran `npm audit --omit=dev --json` and full `npm audit --json`; both now report `0` vulnerabilities. A dev-only `picomatch` advisory was also resolved with `npm audit fix`.

### SEC-7: Auth transitions should rotate session IDs

- Severity: Medium
- Location: `controllers/api/user-routes.js:18-38`
- Evidence: Signup/login establish authenticated session state.
- Impact: Reusing a pre-auth session ID can increase session fixation risk.
- Fix shipped: Added a shared session starter that regenerates the session before binding authenticated user data.

### SEC-8: Route IDs needed consistent validation

- Severity: Medium
- Location: `middleware/validateParam.js:1-17`
- Evidence: Several `/:id` routes used route params directly in ORM calls.
- Impact: Malformed IDs could produce inconsistent responses or avoidable ORM errors.
- Fix shipped: Added reusable positive-integer route param validation and wired it into API/page routes.

## Roadmap

### P0 - Shipped In This Pass

- Enable CSP and reduce Express fingerprinting.
- Require CSRF tokens and a same-origin custom header for state-changing `/api` requests.
- Add API-wide and auth-specific rate limits.
- Require `SESSION_SECRET` in production and use a non-default session cookie name.
- Add explicit JSON, form, upload, and static-file limits.
- Stop returning raw internal errors to clients.
- Make upvotes idempotent and add a model-level unique vote pairing.
- Validate route IDs before ORM access.
- Regenerate sessions on signup/login.
- Upgrade vulnerable runtime dependencies and clear npm audit.
- Add an existing-database cleanup migration for unique vote pairs.
- Add reusable local smoke coverage for signup, login, logout, posts, comments, and upvotes.

### P1 - Next Build

- Add automated profile upload smoke coverage with a safe test image and Cloudinary test credentials.

### P2 - Hardening

- Add file content sniffing for profile uploads.
- Add structured production logging with redaction.
- Add CI steps for `npm test`, `git diff --check`, and `npm audit --omit=dev`.

### P3 - Product/Architecture

- Move public IDs to UUIDs or slugs for less predictable resource enumeration.
- Add account management flows: password change, account deletion confirmation, and optional email verification.
- Add moderation controls for posts/comments before broader release.
