# Insurance Policy Portal — Project Overview

**Audit date:** 2026-10-12

**Repository root:** repository checkout containing `InsurancePolicyPortalDemo.slnx`

**Evidence labels:** **Verified** means inspected in source, observed in a command, or read from the configured database; **Inferred** means a conclusion from source that was not separately exercised at runtime; **Unverified** means environment-dependent or not tested.

## Purpose and current status

The Insurance Policy Portal lets an existing policyholder verify identity against a policy record, create a portal account, and sign in. The UI is a Next.js App Router site; a .NET API handles policyholder checks, registration, cookie login, and the authenticated current-user endpoints; SQL Server is the runtime persistence store.

**Verified:** The API runs on .NET 10 and uses EF Core with SQL Server. The frontend uses Next.js 16.3.6 and React 19.2.8. The live `InsurancePolicyPortal` database was inspected read-only on the audit date: all four repository migrations were recorded in `dbo.__EFMigrationsHistory`; `Users.PolicyHolderId` exists; and `Users`, `PolicyHolders`, and `SecurityQuestions` had rows. No migration or data-changing statement was run as part of this audit.

**Verified:** The existing local account-registration flow writes an account row to `dbo.Users` and two hashed security-question answers to `dbo.SecurityQuestions`. Policyholder identity attributes are associated through `Users.PolicyHolderId`; the application intentionally stores blank duplicate identity fields in new linked `Users` rows and reads the authoritative name/date/ZIP from `PolicyHolders`.

**Verified:** The front end returns HTTP 200 at `http://localhost:3000`; the API Swagger page and security-question endpoint return 200 at `http://localhost:5034`; unauthenticated `/api/users/me` returns 401. Frontend ESLint and all 45 frontend tests passed in the audit run with a 15-second per-test timeout. A production Next build had passed in an earlier project validation. The current backend test rerun could not launch its test host because the `testhost.exe` file in the OneDrive-backed build output was unavailable; a previous run in this work session passed 12/12 backend tests. See [TESTING_GUIDE.md](./TESTING_GUIDE.md).

## Technology

| Area | Verified implementation |
|---|---|
| Frontend | Next.js App Router 16.3.6, React/React DOM 19.2.8, TypeScript, Tailwind CSS 4 |
| Backend | ASP.NET Core Web API, .NET 10 (`net10.0`) |
| Data access | Entity Framework Core 10 SQL Server provider; dedicated SQL repositories |
| Database | SQL Server database `InsurancePolicyPortal` in the inspected local setup |
| Authentication | ASP.NET Core cookie authentication, two-hour sliding expiration |
| Backend tests | NUnit 4, Moq, Microsoft.NET.Test.Sdk, Coverlet collector |
| Frontend tests | Vitest 5, React Testing Library, user-event, jsdom |

Exact package versions and scripts are in [InsurancePolicyPortalDemo.csproj](../InsurancePolicyPortalDemo/InsurancePolicyPortalDemo.csproj), [InsurancePolicyPortalDemo.Tests.csproj](../InsurancePolicyPortalDemo.Tests/InsurancePolicyPortalDemo.Tests.csproj), and [package.json](../insurance-policy-portal-frontend/package.json).

## Architecture at a glance

The browser calls the API directly. The API validates request DTOs, delegates business rules to `UserService`, and uses SQL repositories backed by `InsurancePolicyPortalDbContext`. SQL Server stores policyholder records, portal accounts, and security-question hashes. The runtime no longer selects the JSON mock repositories: a missing `ConnectionStrings:DefaultConnection` is a startup error.

The solution file includes the API and NUnit test projects; the frontend is a separate npm project. The frontend has no server-side API proxy or persistent auth-state provider in the inspected implementation. See [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) for diagrams and detailed flows.

## Implemented features

- Four-step registration: policyholder verification, account credentials, configured security questions, and contact information.
- Policyholder lookup by policy number with case-insensitive, trimmed identity comparisons in the service.
- Password hashing with ASP.NET Core Identity's `PasswordHasher<User>`; security-question answers use the same password-hasher abstraction.
- SQL uniqueness constraints for account username and policy number, plus a unique optional one-to-one policyholder link.
- JSON Problem Details exception responses and field-level errors for policyholder mismatch and registration conflict.
- Cookie login, logout, current-user profile, and self-only user lookup.
- Development-only Swagger UI.

## Important limitations / incomplete production work

- **Confirmed:** Cookie auth is configured in the backend, but the frontend has no session bootstrap, logout control, or protected-route mechanism. The login page navigates to `/` after receiving success; it does not establish a visible client auth state.
- **Confirmed:** CORS allows the single development origin `http://localhost:3000`; production-origin configuration is not present in the inspected code.
- **Confirmed:** No rate limiting or account lockout was found in the inspected API setup.
- **Confirmed:** No automated migration-at-startup is configured. Database updates are a deliberate operator/EF CLI action.
- **Unverified:** Production HTTPS termination, production secret management, deployment topology, backups, monitoring, and SQL permissions have not been inspected in a deployed environment.
- **Confirmed:** JSON repositories and JSON policyholder/user files remain in source as development/mock implementations, but the current runtime registration uses SQL only.

Prioritized tasks and acceptance criteria are in [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md); security evidence is in [SECURITY_AND_PRODUCTION_AUDIT.md](./SECURITY_AND_PRODUCTION_AUDIT.md).
