"use client";
import { useState } from "react";
import {
  apiClient,
  type PolicyholderVerificationRequest,
  type AccountInformation,
  type SecurityInformation,
  type ContactInformation,
  type SecurityQuestionLabels,
} from "@/src/lib/api";
import type { FieldErrors } from "@/components/register/RegistrationFields";
import {
  validateAccountInformation,
  validateContactInformation,
  validatePersonalInformation,
  validateSecurityInformation,
} from "@/src/lib/registrationValidation";
export type RegistrationStep = 1 | 2 | 3 | 4;
export type AccountFormValues = AccountInformation;
export interface RegistrationValues {
  personal: PolicyholderVerificationRequest;
  account: AccountFormValues;
  security: SecurityInformation;
  contact: ContactInformation;
}
interface ApiErrorLike {
  message?: string;
  fieldErrors?: Record<string, string | string[]>;
}
const initialValues: RegistrationValues = {
  personal: {
    ssn: "",
    policyNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    zipCode: "",
  },
  account: {
    username: "",
    password: "",
    confirmPassword: "",
  },
  security: {
    petName: "",
    childhoodFriendName: "",
  },
  contact: {
    email: "",
    phone: "",
    streetAddress: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
};
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
function getFieldErrors(error: unknown): FieldErrors {
  if (typeof error !== "object" || error === null) {
    return {};
  }
  const apiError = error as ApiErrorLike;
  const serverErrors = apiError.fieldErrors;
  if (!serverErrors || typeof serverErrors !== "object") {
    return {};
  }
  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(serverErrors)) {
    // Handles server keys such as AccountInformation.Username.
    const fieldName = key.split(".").pop() ?? key;
    const message = Array.isArray(value)
      ? value.find((item) => typeof item === "string" && item.trim())
      : value;
    if (typeof message === "string" && message.trim()) {
      result[fieldName] = message;
    }
  }
  return result;
}
export function useRegistration() {
  const [step, setStep] = useState<RegistrationStep>(1);
  const [values, setValues] =
    useState<RegistrationValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [questionLabels, setQuestionLabels] =
    useState<SecurityQuestionLabels | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [success, setSuccess] = useState(false);
  function updateSection<
    S extends keyof RegistrationValues,
    K extends keyof RegistrationValues[S],
  >(section: S, field: K, value: RegistrationValues[S][K]) {
    setValues((previous) => ({
      ...previous,
      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
    const fieldName = String(field);
    setErrors((previous) => {
      const updated = { ...previous };
      for (const key of Object.keys(updated)) {
        if (key === fieldName || key.endsWith(`.${fieldName}`)) {
          delete updated[key];
        }
      }
      return updated;
    });
    setMessage("");
  }
  async function verifyAndContinue(): Promise<boolean> {
    const validationErrors = validatePersonalInformation(values.personal);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }
    setErrors({});
    setMessage("");
    setIsVerifying(true);
    try {
      await apiClient.verifyPolicyholder(values.personal);
      setIsLoadingQuestions(true);
      try {
        const labels = await apiClient.getSecurityQuestionLabels();
        setQuestionLabels(labels);
      } finally {
        setIsLoadingQuestions(false);
      }
      setStep(2);
      return true;
    } catch (error: unknown) {
      setErrors(getFieldErrors(error));
      setMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsVerifying(false);
    }
  }
  async function next(): Promise<boolean> {
    setMessage("");
    if (step === 1) {
      return await verifyAndContinue();
    }
    if (step === 2) {
      const validationErrors = validateAccountInformation(values.account);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }
      setErrors({});
      setStep(3);
      return true;
    }
    if (step === 3) {
      const validationErrors = validateSecurityInformation(values.security);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }
      setErrors({});
      setStep(4);
      return true;
    }
    return false;
  }
  function back(): void {
    setMessage("");
    setErrors({});
    setStep((current) =>
      current === 1 ? 1 : ((current - 1) as RegistrationStep)
    );
  }
  async function submitRegistration(): Promise<boolean> {
    const validationErrors = validateContactInformation(values.contact);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    setMessage("");
    setIsRegistering(true);

    try {
      await apiClient.signUp({
        personalInformation: values.personal,
        accountInformation: values.account,
        securityInformation: values.security,
        contactInformation: values.contact,
      });

      setSuccess(true);
      return true;
    } catch (error: unknown) {
      setErrors(getFieldErrors(error));
      setMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsRegistering(false);
    }
  }

  return {
    step,
    values,
    errors,
    message,
    questionLabels,
    isVerifying,
    isRegistering,
    isLoadingQuestions,
    success,
    updateSection,
    next,
    back,
    submitRegistration,
  };
}
