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

// ============================================================
// HELPER
// ============================================================

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();

    return (
      data?.message ||
      data?.title ||
      "Something went wrong."
    );
  } catch {
    return "Something went wrong.";
  }
}

// ============================================================
// VERIFY POLICYHOLDER
// ============================================================

export async function verifyPolicyholder(
  data: PolicyholderVerificationRequest
) {
  const response = await fetch(
    `${API_URL}/api/User/verify-policyholder`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
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
    `${API_URL}/api/User/SignUp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
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
    `${API_URL}/api/User/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}