"use client";

import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountInformationStep, { type AccountFormValues } from "@/components/register/AccountInformationStep";
import ContactInformationStep from "@/components/register/ContactInformationStep";
import PersonalInformationStep from "@/components/register/PersonalInformationStep";
import SecurityInformationStep from "@/components/register/SecurityInformationStep";
import { useApiClient } from "@/src/lib/ApiClientProvider";
import type {
  ContactInformation,
  SecurityQuestionLabels,
  PolicyholderVerificationRequest,
  RegistrationRequest,
  SecurityInformation,
} from "@/src/lib/api";
import type { ApiError } from "@/src/lib/api";
import {
  getServerFieldErrors,
  validateAccountInformation,
  validateContactInformation,
  validatePersonalInformation,
  validateSecurityInformation,
} from "@/src/lib/registrationValidation";
import type { FieldErrors } from "@/components/register/RegistrationFields";

type Step = 1 | 2 | 3 | 4;

const initialPersonal: PolicyholderVerificationRequest = {
  ssn: "",
  policyNumber: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  zipCode: "",
};

const initialAccount: AccountFormValues = {
  username: "",
  password: "",
  confirmPassword: "",
};

const initialSecurity: SecurityInformation = {
  petName: "",
  childhoodFriendName: "",
};

const initialContact: ContactInformation = {
  email: "",
  phone: "",
  streetAddress: "",
  streetAddressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

const stepNames = ["Personal", "Account", "Security", "Contact"] as const;

export default function RegisterPage() {
  const api = useApiClient();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [personalInfo, setPersonalInfo] = useState(initialPersonal);
  const [accountInfo, setAccountInfo] = useState(initialAccount);
  const [securityInfo, setSecurityInfo] = useState(initialSecurity);
  const [securityQuestionLabels, setSecurityQuestionLabels] = useState<SecurityQuestionLabels>({
    petName: "",
    childhoodFriendName: "",
  });
  const [contactInfo, setContactInfo] = useState(initialContact);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingSecurityQuestions, setIsLoadingSecurityQuestions] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);

  const changeField = <T extends object>(
    setter: Dispatch<SetStateAction<T>>,
    field: keyof T,
    value: string,
  ) => {
    setter((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[String(field)];
      return next;
    });
    setErrorMessage("");
  };

  const goBack = () => {
    setErrorMessage("");
    setFieldErrors({});
    setCurrentStep((step) => Math.max(1, step - 1) as Step);
  };

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (currentStep === 1) {
      const errors = validatePersonalInformation(personalInfo);
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0) return;

      try {
        setIsVerifying(true);
        await api.verifyPolicyholder({
          ...personalInfo,
          policyNumber: personalInfo.policyNumber.trim(),
          firstName: personalInfo.firstName.trim(),
          lastName: personalInfo.lastName.trim(),
          dateOfBirth: personalInfo.dateOfBirth.trim(),
          zipCode: personalInfo.zipCode.trim(),
        });
        setCurrentStep(2);
      } catch (error) {
        handleServerError(error, "Policyholder verification failed.");
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    if (currentStep === 2) {
      const errors = validateAccountInformation(accountInfo);
      setFieldErrors(errors);
      if (Object.keys(errors).length === 0) {
        try {
          setIsLoadingSecurityQuestions(true);
          setSecurityQuestionLabels(await api.getSecurityQuestionLabels());
          setCurrentStep(3);
        } catch (error) {
          handleServerError(error, "Unable to load security questions. Please try again.");
        } finally {
          setIsLoadingSecurityQuestions(false);
        }
      }
      return;
    }

    const errors = validateSecurityInformation(securityInfo);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setCurrentStep(4);
  };

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    const errors = validateContactInformation(contactInfo);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const request: RegistrationRequest = {
      personalInformation: {
        ...personalInfo,
        policyNumber: personalInfo.policyNumber.trim(),
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        dateOfBirth: personalInfo.dateOfBirth.trim(),
        zipCode: personalInfo.zipCode.trim(),
      },
      accountInformation: {
        username: accountInfo.username.trim(),
        password: accountInfo.password,
        confirmPassword: accountInfo.confirmPassword,
      },
      securityInformation: {
        petName: securityInfo.petName.trim(),
        childhoodFriendName: securityInfo.childhoodFriendName.trim(),
      },
      contactInformation: {
        email: contactInfo.email.trim(),
        phone: contactInfo.phone.trim(),
        streetAddress: contactInfo.streetAddress.trim(),
        streetAddressLine2: contactInfo.streetAddressLine2.trim(),
        city: contactInfo.city.trim(),
        state: contactInfo.state.trim(),
        zipCode: contactInfo.zipCode.trim(),
        country: contactInfo.country.trim(),
      },
    };

    try {
      setIsRegistering(true);
      await api.signUp(request);
      setSuccess(true);
    } catch (error) {
      handleServerError(error, "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  function handleServerError(error: unknown, fallback: string) {
    if (isApiError(error)) {
      const affectedFields = Object.keys(error.fieldErrors).join(" ").toLowerCase();
      if (affectedFields.includes("personalinformation")) setCurrentStep(1);
      else if (affectedFields.includes("accountinformation")) setCurrentStep(2);
      else if (affectedFields.includes("securityinformation")) setCurrentStep(3);
      else if (affectedFields.includes("contactinformation")) setCurrentStep(4);
      setErrorMessage(error.message);
      setFieldErrors(getServerFieldErrors(error.fieldErrors));
      return;
    }
    setErrorMessage(error instanceof Error ? error.message : fallback);
  }

  function isApiError(error: unknown): error is ApiError {
    if (!(error instanceof Error) || !("fieldErrors" in error)) {
      return false;
    }

    const fieldErrors = error.fieldErrors;
    return typeof fieldErrors === "object"
      && fieldErrors !== null
      && Object.values(fieldErrors).every(
        (messages) => Array.isArray(messages) && messages.every((message) => typeof message === "string"),
      );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[calc(100vh-145px)] items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl text-green-600" aria-hidden="true">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Registration Successful</h1>
            <p className="mt-4 text-gray-600">
              Your Customer Portal account has been created successfully.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You can now use your username and password to log in.
            </p>
            <a href="/login" className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700">
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-600">Register for your Insurance Policy Portal account.</p>
        </header>

        <ol aria-label="Registration progress" className="mb-10 flex items-center justify-between">
          {stepNames.map((name, index) => {
            const step = (index + 1) as Step;
            return (
              <li key={name} aria-current={currentStep === step ? "step" : undefined} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                    currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {currentStep > step ? "✓" : step}
                  </span>
                  <span className={`mt-2 text-xs font-medium ${
                    currentStep >= step ? "text-blue-600" : "text-gray-500"
                  }`}>{name}</span>
                </div>
                {index < stepNames.length - 1 && (
                  <span aria-hidden="true" className={`mx-3 h-1 flex-1 rounded ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`} />
                )}
              </li>
            );
          })}
        </ol>

        {errorMessage && (
          <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {currentStep === 1 && (
          <PersonalInformationStep
            values={personalInfo}
            errors={fieldErrors}
            isSubmitting={isVerifying}
            onChange={(field, value) => changeField(setPersonalInfo, field, value)}
            onSubmit={handleContinue}
          />
        )}
        {currentStep === 2 && (
          <AccountInformationStep
            values={accountInfo}
            errors={fieldErrors}
            isLoadingQuestions={isLoadingSecurityQuestions}
            onChange={(field, value) => changeField(setAccountInfo, field, value)}
            onSubmit={handleContinue}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <SecurityInformationStep
            values={securityInfo}
            questionLabels={securityQuestionLabels}
            errors={fieldErrors}
            onChange={(field, value) => changeField(setSecurityInfo, field, value)}
            onSubmit={handleContinue}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <ContactInformationStep
            values={contactInfo}
            errors={fieldErrors}
            isSubmitting={isRegistering}
            onChange={(field, value) => changeField(setContactInfo, field, value)}
            onSubmit={handleRegistration}
            onBack={goBack}
          />
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <span className="text-red-600">*</span> indicates a required field
        </p>
      </div>
      <Footer />
    </main>
  );
}
