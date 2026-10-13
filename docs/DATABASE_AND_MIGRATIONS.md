# Database and Migrations

**Audit date:** 2026-10-12

**Runtime evidence:** The configured local connection was inspected using read-only catalog/metadata queries. No schema or row was changed during this audit. Sensitive connection values are deliberately omitted.

## Runtime database findings

**Verified:** The active database name was `InsurancePolicyPortal`. `dbo.__EFMigrationsHistory` contained all four migrations listed below. SQL metadata showed `Users.PolicyHolderId` exists. The inspected local database contained 3 `Users`, 4 `PolicyHolders`, and 6 `SecurityQuestions` rows at audit time. Counts are a point-in-time local observation, not a deployment guarantee.

**Verified:** `Program.cs` registers SQL repositories only and fails startup if `ConnectionStrings:DefaultConnection` is absent. `InsurancePolicyPortalDesignTimeFactory` reads the same named connection from .NET user-secrets and environment variables for EF tooling. Application startup does not call `Database.Migrate`, `MigrateAsync`, or `EnsureCreated`; the update is an explicit operator action.

## Tables and columns

The following shape is verified against `InsurancePolicyPortalDbContext`, the current model snapshot, migrations, and the live local SQL `INFORMATION_SCHEMA.COLUMNS` metadata. String sizes are maximum character lengths; all listed columns are non-null unless noted.

### `dbo.PolicyHolders`

| Column | SQL type | Constraint / purpose |
|---|---|---|
| `Id` | `int` | Primary key, identity |
| `SSN` | `nvarchar(4)` | Last four digits |
| `PolicyNumber` | `nvarchar(12)` | Unique index |
| `FirstName`, `LastName` | `nvarchar(50)` | Policy identity |
| `DateOfBirth` | `nvarchar(10)` | Policy identity text |
| `ZipCode` | `nvarchar(6)` | Policy identity |
| `Email` | `nvarchar(254)` | Contact |
| `Phone` | `nvarchar(10)` | Contact |

### `dbo.Users`

| Column | SQL type | Constraint / purpose |
|---|---|---|
| `Id` | `uniqueidentifier` | Primary key |
| `PolicyNumber` | `nvarchar(12)` | Unique index |
| `FirstName`, `LastName` | `nvarchar(50)` | Legacy/standalone duplicate identity columns |
| `DateOfBirth` | `nvarchar(10)` | Legacy/standalone duplicate identity column |
| `ZipCode` | `nvarchar(6)` | Legacy/standalone duplicate identity column |
| `Username` | `nvarchar(30)` | Unique index |
| `PasswordHash` | `nvarchar(512)` | ASP.NET Core Identity hash |
| `Email` | `nvarchar(254)` | Account contact |
| `Phone` | `nvarchar(10)` | Account contact |
| `StreetAddress` | `nvarchar(200)` | Contact |
| `StreetAddressLine2` | `nvarchar(100)` | Contact |
| `City`, `State`, `Country` | `nvarchar(60)` | Contact |
| `CreatedAt` | `datetime2` | Account creation time |
| `PolicyHolderId` | `int NULL` | Optional FK to policyholder; unique filtered index when non-null |

`Users` keeps the duplicate identity columns for the schema/model, but current SQL repository mapping writes empty strings into those columns when a `PolicyHolderId` exists. Reads map name/DOB/ZIP from the linked `PolicyHolderEntity`. Therefore blank identity columns in `dbo.Users` do not by themselves mean the policyholder data or account is missing. To display both, join `Users.PolicyHolderId` to `PolicyHolders.Id`.

### `dbo.SecurityQuestions`

| Column | SQL type | Constraint / purpose |
|---|---|---|
| `Id` | `int` | Primary key, identity |
| `UserId` | `uniqueidentifier` | Required FK to `Users.Id`; indexed |
| `Question` | `nvarchar(150)` | Configured prompt |
| `Answer` | `nvarchar(512)` | Hashed answer, not recoverable plaintext |

The `Users`→`PolicyHolders` relationship is optional one-to-one, enforced by FK and a unique filtered index on `Users.PolicyHolderId`; delete behavior is `Restrict`. `Users`→`SecurityQuestions` is one-to-many with cascade delete.

Indexes verified from DbContext and migrations:

- unique `PolicyHolders.PolicyNumber`
- unique `Users.Username`
- unique `Users.PolicyNumber`
- unique `Users.PolicyHolderId` filtered by `[PolicyHolderId] IS NOT NULL`
- non-unique `SecurityQuestions.UserId`

## Migration history

| Migration ID | Change |
|---|---|
| `20260928111314_InitialSqlServer` | Creates SQL Server policyholder, user and security-question tables with initial keys/indexes and question FK. |
| `20260929113131_MakePolicyNumberUnique` | Makes user policy-number index unique. |
| `20261009065042_AddPolicyHolderRelationship` | Adds nullable `PolicyHolderId`, bounded strings, relation FK and filtered unique index; drops/recreates affected indexes around indexed-column length changes. |
| `20261009070447_ConstrainUserIdentityLengths` | Bounds user first name, last name, date of birth, and ZIP lengths. |

**Verified live locally:** all four IDs appeared in `__EFMigrationsHistory`; no pending project migrations were shown by the EF CLI during the earlier runtime validation. The model snapshot and latest migration designer agree with the current DbContext relationships, lengths, and indexes based on source inspection.

## Data and seed behavior

- `database.sql` is a manual SQL seed for sample policyholders. It uses `WHERE NOT EXISTS` against policy number; it does not create tables and is not run automatically.
- `Data/policyholders.json` and `Data/users.json`, plus `Repositories/Json/*`, are legacy/mock infrastructure. Current `Program.cs` does not register them.
- SQL registration saves through EF `SaveChangesAsync`; user and security-question child rows are persisted together by the relationship mapping.
- The relationship migration adds `PolicyHolderId` nullable but has no backfill operation. Existing users present before the migration can remain unlinked unless backfilled separately. That makes pre-deployment link reconciliation an operational/data-migration concern; do not infer old-user links from matching strings without a reviewed migration plan.

## Safe operational commands

The connection string must be supplied locally via .NET user-secrets or `ConnectionStrings__DefaultConnection`; never commit its value.

```powershell
dotnet ef migrations list --project .\InsurancePolicyPortalDemo\InsurancePolicyPortalDemo.csproj --startup-project .\InsurancePolicyPortalDemo\InsurancePolicyPortalDemo.csproj
dotnet ef database update --project .\InsurancePolicyPortalDemo\InsurancePolicyPortalDemo.csproj --startup-project .\InsurancePolicyPortalDemo\InsurancePolicyPortalDemo.csproj
```

The second command changes schema and should only be run after backup, migration review, target database confirmation, and change approval. It was **not** run as part of this audit; prior interactive troubleshooting did apply the project migrations to the configured local database, which is why the current local runtime history shows all four.

Example read-only check to view a linked account with policy identity:

```sql
USE InsurancePolicyPortal;
GO

SELECT u.Id, u.PolicyNumber, p.FirstName, p.LastName, p.DateOfBirth, p.ZipCode,
       u.Username, u.PolicyHolderId, u.CreatedAt
FROM dbo.Users AS u
LEFT JOIN dbo.PolicyHolders AS p ON p.Id = u.PolicyHolderId;
```

Before production rollout, review data lengths and duplicate keys before applying the migrations: narrowing SQL Server columns can fail when existing values exceed the new maximum, and unique-index creation fails when duplicates already exist.
