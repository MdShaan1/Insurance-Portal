import type {
  ContactInformation,
  PolicyholderVerificationRequest,
  SecurityInformation,
} from "@/src/lib/api";
import type { AccountFormValues } from "@/components/register/AccountInformationStep";
import type { FieldErrors } from "@/components/register/RegistrationFields";

const personName = /^[A-Za-z][\-A-Za-z' ]{0,49}$/;
const locationName = /^[\-A-Za-z .']{2,60}$/;
const username = /^[A-Za-z0-9_.-]{3,30}$/;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validDateOfBirth(value: string): boolean {
  const match = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [, month, day, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return parsed.getFullYear() === Number(year)
    && parsed.getMonth() === Number(month) - 1
    && parsed.getDate() === Number(day)
    && parsed <= new Date(new Date().setHours(0, 0, 0, 0));
}

export function validatePersonalInformation(
  values: PolicyholderVerificationRequest,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!/^\d{4}$/.test(values.ssn)) {
    errors.ssn = values.ssn ? "SSN must contain exactly 4 digits." : "Please enter the last 4 digits of SSN.";
  }
  if (!/^VA[A-Za-z0-9]{7,10}$/.test(values.policyNumber)) {
    errors.policyNumber = values.policyNumber
      ? "Policy number must start with VA and contain 9-12 characters."
      : "Please enter Policy Number.";
  }
  if (!personName.test(values.firstName.trim())) {
    errors.firstName = values.firstName     ? "First name must be 1-50 letters with valid characters." : "Please enter First Name.";
  }
  if (!personName.test(values.lastName.trim())) {
    errors.lastName = values.lastName     ? "Last name must be 1-50 letters with valid characters." : "Please enter Last Name.";
  }
  if (!validDateOfBirth(values.dateOfBirth)) {
    errors.dateOfBirth = values.dateOfBirth
      ? "Enter a valid date of birth in MM/DD/YYYY format."
      : "Please enter Date of Birth.";
  }
  if (!/^\d{5,6}$/.test(values.zipCode)) {
    errors.zipCode = values.zipCode ? "ZIP code must contain 5 or 6 digits." : "Please enter ZIP Code.";
  }
  return errors;
}

export function validateAccountInformation(values: AccountFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!username.test(values.username.trim())) {
    errors.username = values.username ? "Username must be 3-30 valid characters." : "Please enter Username.";
  }
  if (values.password.length < 8 || values.password.length > 128
    || !/[A-Z]/.test(values.password)
    || !/[a-z]/.test(values.password)
    || !/[@#$%!]/.test(values.password)) {
    errors.password = values.password
      ? "Password must be 8-128 characters and include uppercase, lowercase, and one of @ # $ % !."
      : "Please enter Password.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function validateSecurityInformation(values: SecurityInformation): FieldErrors {
  const errors: FieldErrors = {};
  if (values.petName.trim().length < 2 || values.petName.length > 100) {
    errors.petName = "Please enter your pet name (2-100 characters).";
  }
  if (values.childhoodFriendName.trim().length < 2 || values.childhoodFriendName.length > 100) {
    errors.childhoodFriendName = "Please enter your childhood friend's name (2-100 characters).";
  }
  return errors;
}

export function validateContactInformation(values: ContactInformation): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.test(values.email.trim()) || values.email.length > 254) {
    errors.email = values.email ? "Please enter a valid email address." : "Please enter Email.";
  }
  if (!/^\d{10}$/.test(values.phone)) {
    errors.phone = values.phone ? "Phone number must contain exactly 10 digits." : "Please enter Phone Number.";
  }
  if (values.streetAddress.trim().length < 5 || values.streetAddress.length > 200) {
    errors.streetAddress = values.streetAddress ? "Street address must be 5-200 characters." : "Please enter Street Address.";
  }
  if (values.streetAddressLine2.length > 100) {
    errors.streetAddressLine2 = "Address line 2 must be no more than 100 characters.";
  }
  if (!locationName.test(values.city.trim())) {
    errors.city = values.city ? "City must contain 2-60 letters and common separators." : "Please enter City.";
  }
  if (!locationName.test(values.state.trim())) {
    errors.state = values.state ? "State must contain 2-60 letters and common separators." : "Please enter State / Province.";
  }
  if (!/^\d{5,6}$/.test(values.zipCode)) {
    errors.zipCode = values.zipCode ? "ZIP code must contain 5 or 6 digits." : "Please enter ZIP Code.";
  }
  if (!locationName.test(values.country.trim())) {
    errors.country = values.country ? "Country must contain 2-60 letters and common separators." : "Please enter Country.";
  }
  return errors;
}

export function getServerFieldErrors(errors: Record<string, string[]>): FieldErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const field = key.split(/[.[\]]/).filter(Boolean).at(-1) ?? key;
      const normalizedField = field.charAt(0).toLowerCase() + field.slice(1);
      return [normalizedField, messages[0] ?? "This field is invalid."];
    }),
  );
}
