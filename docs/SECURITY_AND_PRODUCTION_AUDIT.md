# Security and Production Audit

**Audit date:** 2026-10-12

Findings below are based on source/config inspection and safe local runtime checks. This is not a penetration test or formal compliance review. The local SQL connection value was not written to documentation.

## Findings

| Severity | Confidence | Evidence / affected files | Finding and impact | Recommendation |
|---|---:|---|---|---|
| **High** | High | `InsurancePolicyPortalDemo/Program.cs`; `insurance-policy-portal-frontend/src/lib/api.ts` | CORS allows only `http://localhost:3000`, while allowing credentials. A production frontend origin will not be accepted unless deployment config/code is changed; broadening this carelessly can expose credentialed APIs. | Bind explicit allowed origins from deployment configuration; keep credentials and exact origins, and test preflight/credential requests in the deployed topology. |
| **High** | High | `InsurancePolicyPortalDemo/Program.cs`; frontend has no auth/session modules | Cookie auth exists, but the frontend does not check `/me` on startup, guard private pages, or provide logout/session-expiry handling. Login redirects to the public landing page; auth status is not reflected in the UI. | Design and implement an authenticated account area and session lifecycle; integration-test cookie, 401, logout and navigation behavior. |
| **High** | High | `InsurancePolicyPortalDemo/Program.cs`; `insurance-policy-portal-frontend/src/lib/api.ts` | No explicit anti-CSRF token/validation mechanism is configured. SameSite Strict offers some browser mitigation but is not a complete deployment-specific CSRF strategy, especially if frontend/API hosting changes. | Evaluate origin boundaries and SameSite deployment needs; implement a deliberate CSRF defense for cookie-authenticated state-changing endpoints and test it. |
| **High** | High | `InsurancePolicyPortalDemo/Data/Migrations/20261009065042_AddPolicyHolderRelationship.cs`; `SqlUserRepository.cs` | Relationship migration adds nullable `PolicyHolderId` without linking existing user rows. Existing accounts can remain unlinked and use fallback/legacy columns, producing different mapping behavior than newly registered accounts. | Before production rollout, inventory existing rows, design a reviewed deterministic backfill, backup, validate one-to-one matches, and test rollback/reconciliation. |
| **Medium** | High | `InsurancePolicyPortalDemo/Program.cs`; API project config | No rate limiting, failed-login lockout, or brute-force throttle was found. Login can be repeatedly attempted. | Add IP/account-aware rate limiting and safe monitoring/lockout policy; avoid leaking account existence. |
| **Medium** | High | `InsurancePolicyPortalDemo/Program.cs` | No `UseHttpsRedirection` or HSTS middleware is configured in the inspected host. Cookie Secure is always in non-Development, but transport enforcement depends on an external proxy not verified here. | Enforce HTTPS at the application or trusted ingress, configure forwarded headers correctly, and verify HSTS/TLS in production. |
| **Medium** | High | `InsurancePolicyPortalDemo/Services/UserService.cs`; `InsurancePolicyPortalDemo/DTOs/Requests/ContactInformationRequest.cs`; `InsurancePolicyPortalDemo/Models/User.cs` | The submitted contact ZIP is validated but is not represented separately on `User`; the service stores policy ZIP from personal information and SQL mapping blanks it for linked users. Contact postal ZIP is discarded. | Clarify product semantics. If mailing ZIP differs, add a distinct contact postal-code field via reviewed migration, map it, and test persistence/readback. |
| **Medium** | High | `InsurancePolicyPortalDemo/Data/Migrations/*`; `InsurancePolicyPortalDemo/InsurancePolicyPortalDemo.http` | SQL column narrowing and unique-index creation can fail on over-length or duplicate existing production data. The user-link migration does not backfill legacy rows. | Preflight data before every production migration, backup, apply in staging, verify integrity and rollback plan. |
| **Medium** | Medium | `insurance-policy-portal-frontend/app/page.tsx` | Landing page includes illustrative “Active” policy UI, not data from the authenticated account. It could be mistaken for real account state. | Label the card as a demo/illustration or replace it with a real authenticated dashboard. |
| **Low** | High | `insurance-policy-portal-frontend/app/login/page.tsx` | Login username validation message is not programmatically connected with `aria-invalid`/`aria-describedby`. | Add accessible field error association and test with accessibility queries/screen reader semantics. |
| **Low** | High | `insurance-policy-portal-frontend/app/layout.tsx`; `app/globals.css` | Metadata retains create-next-app wording; Geist variables are configured but body font uses Arial/Helvetica. | Replace boilerplate metadata and align font usage intentionally. |
| **Informational** | High | `InsurancePolicyPortalDemo/Repositories/Json/*`; `Data/*.json`; `Program.cs` | JSON mock implementations/data remain in the source tree, but current runtime only registers SQL repositories and requires a connection string. They are not evidence that current production-mode requests use JSON. | Keep explicit test/demo boundaries; consider removing or isolating mock data only after confirming no workflows depend on it. |

## Positive controls verified in source

- Passwords use `PasswordHasher<User>`; registration does not store plaintext password. Security-question answers are hashed with that hasher. No answer recovery/verification endpoint is exposed.
- SQL parameters are produced by EF LINQ queries; no raw user-composed SQL was found in repository operations.
- Unique DB indexes enforce username/policy uniqueness in addition to service pre-checks.
- Login uses an HttpOnly cookie; cookie is Secure outside Development, has a two-hour sliding expiration, and sign-in is non-persistent.
- User/resource endpoints require authorization and the ID resource is restricted to the caller’s own ID.
- Unexpected errors return generic details and are logged; exception handler avoids returning internal exception text.
- SQL connection uses external configuration/user-secrets; no password was found in tracked appsettings.
- Security-question prompt options are validated at startup.

## Runtime / deployment items not verified

- External reverse proxy TLS, trusted forwarded headers, domain/path cookie settings, and production CORS origin.
- SQL Server encryption-at-rest, backup/restore, least-privilege service principal, network ACLs, audit policy, or patching.
- Production secret rotation, hosting logs retention/access, alerting, WAF, and incident response.
- Whether the application has been threat-modeled for SSN-last-four verification, account takeover, enumeration, or PII policy.
- Dependency vulnerability posture was not scanned as part of this project audit.

## Overall assessment

The local development flow has functioning SQL persistence, password/answer hashing, validation, uniqueness controls and cookie issuance. It is **not production-ready** until deployment CORS/HTTPS are configured and verified, cookie/CSRF/session UX is completed, login abuse controls are added, legacy account linking and migration preflight are planned, and production operations are tested. Severity reflects code evidence and likely impact; deployment mitigations may exist but were not observed.
