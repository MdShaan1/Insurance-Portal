# AI Handover

**Audit date:** 2026-10-12

**Repository:** `MdShaan1/Insurance-Portal-`
**Workspace root:** repository checkout containing `InsurancePolicyPortalDemo.slnx`

## Project summary

Insurance Policyholder Portal: a Next.js/React frontend and ASP.NET Core .NET 10 API backed by SQL Server and EF Core. The browser provides `/`, `/login`, and `/register`; API routes under `/api/users` verify existing policyholders, register accounts, issue cookie authentication, expose current user, and logout. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) and [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) first.

## Key paths

- Solution: `InsurancePolicyPortalDemo.slnx`
- API project: `InsurancePolicyPortalDemo/InsurancePolicyPortalDemo.csproj`
- API composition root: `InsurancePolicyPortalDemo/Program.cs`
- Controller/business: `InsurancePolicyPortalDemo/Controllers/UserController.cs`, `InsurancePolicyPortalDemo/Services/UserService.cs`
- EF: `InsurancePolicyPortalDemo/Data/InsurancePolicyPortalDbContext.cs`, `InsurancePolicyPortalDemo/Data/Migrations/`
- SQL repositories: `InsurancePolicyPortalDemo/Repositories/SqlServer/`
- Backend tests: `InsurancePolicyPortalDemo.Tests/Services/UserServiceTests.cs`
- Frontend package: `insurance-policy-portal-frontend/package.json`
- Frontend registration/login: `insurance-policy-portal-frontend/app/register/page.tsx`, `app/login/page.tsx`
- Frontend API/validation: `insurance-policy-portal-frontend/src/lib/api.ts`, `src/lib/registrationValidation.ts`
- Additional docs: `API_REFERENCE.md`, `DATABASE_AND_MIGRATIONS.md`, `TESTING_GUIDE.md`, `SECURITY_AND_PRODUCTION_AUDIT.md`, `PRODUCTION_ROADMAP.md`.

## Verified current behavior

- Runtime `Program.cs` requires `ConnectionStrings:DefaultConnection`; it registers SQL Server `DbContext` and SQL repositories only. Do not describe JSON as active runtime persistence.
- Policyholder verification and registration are both checked by the service against SQL. Registration hashes the password and two security-question answers, then the SQL user repository persists the account and question rows.
- In the local SQL database observed during this audit, all four EF migrations are applied; `Users.PolicyHolderId` exists. No DB changes were made as part of the audit.
- The policyholder identity name/DOB/ZIP are related through `Users.PolicyHolderId` and read from `PolicyHolders`. New linked SQL `Users` rows retain blank duplicate identity columns; this is current repository mapping behavior, not missing linked policy data.
- Login creates an HttpOnly auth cookie; `/logout`, `/me`, and `/{id}` require auth. The frontend does not implement protected pages, current-session bootstrap, or logout.
- The contact ZIP submitted in registration is validated but not independently stored: the model only has identity `ZipCode`, which comes from the policyholder details. Clarify the product requirement before modifying schema.

## Migration and data safety

Four migration IDs are in `dbo.__EFMigrationsHistory` of the inspected local `InsurancePolicyPortal` DB: `20260928111314_InitialSqlServer`, `20260929113131_MakePolicyNumberUnique`, `20261009065042_AddPolicyHolderRelationship`, `20261009070447_ConstrainUserIdentityLengths`. The relationship migration adds optional `PolicyHolderId` but does not backfill pre-existing accounts. Before production upgrade, preflight duplicates/column lengths, decide how to link legacy users, back up, rehearse, verify, and document rollback.

Do not run migrations or data-changing SQL unless the user explicitly requests it and the target/backup plan are confirmed. The audit did a read-only live schema/history/count check only.

## Configuration and commands

The SQL connection is not tracked. Its key is `ConnectionStrings:DefaultConnection`; local configuration uses .NET user-secrets or environment variable `ConnectionStrings__DefaultConnection`. Do not print or copy the secret.

```powershell
# Restore the frontend only if dependencies are missing
Set-Location .\insurance-policy-portal-frontend
npm ci
npm run dev

# Backend from repository root (configured SQL secret required)
dotnet run --project .\InsurancePolicyPortalDemo\InsurancePolicyPortalDemo.csproj --launch-profile http

# Tests / validation
dotnet test .\InsurancePolicyPortalDemo.Tests\InsurancePolicyPortalDemo.Tests.csproj
Set-Location .\insurance-policy-portal-frontend
npm run lint
npm run test:run -- --maxWorkers=1 --testTimeout=15000
npm run build
```

Default local endpoints: frontend `http://localhost:3000`, API `http://localhost:5034`, Swagger `http://localhost:5034/swagger` in Development.

## Verification results and caveats

- **Verified 2026-10-12:** frontend lint passed; frontend tests passed 45/45 with one worker and 15-second timeout; frontend root, Swagger and configured questions API returned 200; unauthenticated `/api/users/me` returned 401.
- **Verified earlier in same working session:** .NET service tests passed 12/12 and `npm run build` completed successfully.
- **Current audit rerun limitation:** `dotnet test --no-build` could not launch testhost from OneDrive-backed output (“The cloud operation was unsuccessful”). This must be rerun after ensuring testhost files are locally available. A standalone `tsc --noEmit` also could not run because `.next/types/validator.ts` was absent; run Next build first to generate types.
- **Verified database metadata:** four migrations applied; local counts at audit moment were 3 users, 4 policyholders and 6 security-question rows.

## Highest-priority next task

Create a **staging release/migration preflight**: verify an external backup, inspect duplicate/over-length values, identify any legacy unlinked users, rehearse applying migrations and test the application against that database. Do not assume a nullable FK migration linked old accounts. Then address production CORS/HTTPS/CSRF/rate limiting and frontend authenticated-session experience.

For another assistant, start with this file plus `DATABASE_AND_MIGRATIONS.md`, `SECURITY_AND_PRODUCTION_AUDIT.md`, and `PRODUCTION_ROADMAP.md`. The repo already has substantial uncommitted changes; inspect `git status` and preserve them. The frontend's own `README.md` is create-next-app boilerplate, not a reliable handover.

## Classification of knowledge

- **Verified:** facts directly read from current source, test output, HTTP checks, or the read-only local SQL catalog inspection described above.
- **Inferred:** risks/recommendations from code analysis, especially deployment CSRF/TLS behavior.
- **Unverified:** production hosting, deployed SQL state, external ingress/security controls, backup/restore, and dependency vulnerability status.
