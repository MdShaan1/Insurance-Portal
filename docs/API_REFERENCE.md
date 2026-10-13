# API Reference

**Source of truth inspected:** `InsurancePolicyPortalDemo/Controllers/UserController.cs`, request/response DTOs, `Program.cs`, `ApiExceptionHandler.cs`, and `InsurancePolicyPortalDemo.http`. The API base URL in the current local setup is `http://localhost:5034`. Swagger is registered only in Development.

## Common behavior

- JSON request/response content; request DTOs are subject to ASP.NET Core `[ApiController]` model validation.
- Errors use `application/problem+json`. Expected policyholder mismatch is 422; registration conflict is 409; invalid DTO is 400. EF persistence failures are mapped to 503, while unhandled errors are 500.
- Business conflict/mismatch responses add an `errors` extension keyed by the registration field path. Validation response shape follows ASP.NET Core `ValidationProblemDetails`.
- The browser client uses `credentials: "include"` for verification, registration and login calls. Login sets an HttpOnly cookie; protected endpoints require that cookie.
- Password hashes, security-answer hashes, and full SSN values are not returned by `UserResponse`.

## Routes

| Method and route | Authentication | Success | Common failures |
|---|---|---|---|
| `GET /api/users/security-questions` | Public | 200; `{ "petName": "...", "childhoodFriendName": "..." }` | Invalid server options prevent startup rather than returning an empty prompt |
| `POST /api/users/verify-policyholder` | Public | 200; confirmation message | 400 request validation; 409 account already exists for the policy; 422 identity mismatch |
| `POST /api/users/register` | Public | 201 Created with `UserResponse` and `Location` to the created user route | 400 DTO validation; 409 duplicate username/policy; 422 policyholder identity mismatch; 503 persistence error; 500 unhandled |
| `POST /api/users/login` | Public | 200 `UserResponse`; sets authentication cookie | 400 DTO validation; 401 invalid credentials |
| `POST /api/users/logout` | Authenticated | 204; clears cookie | 401 unauthenticated |
| `GET /api/users/me` | Authenticated | 200; `{ userId, username, policyNumber }` from claims | 401 unauthenticated |
| `GET /api/users/{id:guid}` | Authenticated | 200 `UserResponse` for self | 401 unauthenticated; 404 when ID is not the current user or no record exists |

There are no roles. The resource endpoint checks the authenticated name-identifier claim against the requested GUID; a different ID returns 404 rather than exposing existence.

## Request bodies

### Verify policyholder

```json
{
  "ssn": "last-four-digits",
  "policyNumber": "policy-number",
  "firstName": "first-name",
  "lastName": "last-name",
  "dateOfBirth": "MM/DD/YYYY",
  "zipCode": "policy ZIP"
}
```

The service trims values and compares SSN, policy number, first/last name, DOB and ZIP case-insensitively. The API does not return which identity attribute mismatched. On success, it also checks whether that policy already has an account and returns a 409 if so.

### Register

```json
{
  "personalInformation": {
    "ssn": "last-four-digits",
    "policyNumber": "policy-number",
    "firstName": "first-name",
    "lastName": "last-name",
    "dateOfBirth": "MM/DD/YYYY",
    "zipCode": "policy ZIP"
  },
  "accountInformation": {
    "username": "portal-user",
    "password": "password",
    "confirmPassword": "password"
  },
  "securityInformation": {
    "petName": "answer",
    "childhoodFriendName": "answer"
  },
  "contactInformation": {
    "email": "user@example.com",
    "phone": "10 digits",
    "streetAddress": "address",
    "streetAddressLine2": "",
    "city": "city",
    "state": "state",
    "zipCode": "contact ZIP",
    "country": "country"
  }
}
```

Observed DTO rules include required nested sections; a username matching 3–30 ASCII letters/digits/dot/underscore/dash; password 8–128 characters with uppercase, lowercase and one of `@#$%!`; matching confirmation; security answers 2–100 characters; email length up to 254 and email validation; phone length 10; bounded address/location fields; and bounded identity fields. Exact annotations are in `DTOs/Requests/`.

The request requires `contactInformation.zipCode`, but the current `User` model has one `ZipCode` property for policy identity and no separate contact postal-code field. `UserService` sets it from `personalInformation.zipCode`; the submitted contact ZIP is not separately persisted. Treat contact ZIP storage as an implementation gap if the product requires a distinct mailing ZIP.

### Login

```json
{
  "username": "portal-user",
  "password": "password"
}
```

Login trims the username but does not trim the password. `confirmPassword` is registration-only.

## Responses

### `UserResponse`

The public account response contains `id`, `firstName`, `lastName`, `policyNumber`, `username`, `email`, and `createdAt`. It does not expose password or security-question hashes. SQL mapping sources policy identity fields through the related policyholder when the relation is present.

### Problem Details / field errors

Generic failures use Problem Details properties such as `title`, `status`, `detail`, and `instance`. Policy mismatch and registration conflict add an `errors` extension, for example:

```json
{
  "title": "Registration conflict",
  "status": 409,
  "detail": "Username already exists.",
  "errors": {
    "accountInformation.username": ["Username already exists."]
  }
}
```

This shape is mapped by `getServerFieldErrors` in the frontend. Unexpected internal exception details are not returned to the caller; the server logs them.

## Local examples

`InsurancePolicyPortalDemo/InsurancePolicyPortalDemo.http` contains request examples for configured security prompts, valid/invalid verification, registration, duplicate registration, login, current session, self-resource read, and logout. Its example password and identity data are demo values, not deployment credentials.
