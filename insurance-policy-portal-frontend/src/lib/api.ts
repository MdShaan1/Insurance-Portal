const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5034";

// ============================================================
// TYPES
// ============================================================

export interface PolicyholderVerificationRequest {
  ssn: string;
  policyNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  zipCode: string;
}

export interface AccountInformation {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface SecurityInformation {
  petName: string;
  childhoodFriendName: string;
}

export type SecurityQuestionLabels = Record<keyof SecurityInformation, string>;

export interface ContactInformation {
  email: string;
  phone: string;
  streetAddress: string;
  streetAddressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface RegistrationRequest {
  personalInformation: PolicyholderVerificationRequest;
  accountInformation: AccountInformation;
  securityInformation: SecurityInformation;
  contactInformation: ContactInformation;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================
// HELPER
// ============================================================

async function throwApiError(response: Response): Promise<never> {
  let data: {
    title?: string;
    detail?: string;
    message?: string;
    errors?: Record<string, string[]>;
  } = {};
  try {
    data = await response.json() as typeof data;
  } catch {
    throw new ApiError(`The server returned an invalid error response (${response.status}).`, response.status);
  }
  throw new ApiError(
    data.detail ?? data.message ?? data.title ?? `Request failed (${response.status}).`,
    response.status,
    data.errors ?? {},
  );
}

export async function getSecurityQuestionLabels(): Promise<SecurityQuestionLabels> {
  const response = await fetch(`${API_URL}/api/users/security-questions`, {
    headers: {
      Accept: "application/json, application/problem+json",
    },
  });

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json() as Promise<SecurityQuestionLabels>;
}

// ============================================================
// VERIFY POLICYHOLDER
// ============================================================

export async function verifyPolicyholder(
  data: PolicyholderVerificationRequest
) {
  const response = await fetch(
    `${API_URL}/api/users/verify-policyholder`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json();
}

// ============================================================
// SIGN UP
// ============================================================

export async function signUp(
  data: RegistrationRequest
) {
  const response = await fetch(
    `${API_URL}/api/users/register`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json();
}

// ============================================================
// LOGIN
// ============================================================

export async function login(
  data: UserLoginRequest
) {
  const response = await fetch(
    `${API_URL}/api/users/login`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, application/problem+json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.json();
}

export interface ApiClient {
  getSecurityQuestionLabels: typeof getSecurityQuestionLabels;
  verifyPolicyholder: typeof verifyPolicyholder;
  signUp: typeof signUp;
  login: typeof login;
}

export const apiClient: ApiClient = {
  getSecurityQuestionLabels,
  verifyPolicyholder,
  signUp,
  login,
};