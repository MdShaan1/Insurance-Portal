# Technical Architecture

**Evidence date:** 2026-10-12. Diagrams describe inspected implementation, not future intent.

## Overall

```mermaid
flowchart LR
  B[Browser]
  NP[Next.js App Router<br/>React / TypeScript]
  API[ASP.NET Core API<br/>UserController]
  S[UserService]
  UR[SqlUserRepository]
  PR[SqlPolicyHolderRepository]
  EF[InsurancePolicyPortalDbContext<br/>EF Core SQL Server]
  DB[(SQL Server<br/>InsurancePolicyPortal)]
  B --> NP
  NP -- JSON fetch, credentials include --> API
  API --> S
  S --> UR
  S --> PR
  UR --> EF
  PR --> EF
  EF --> DB
  API -- HttpOnly auth cookie --> B
```

The Next.js server is used to serve the UI; the inspected API client calls the .NET API directly from the browser. `NEXT_PUBLIC_API_URL` supplies the browser API base URL; a localhost fallback exists in the client. Runtime backend persistence is SQL-only: startup requires `ConnectionStrings:DefaultConnection`, and DI registers `SqlUserRepository` and `SqlPolicyHolderRepository`.

## Registration

```mermaid
sequenceDiagram
  actor User
  participant UI as RegisterPage / step components
  participant Client as api.ts
  participant API as UserController
  participant Service as UserService
  participant PH as SqlPolicyHolderRepository
  participant Users as SqlUserRepository
  participant DB as SQL Server
  User->>UI: Enter personal information
  UI->>UI: validatePersonalInformation
  UI->>Client: verifyPolicyholder(personal)
  Client->>API: POST /api/users/verify-policyholder
  API->>Service: VerifyPolicyHolderAsync
  Service->>PH: Find policy by number
  PH->>DB: SELECT PolicyHolders
  Service->>Service: Compare SSN4, policy, name, DOB, ZIP
  Service->>Users: Check existing policy account
  Users->>DB: SELECT Users
  API-->>UI: 200, 409 duplicate, 422 mismatch, or 400 DTO validation
  User->>UI: Enter account, security and contact information
  UI->>Client: GET /api/users/security-questions (on valid Account step)
  UI->>UI: Validate remaining steps
  UI->>Client: signUp(full registration request)
  Client->>API: POST /api/users/register
  API->>Service: RegisterAsync
  Service->>PH: Re-read and re-verify policyholder (authoritative)
  Service->>Users: Check duplicates, hash password/answers, AddAsync
  Users->>DB: Save User and SecurityQuestions
  API-->>UI: 201 Created + UserResponse
  UI-->>User: Registration success view
```

The final registration re-verifies eligibility; the first-step verification is not trusted as an authorization token. Database unique indexes remain the concurrency-safe duplicate guard when separate requests race.

## Login and cookie authentication

```mermaid
sequenceDiagram
  actor User
  participant UI as LoginPage
  participant Client as api.ts
  participant API as UserController
  participant Service as UserService
  participant Repo as SqlUserRepository
  participant DB as SQL Server
  User->>UI: Submit username/password
  UI->>UI: Required-field checks
  UI->>Client: login(credentials)
  Client->>API: POST /api/users/login, credentials include
  API->>Service: LoginAsync
  Service->>Repo: GetByUsernameAsync
  Repo->>DB: Query User + PolicyHolder
  Service->>Service: Verify PasswordHash via PasswordHasher<User>
  API->>API: SignInAsync cookie scheme
  API-->>Client: 200 UserResponse + HttpOnly cookie
  Client-->>UI: Success; navigate to /
  User->>API: Later [Authorize] request
  API->>API: Validate cookie and claims
  User->>API: POST /api/users/logout
  API->>API: SignOutAsync and expire cookie
```

The cookie has `HttpOnly`, `SameSite=Strict`, a two-hour lifetime, sliding expiration and `Secure=Always` outside Development. No server-side session store is configured; authentication is cookie-ticket based. The frontend requests include credentials for API calls that use cookies. A client auth context, sign-in persistence UI, CSRF token flow, and frontend protected-route middleware were not found.

## Policyholder retrieval

```mermaid
sequenceDiagram
  participant Controller as UserController
  participant Service as UserService
  participant Repository as SqlPolicyHolderRepository
  participant Context as InsurancePolicyPortalDbContext
  participant SQL as SQL Server
  Controller->>Service: VerifyPolicyHolderAsync(request)
  Service->>Repository: GetByPolicyNumberAsync(trimmed number)
  Repository->>Context: AsNoTracking FirstOrDefault by PolicyNumber
  Context->>SQL: SELECT TOP(1) from PolicyHolders
  SQL-->>Service: PolicyHolder row
  Service->>Service: Trim and compare request values, OrdinalIgnoreCase
  Service->>Controller: false/mismatch or check existing SQL User
```

In login/current account reads, `SqlUserRepository` includes the policyholder navigation and maps identity properties from the related `PolicyHolderEntity` where available. Thus the `Users` row's duplicate identity columns can remain empty even though the UI/API response exposes the related identity details.

## Dependency injection and middleware

`Program.cs` registers controllers with string-enum JSON serialization; Problem Details and `ApiExceptionHandler`; cookie authentication/authorization; `IPasswordHasher<User>`; validated security-question options; SQL Server `DbContext`; SQL repositories; and `IUserService`. The CORS policy currently allows `http://localhost:3000` with credentials. Middleware order is exception handling, status-code pages, CORS, development-only Swagger, authentication, authorization, then mapped controllers.

`InsurancePolicyPortalDesignTimeFactory` resolves the same named database connection from user-secrets and environment variables for EF CLI operations. The application does not call `Database.Migrate()` or `EnsureCreated()` during startup. Operators apply reviewed migrations separately.

## Database relationship diagram

```mermaid
erDiagram
  POLICYHOLDERS ||--o| USERS : "optional unique link"
  USERS ||--o{ SECURITYQUESTIONS : "has"
  POLICYHOLDERS {
    int Id PK
    string SSN
    string PolicyNumber UK
    string FirstName
    string LastName
    string DateOfBirth
    string ZipCode
    string Email
    string Phone
  }
  USERS {
    guid Id PK
    string PolicyNumber UK
    string Username UK
    string PasswordHash
    int PolicyHolderId FK "nullable, unique when present"
    string FirstName "legacy/standalone field"
    string LastName "legacy/standalone field"
    string DateOfBirth "legacy/standalone field"
    string ZipCode "legacy/standalone field"
    string Email
    string Phone
    datetime CreatedAt
  }
  SECURITYQUESTIONS {
    int Id PK
    guid UserId FK
    string Question
    string Answer "password hash"
  }
```

The relationship diagram follows the EF model and the SQL metadata read on 2026-10-12. Lengths, indexes, migration sequence and current migration history are documented in [DATABASE_AND_MIGRATIONS.md](./DATABASE_AND_MIGRATIONS.md).
