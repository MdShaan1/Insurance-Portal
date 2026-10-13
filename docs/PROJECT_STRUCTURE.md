# Project Structure and File Guide

Generated content is deliberately excluded: `.git`, `.vs`, `bin`, `obj`, `node_modules`, `.next`, and `TestResults`. Build outputs and local environment values are not source documentation.

## Repository inventory

```text
InsurancePolicyPortalDemo/
├── InsurancePolicyPortalDemo.slnx
├── .gitignore
├── InsurancePolicyPortalDemo/
│   ├── InsurancePolicyPortalDemo.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   ├── InsurancePolicyPortalDemo.http
│   ├── database.sql
│   ├── Controllers/
│   ├── Data/
│   │   └── Migrations/
│   ├── DTOs/
│   │   ├── Requests/
│   │   └── Responses/
│   ├── Entities/
│   ├── Middleware/
│   ├── Models/
│   ├── Properties/
│   ├── Repositories/
│   │   ├── Json/
│   │   └── SqlServer/
│   └── Services/
├── InsurancePolicyPortalDemo.Tests/
│   ├── InsurancePolicyPortalDemo.Tests.csproj
│   └── Services/
└── insurance-policy-portal-frontend/
    ├── package.json
    ├── package-lock.json
    ├── next.config.ts
    ├── eslint.config.mjs
    ├── vitest.config.ts
    ├── vitest.setup.ts
    ├── tsconfig.json
    ├── app/
    ├── components/
    ├── public/
    ├── src/lib/
    └── tests/
```

## Root

- `InsurancePolicyPortalDemo.slnx` includes the backend API and backend test project. The frontend is an independent npm project and is not a solution project.
- `.gitignore` excludes .NET/VS outputs and frontend dependency/build outputs. The frontend-specific `.gitignore` excludes Next and package-manager outputs.
- There is no root README, CI workflow, Dockerfile, compose file, or deployment manifest in the inspected non-generated tree.

## Backend: `InsurancePolicyPortalDemo/`

### Host and configuration

- `Program.cs` — composition root: controllers, Problem Details and exception handler, cookie auth/authorization, password hasher, SQL Server DbContext and SQL repositories, CORS, Swagger, middleware order, and route mapping. It requires `ConnectionStrings:DefaultConnection`; runtime has no JSON fallback.
- `appsettings.json` — non-secret security-question labels. The SQL connection belongs in .NET user-secrets or `ConnectionStrings__DefaultConnection`; no credential value belongs in tracked settings.
- `Properties/launchSettings.json` — local HTTP/HTTPS profiles, including HTTP port 5034 and HTTPS port 7160. These are launch profiles, not production hosting configuration.
- `InsurancePolicyPortalDemo.csproj` — net10.0 target, EF Core SQL Server/Design, OpenAPI, Swashbuckle, and local user-secrets ID.
- `InsurancePolicyPortalDemo.http` — manual API request examples for question labels, verification, registration, duplicate registration, login, current profile, user resource, and logout. Example registration credentials are illustrative only.
- `database.sql` — idempotent sample policyholder seed insert. It is manual SQL; the application does not execute it on startup.

### HTTP and business logic

- `Controllers/UserController.cs` — `/api/users` endpoints. Binds request DTOs, calls `IUserService`, creates/clears cookie sessions, and enforces authenticated access for profile/resource/logout endpoints.
- `Services/IUserService.cs` — service contract consumed by the controller.
- `Services/UserService.cs` — registration/verification/login business rules, identity matching/normalization, password and security-answer hashing/verification, and response mapping.
- `Services/RegistrationExceptions.cs` — typed policyholder mismatch and registration conflict exceptions for the exception handler.
- `Services/SecurityQuestionOptions.cs` — validated options bound from `SecurityQuestions`.
- `Middleware/ApiExceptionHandler.cs` — maps expected business and persistence exceptions to Problem Details; logs unexpected failures.
- `DTOs/Requests/` — API validation boundary: `PersonalInformationRequest`, `AccountInformationRequest`, `SecurityInformationRequest`, `ContactInformationRequest`, `RegistrationRequest`, `UserLoginRequest`, and `SecurityQuestionRequest`.
- `DTOs/Responses/UserResponse.cs` — safe public account response projection; it does not expose password hashes or security answers.
- `Models/` — service/repository domain objects for users, policyholders, and security questions. They are distinct from persistence entities.
- `Entities/` — EF persistence rows: `UserEntity`, `PolicyHolderEntity`, and `SecurityQuestionEntity`.

### Persistence, mappings, and migrations

- `Data/InsurancePolicyPortalDbContext.cs` — DbSets, maximum lengths, unique indexes, one-to-one optional User/PolicyHolder relationship, and User/SecurityQuestion cascade relationship.
- `Data/InsurancePolicyPortalDesignTimeFactory.cs` — EF CLI DbContext factory. Loads the connection from user-secrets and environment variables; does not embed a connection credential.
- `Data/Migrations/InsurancePolicyPortalDbContextModelSnapshot.cs` — EF's current model snapshot.
- `Data/Migrations/20260928111314_InitialSqlServer.cs` (+ `.Designer.cs`) — initial SQL Server schema.
- `Data/Migrations/20260929113131_MakePolicyNumberUnique.cs` (+ `.Designer.cs`) — policy-number uniqueness change.
- `Data/Migrations/20261009065042_AddPolicyHolderRelationship.cs` (+ `.Designer.cs`) — bounded column lengths, optional `Users.PolicyHolderId`, unique filtered link index, one-to-one FK, and unique indexes.
- `Data/Migrations/20261009070447_ConstrainUserIdentityLengths.cs` (+ `.Designer.cs`) — further identity-column length constraints on `Users`.
- `Repositories/IUserRepository.cs`, `Repositories/IPolicyHolderRepository.cs` — persistence contracts used by the service.
- `Repositories/SqlServer/SqlUserRepository.cs` — EF CRUD/query mapping for users and security questions, policyholder relation and uniqueness violation translation.
- `Repositories/SqlServer/SqlPolicyHolderRepository.cs` — policy-number lookup from SQL Server.
- `Repositories/Json/UserRepository.cs`, `Repositories/Json/PolicyHolderRepository.cs` — legacy/development JSON implementations. Their existence does not mean the current runtime selects them.
- `Data/users.json`, `Data/policyholders.json` — mock/legacy data, not the configured runtime database.

## Backend tests: `InsurancePolicyPortalDemo.Tests/`

- `InsurancePolicyPortalDemo.Tests.csproj` — NUnit, Moq, .NET test host, and Coverlet collector.
- `Services/UserServiceTests.cs` — service unit tests with mocked repositories and a real Identity password hasher. Coverage includes verification success/failure, registration success/mismatch/duplicates/persistence failure, password hashing/login success/failure/blank credentials. It does not exercise a real SQL Server/API host.

## Frontend: `insurance-policy-portal-frontend/`

- `package.json`, `package-lock.json` — project scripts and pinned/resolved npm dependencies.
- `app/page.tsx` — landing page.
- `app/login/page.tsx` — login UI and API interaction.
- `app/register/page.tsx` — four-step registration state machine and submit/error routing.
- `app/layout.tsx`, `app/globals.css`, `app/favicon.ico` — App Router root, shared styles and icon.
- `components/Header.tsx`, `Footer.tsx` — shared site chrome.
- `components/PasswordInput.tsx` — shared show/hide password field.
- `components/register/RegistrationFields.tsx` — shared registration text fields and step form.
- `components/register/PersonalInformationStep.tsx`, `AccountInformationStep.tsx`, `SecurityInformationStep.tsx`, `ContactInformationStep.tsx` — per-step form rendering.
- `src/lib/api.ts` — request/response types, API base URL, error parser, and calls to verification, question-label, registration, and login endpoints. Requests include credentials where cookie auth is needed.
- `src/lib/registrationValidation.ts` — client-side validators and server field-error normalization.
- `public/` — static starter SVG assets (some are not specific to portal features).
- `.env.local` — local API base URL configuration; ignored and must not be committed or documented with its contents.
- `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts` — type-check, Next, lint, and frontend test setup.
- `README.md` — the untouched create-next-app starter README; it is not an accurate project handover.
- `AGENTS.md`, `CLAUDE.md` — frontend-local agent guidance/starter context, not runtime features.

### Frontend tests

- `tests/Register.test.tsx` — registration validation, navigation, request payload, server field error, and success flow.
- `tests/Login.test.tsx` — login fields, validation, request and failure behavior.
- `tests/PasswordInput.test.tsx` — password control behavior.
- `tests/lib/api.test.ts` — HTTP calls and error behavior for the API client.

## Key dependency chain

`app/register/page.tsx` → step components and `registrationValidation.ts` → `src/lib/api.ts` → `/api/users/*` → `UserController` → `IUserService`/`UserService` → SQL repository interfaces → `SqlUserRepository` / `SqlPolicyHolderRepository` → `InsurancePolicyPortalDbContext` → SQL Server.
