# Testing Guide

## Projects and test files

### Backend

`InsurancePolicyPortalDemo.Tests/InsurancePolicyPortalDemo.Tests.csproj` is a .NET 10 VSTest/NUnit project using NUnit 4.3.2, Moq 4.21.0, NUnit3TestAdapter 5.0.0, Microsoft.NET.Test.Sdk 17.14.0, and Coverlet collector 10.1.0. The single test source is `InsurancePolicyPortalDemo.Tests/Services/UserServiceTests.cs` (12 tests at audit date).

The service tests mock repository interfaces, so they do not need a SQL connection and do not verify live EF mappings, migrations, SQL constraints, HTTP response codes, cookie behavior, or CORS. They exercise verification, registration, duplicate cases, hashing, login outcomes and persistence-error propagation.

Run from the repository root:

```powershell
dotnet test .\InsurancePolicyPortalDemo.Tests\InsurancePolicyPortalDemo.Tests.csproj
```

**Observed historical verification:** this command passed **12/12** backend tests in the same working session after backend implementation changes. **Current audit rerun:** `dotnet test ... --no-build` could not launch `testhost.exe`: Windows reported “The cloud operation was unsuccessful” for the OneDrive-backed test output. This is an environment/file-availability issue; it is not a passing current rerun. No test logic was changed.

### Frontend

Frontend tests use Vitest 5, jsdom, React Testing Library and user-event. Four files:

- `tests/Register.test.tsx`
- `tests/Login.test.tsx`
- `tests/PasswordInput.test.tsx`
- `tests/lib/api.test.ts`

They cover wizard navigation, client validation, mocked API payloads/results/errors, password visibility and login UX. The UI/API calls are mocked; these do not exercise the real API/SQL database or browser cookie delivery.

From `insurance-policy-portal-frontend`:

```powershell
npm ci
npm run test:run -- --maxWorkers=1 --testTimeout=15000
npm run lint
npm run build
npm run test:coverage
```

`npm ci` installs from `package-lock.json`; it should be used when dependencies are absent. Coverage uses the already-declared `@vitest/coverage-v8` package.

## Results actually observed (2026-10-12 audit)

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | **Passed** | ESLint completed with exit code 0. |
| `npm run test:run -- --maxWorkers=1 --testTimeout=15000` | **Passed, 45/45** | Four test files passed. Vitest emitted a non-blocking warning about native config loading with ESM in `vitest.config.ts`. |
| `npx tsc --noEmit` | **Not verified / failed to start type-check** | TypeScript reported `.next/types/validator.ts` missing because `.next/types/**/*.ts` is included by `tsconfig.json` and the generated file did not exist. A successful Next build generates required Next types. |
| `npm run build` | **Passed in an earlier validation** | Next.js compiled, TypeScript completed and static pages generated. The build was not repeated during this audit because the dev server was already running and shares `.next` output. |
| `dotnet test ... --no-build` | **Blocked** | Test host executable could not launch from the OneDrive-backed build output (“cloud operation was unsuccessful”). |
| Earlier `dotnet test ...` | **Passed, 12/12** | Verified previously during this session. Not repeated successfully in the current audit because of the host launch issue. |

Under concurrent load/default 5-second timeout, one frontend registration test timed out; it passed when rerun alone with one worker and 15-second per-test timeout. This is a flakiness/performance risk in the test environment and suite, not proof of a product defect.

## Gaps

- No controller/API integration tests for status codes, Problem Details, authorization, cookies or CORS.
- No SQL Server integration tests for mappings, uniqueness races, cascade/restrict behavior or transaction consistency.
- No migration verification test or pre-migration data-length/duplicate preflight.
- No direct tests of `registrationValidation.ts` edge cases.
- Frontend tests mock fetch; malformed problem JSON and detailed field/status parsing have limited coverage.
- No observed coverage report was generated for this audit despite Coverlet/Vitest coverage tooling being present.
- No CI workflow was found in the inspected project tree to guarantee tests/builds on each change.
