# Production Roadmap

Priorities assume the current local SQL-backed implementation and the audit evidence in `SECURITY_AND_PRODUCTION_AUDIT.md`. Every item requires verification in a staging environment before release.

## Confirmed defects / behavior gaps

| Priority | Work | Files / dependency | Acceptance and verification | DB/config |
|---|---|---|---|---|
| P1 | Preserve or backfill links for existing users created before `PolicyHolderId` | Relationship migration, `SqlUserRepository`, data migration runbook. Requires a business-approved identity matching rule and a DB backup. | Staging rehearsal finds duplicate/unmatched cases; deterministic links only; all expected old accounts resolve policy identity; rollback/reconciliation documented. | **Data change / migration required** |
| P1 | Configure deployment-specific allowed CORS origins and HTTPS behavior | `Program.cs`, deployment configuration/ingress | Browser preflight and credentialed login tested on production-like domain; HTTP is redirected/blocked; Secure cookie is delivered. | **Configuration required** |
| P1 | Implement frontend authenticated-session experience: session check, protected account area, logout and expired-session UX | `app/login/page.tsx`, `components/Header.tsx`, new account/auth components, API client | Logged-out user cannot view account area; logged-in user sees correct `/me`; logout invalidates client navigation; expired cookie returns actionable sign-in path. | No DB change |
| P1 | Define and implement CSRF defense for cookie-authenticated mutations | `Program.cs`, controller/API client and deployment topology | Cross-origin hostile POST is rejected; legitimate frontend mutation succeeds; cookie settings tested under actual hosting domains. | Configuration/code |
| P1 | Add abuse controls to login/registration/verification | `Program.cs`, controller/service | Rate thresholds, 429 responses, safe account-enumeration behavior, logs/metrics, and concurrency behavior covered by tests. | Configuration/code |
| P2 | Decide and persist contact postal ZIP independently from policyholder ZIP | `ContactInformationRequest`, `User`, `UserEntity`, `UserService`, DbContext, migration, SQL repository, tests | Contact postal code round-trips from request to SQL and API/UI; policyholder ZIP remains sourced from policyholder record. If intentionally not needed, remove the unused form field and DTO validation instead. | **Schema migration if separate storage is required** |

## Missing production requirements

| Priority | Work | Affected area | Acceptance criteria |
|---|---|---|---|
| P1 | Establish production configuration and deployment runbook | Host, secrets, CORS, API URL, TLS ingress | No secret in repo; documented environment key names, startup probes, ports, allowed origins, TLS and rollback procedure. |
| P1 | Backup, restore and least-privilege SQL operations | SQL Server operations | A restore drill proves recovery objective; application login has only required permissions; migration runner has separate controlled elevated privileges. |
| P1 | Stage migrations and data preflight | EF migrations + release process | Detect duplicate unique-key candidates and values exceeding new max lengths; backup and staging upgrade/rollback rehearsed. |
| P2 | Add health/readiness checks and observability | ASP.NET Core host | Readiness distinguishes process from DB availability; structured request/error metrics; no password, answer, SSN or connection secret in logs. |
| P2 | Configure CI and deployment automation | No workflow found in inspected source tree | CI restores/builds .NET, runs backend tests, runs frontend lint/tests/build, and blocks deployment on failure. |
| P2 | Replace starter metadata/docs and clarify demo UI | `app/layout.tsx`, `app/page.tsx`, frontend README | No Next starter wording; demo policy card is clearly illustrative or shows real account data. |

## Security improvements

1. **P1:** rate limiting and monitoring for authentication/verification, without revealing whether a username or policy exists.
2. **P1:** CSRF defense and production cookie/CORS review.
3. **P1:** HTTPS redirect/HSTS or documented, tested ingress enforcement.
4. **P2:** threat model and data-retention/access review for policy identity, contact details and security-answer hashes.
5. **P2:** dependency vulnerability scan and update policy, run in a trusted local/CI environment.
6. **P2:** consider MFA/account recovery; no recovery endpoint currently exists and security answers alone are not exposed as a recovery mechanism.

## Testing gaps

- Add controller integration tests for response shapes/statuses, exception handling and cookie lifecycle.
- Add SQL Server integration tests for schema, unique constraints/races, relation delete behavior, persistence and mappings.
- Add migration tests/preflight fixtures covering legacy unlinked users, duplicates, and over-length values.
- Add direct unit tests for registration validator boundaries, date leap days, malformed problem JSON, and server field-error mapping.
- Stabilize the slow registration wizard tests; current default Vitest 5-second timeout caused a test timeout under load, although all passed with a longer configured timeout.
- Record coverage thresholds and execute coverage report in CI.

## Optional future enhancements

- Separate identity/profile read API from registration response and build a real policy dashboard.
- Remove legacy JSON repositories/mock data after confirming no test/demo use; otherwise move them to a clearly isolated sample project.
- Add localization, accessibility audit automation, and end-to-end browser tests against a disposable SQL database.

## Recommended order

1. Staging migration/data preflight and legacy-link policy.
2. Production secret/origin/HTTPS/cookie deployment config.
3. CSRF and login rate limiting.
4. Frontend session check, account page and logout.
5. Contact ZIP decision and implementation.
6. CI, integration tests, observability, backup/restore and release rehearsal.
