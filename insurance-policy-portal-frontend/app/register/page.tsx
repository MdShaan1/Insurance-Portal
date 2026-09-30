"use client";

import { useState } from "react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordInput from "@/components/PasswordInput";

import {
  verifyPolicyholder,
  signUp,
} from "@/src/lib/api";

type Step = 1 | 2 | 3 | 4;

interface PersonalInfo {
  ssn: string;
  policyNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  zipCode: string;
}

interface AccountInfo {
  username: string;
  password: string;
  confirmPassword: string;
}

interface SecurityInfo {
  petName: string;
  childhoodFriendName: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  streetAddress: string;
  streetAddressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface TouchedFields {
  [key: string]: boolean;
}

/*
 * Required field indicator.
 */
function RequiredMark() {
  return (
    <span className="text-red-600">
      *
    </span>
  );
}

/*
 * Password requirement component.
 *
 * Green = requirement satisfied
 * Red = requirement not satisfied
 */
function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        valid
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      <span className="text-base font-bold">
        {valid ? "✓" : "✗"}
      </span>

      <span>{text}</span>
    </div>
  );
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] =
    useState<Step>(1);

  // --------------------------------------------------
  // Form State
  // --------------------------------------------------

  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo>({
      ssn: "",
      policyNumber: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      zipCode: "",
    });

  const [accountInfo, setAccountInfo] =
    useState<AccountInfo>({
      username: "",
      password: "",
      confirmPassword: "",
    });

  const [securityInfo, setSecurityInfo] =
    useState<SecurityInfo>({
      petName: "",
      childhoodFriendName: "",
    });

  const [contactInfo, setContactInfo] =
    useState<ContactInfo>({
      email: "",
      phone: "",
      streetAddress: "",
      streetAddressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    });

  // --------------------------------------------------
  // UI State
  // --------------------------------------------------

  const [touched, setTouched] =
    useState<TouchedFields>({});

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const markTouched = (field: string) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const markFieldsTouched = (
    fields: string[]
  ) => {
    setTouched((previous) => {
      const updated = { ...previous };

      fields.forEach((field) => {
        updated[field] = true;
      });

      return updated;
    });
  };

  const inputClass = (
    hasError: boolean
  ) => {
    if (hasError) {
      return "w-full rounded-lg border border-red-500 bg-white px-4 py-3 text-gray-900 outline-none ring-1 ring-red-500 transition";
    }

    return "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  };

  // --------------------------------------------------
  // Step 1 Validation
  // --------------------------------------------------

  const personalErrors = {
    ssn:
      touched.ssn &&
      !/^\d{4}$/.test(
        personalInfo.ssn
      ),

    policyNumber:
      touched.policyNumber &&
      !personalInfo.policyNumber.trim(),

    firstName:
      touched.firstName &&
      !personalInfo.firstName.trim(),

    lastName:
      touched.lastName &&
      !personalInfo.lastName.trim(),

    dateOfBirth:
      touched.dateOfBirth &&
      !personalInfo.dateOfBirth.trim(),

    zipCode:
      touched.zipCode &&
      !personalInfo.zipCode.trim(),
  };

  const validatePersonalStep = () => {
    markFieldsTouched([
      "ssn",
      "policyNumber",
      "firstName",
      "lastName",
      "dateOfBirth",
      "zipCode",
    ]);

    if (
      !/^\d{4}$/.test(
        personalInfo.ssn
      )
    ) {
      return false;
    }

    if (
      !personalInfo.policyNumber.trim()
    ) {
      return false;
    }

    if (
      !personalInfo.firstName.trim()
    ) {
      return false;
    }

    if (
      !personalInfo.lastName.trim()
    ) {
      return false;
    }

    if (
      !personalInfo.dateOfBirth.trim()
    ) {
      return false;
    }

    if (
      !personalInfo.zipCode.trim()
    ) {
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Password Validation
  // --------------------------------------------------

  const passwordRequirements = {
    minLength:
      accountInfo.password.length >= 8,

    uppercase:
      /[A-Z]/.test(
        accountInfo.password
      ),

    lowercase:
      /[a-z]/.test(
        accountInfo.password
      ),

    special:
      /[^A-Za-z0-9]/.test(
        accountInfo.password
      ),
  };

  const passwordIsValid =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.special;

  const passwordMismatch =
    accountInfo.confirmPassword.length >
      0 &&
    accountInfo.password !==
      accountInfo.confirmPassword;

  const accountErrors = {
    username:
      touched.username &&
      !accountInfo.username.trim(),

    password:
      touched.password &&
      !passwordIsValid,

    confirmPassword:
      touched.confirmPassword &&
      (!accountInfo.confirmPassword.trim() ||
        passwordMismatch),
  };

  const validateAccountStep = () => {
    markFieldsTouched([
      "username",
      "password",
      "confirmPassword",
    ]);

    if (
      !accountInfo.username.trim()
    ) {
      return false;
    }

    if (!passwordIsValid) {
      return false;
    }

    if (
      !accountInfo.confirmPassword.trim()
    ) {
      return false;
    }

    if (
      accountInfo.password !==
      accountInfo.confirmPassword
    ) {
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Step 3 Validation
  // --------------------------------------------------

  const securityErrors = {
    petName:
      touched.petName &&
      !securityInfo.petName.trim(),

    childhoodFriendName:
      touched.childhoodFriendName &&
      !securityInfo.childhoodFriendName.trim(),
  };

  const validateSecurityStep = () => {
    markFieldsTouched([
      "petName",
      "childhoodFriendName",
    ]);

    if (
      !securityInfo.petName.trim()
    ) {
      return false;
    }

    if (
      !securityInfo.childhoodFriendName.trim()
    ) {
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Step 4 Validation
  // --------------------------------------------------

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      contactInfo.email
    );

  const contactErrors = {
    email:
      touched.email &&
      (!contactInfo.email.trim() ||
        !emailIsValid),

    phone:
      touched.phone &&
      !contactInfo.phone.trim(),

    streetAddress:
      touched.streetAddress &&
      !contactInfo.streetAddress.trim(),

    city:
      touched.city &&
      !contactInfo.city.trim(),

    state:
      touched.state &&
      !contactInfo.state.trim(),

    zipCode:
      touched.zipCodeContact &&
      !contactInfo.zipCode.trim(),

    country:
      touched.country &&
      !contactInfo.country.trim(),
  };

  const validateContactStep = () => {
    markFieldsTouched([
      "email",
      "phone",
      "streetAddress",
      "city",
      "state",
      "zipCodeContact",
      "country",
    ]);

    if (!contactInfo.email.trim()) {
      return false;
    }

    if (!emailIsValid) {
      return false;
    }

    if (!contactInfo.phone.trim()) {
      return false;
    }

    if (
      !contactInfo.streetAddress.trim()
    ) {
      return false;
    }

    if (!contactInfo.city.trim()) {
      return false;
    }

    if (!contactInfo.state.trim()) {
      return false;
    }

    if (!contactInfo.zipCode.trim()) {
      return false;
    }

    if (!contactInfo.country.trim()) {
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Policyholder Verification
  // --------------------------------------------------

  const handleVerifyPolicyholder =
    async () => {
      setErrorMessage("");

      if (!validatePersonalStep()) {
        return;
      }

      try {
        setIsVerifying(true);

        await verifyPolicyholder({
          ssn: personalInfo.ssn.trim(),

          policyNumber:
            personalInfo.policyNumber.trim(),

          firstName:
            personalInfo.firstName.trim(),

          lastName:
            personalInfo.lastName.trim(),

          dateOfBirth:
            personalInfo.dateOfBirth.trim(),

          zipCode:
            personalInfo.zipCode.trim(),
        });

        setCurrentStep(2);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Policyholder verification failed."
        );
      } finally {
        setIsVerifying(false);
      }
    };

  // --------------------------------------------------
  // Next
  // --------------------------------------------------

  const handleNext = () => {
    setErrorMessage("");

    if (currentStep === 1) {
      handleVerifyPolicyholder();
      return;
    }

    if (currentStep === 2) {
      if (validateAccountStep()) {
        setCurrentStep(3);
      }

      return;
    }

    if (currentStep === 3) {
      if (validateSecurityStep()) {
        setCurrentStep(4);
      }

      return;
    }
  };

  // --------------------------------------------------
  // Previous
  // --------------------------------------------------

  const handlePrevious = () => {
    setErrorMessage("");

    if (currentStep > 1) {
      setCurrentStep(
        (currentStep - 1) as Step
      );
    }
  };

  // --------------------------------------------------
  // Final Registration
  // --------------------------------------------------

  const handleRegistration =
    async () => {
      setErrorMessage("");

      if (!validateContactStep()) {
        return;
      }

      try {
        setIsRegistering(true);

        await signUp({
          personalInformation: {
            ssn: personalInfo.ssn.trim(),

            policyNumber:
              personalInfo.policyNumber.trim(),

            firstName:
              personalInfo.firstName.trim(),

            lastName:
              personalInfo.lastName.trim(),

            dateOfBirth:
              personalInfo.dateOfBirth.trim(),

            zipCode:
              personalInfo.zipCode.trim(),
          },

          accountInformation: {
            username:
              accountInfo.username.trim(),

            password:
              accountInfo.password,

            confirmPassword:
              accountInfo.confirmPassword,
          },

          securityInformation: {
            petName:
              securityInfo.petName.trim(),

            childhoodFriendName:
              securityInfo.childhoodFriendName.trim(),
          },

          contactInformation: {
            email:
              contactInfo.email.trim(),

            phone:
              contactInfo.phone.trim(),

            streetAddress:
              contactInfo.streetAddress.trim(),

            streetAddressLine2:
              contactInfo.streetAddressLine2.trim(),

            city:
              contactInfo.city.trim(),

            state:
              contactInfo.state.trim(),

            zipCode:
              contactInfo.zipCode.trim(),

            country:
              contactInfo.country.trim(),
          },
        });

        setSuccess(true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again."
        );
      } finally {
        setIsRegistering(false);
      }
    };

  // --------------------------------------------------
  // SUCCESS PAGE
  // --------------------------------------------------

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex min-h-[calc(100vh-145px)] items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl text-green-600">
                ✓
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Registration Successful
            </h1>

            <p className="mt-4 text-gray-600">
              Your Customer Portal account has
              been created successfully.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              You can now use your username and
              password to log in.
            </p>

            <a
              href="/login"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </a>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN REGISTER PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Heading */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Account
          </h1>

          <p className="mt-2 text-gray-600">
            Register for your Insurance Policy
            Portal account.
          </p>
        </div>

        {/* Progress */}

        <div className="mb-10">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex flex-1 items-center"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                        currentStep >= step
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step
                        ? "✓"
                        : step}
                    </div>

                    <span
                      className={`mt-2 text-xs font-medium ${
                        currentStep >= step
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step === 1 &&
                        "Personal"}

                      {step === 2 &&
                        "Account"}

                      {step === 3 &&
                        "Security"}

                      {step === 4 &&
                        "Contact"}
                    </span>
                  </div>

                  {index < 3 && (
                    <div
                      className={`mx-3 h-1 flex-1 rounded ${
                        currentStep > step
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* API Error */}

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form Card */}

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* ==========================================
              STEP 1
          ========================================== */}

          {currentStep === 1 && (
            <section>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Enter your information exactly as
                  it appears on your insurance policy.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* SSN */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Last 4 Digits of SSN{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    maxLength={4}
                    value={personalInfo.ssn}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setPersonalInfo({
                        ...personalInfo,
                        ssn: value,
                      });
                    }}
                    onBlur={() =>
                      markTouched("ssn")
                    }
                    placeholder="Enter 4 digits"
                    className={inputClass(
                      !!personalErrors.ssn
                    )}
                  />

                  {touched.ssn &&
                    !personalInfo.ssn && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter the last 4
                        digits of SSN.
                      </p>
                    )}

                  {touched.ssn &&
                    personalInfo.ssn &&
                    !/^\d{4}$/.test(
                      personalInfo.ssn
                    ) && (
                      <p className="mt-1 text-sm text-red-600">
                        SSN must contain exactly 4
                        digits.
                      </p>
                    )}
                </div>

                {/* Policy Number */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Policy Number{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      personalInfo.policyNumber
                    }
                    onChange={(event) =>
                      setPersonalInfo({
                        ...personalInfo,
                        policyNumber:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "policyNumber"
                      )
                    }
                    placeholder="Enter policy number"
                    className={inputClass(
                      !!personalErrors.policyNumber
                    )}
                  />

                  {personalErrors.policyNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Policy Number.
                    </p>
                  )}
                </div>

                {/* First Name */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    First Name{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      personalInfo.firstName
                    }
                    onChange={(event) =>
                      setPersonalInfo({
                        ...personalInfo,
                        firstName:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("firstName")
                    }
                    placeholder="Enter first name"
                    className={inputClass(
                      !!personalErrors.firstName
                    )}
                  />

                  {personalErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter First Name.
                    </p>
                  )}
                </div>

                {/* Last Name */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Last Name{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      personalInfo.lastName
                    }
                    onChange={(event) =>
                      setPersonalInfo({
                        ...personalInfo,
                        lastName:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("lastName")
                    }
                    placeholder="Enter last name"
                    className={inputClass(
                      !!personalErrors.lastName
                    )}
                  />

                  {personalErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Last Name.
                    </p>
                  )}
                </div>

                {/* Date of Birth */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Date of Birth{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      personalInfo.dateOfBirth
                    }
                    onChange={(event) =>
                      setPersonalInfo({
                        ...personalInfo,
                        dateOfBirth:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "dateOfBirth"
                      )
                    }
                    placeholder="MM/DD/YYYY"
                    className={inputClass(
                      !!personalErrors.dateOfBirth
                    )}
                  />

                  {personalErrors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Date of Birth.
                    </p>
                  )}
                </div>

                {/* ZIP */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    ZIP Code{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      personalInfo.zipCode
                    }
                    onChange={(event) =>
                      setPersonalInfo({
                        ...personalInfo,
                        zipCode:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("zipCode")
                    }
                    placeholder="Enter ZIP code"
                    className={inputClass(
                      !!personalErrors.zipCode
                    )}
                  />

                  {personalErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter ZIP Code.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isVerifying}
                  className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying
                    ? "Verifying..."
                    : "Verify & Continue"}
                </button>
              </div>
            </section>
          )}

          {/* ==========================================
              STEP 2
          ========================================== */}

          {currentStep === 2 && (
            <section>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Account Information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Create the username and password
                  you will use to access your portal
                  account.
                </p>
              </div>

              <div className="space-y-6">
                {/* Username */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Username{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      accountInfo.username
                    }
                    onChange={(event) =>
                      setAccountInfo({
                        ...accountInfo,
                        username:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("username")
                    }
                    placeholder="Enter username"
                    autoComplete="username"
                    className={inputClass(
                      !!accountErrors.username
                    )}
                  />

                  {accountErrors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Username.
                    </p>
                  )}
                </div>

                {/* Password */}

                <div>
                  <PasswordInput
                    label="Password"
                    value={
                      accountInfo.password
                    }
                    onChange={(event) =>
                      setAccountInfo({
                        ...accountInfo,
                        password:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("password")
                    }
                    placeholder="Enter password"
                    required
                    error={
                      touched.password &&
                      !accountInfo.password
                        ? "Please enter Password."
                        : ""
                    }
                  />

                  {/* Password requirements */}

                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-800">
                      Password requirements:
                    </p>

                    <div className="space-y-2">
                      <PasswordRequirement
                        valid={
                          passwordRequirements.minLength
                        }
                        text="At least 8 characters"
                      />

                      <PasswordRequirement
                        valid={
                          passwordRequirements.uppercase
                        }
                        text="At least one uppercase letter"
                      />

                      <PasswordRequirement
                        valid={
                          passwordRequirements.lowercase
                        }
                        text="At least one lowercase letter"
                      />

                      <PasswordRequirement
                        valid={
                          passwordRequirements.special
                        }
                        text="At least one special character"
                      />
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}

                <div>
                  <PasswordInput
                    label="Confirm Password"
                    value={
                      accountInfo.confirmPassword
                    }
                    onChange={(event) =>
                      setAccountInfo({
                        ...accountInfo,
                        confirmPassword:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "confirmPassword"
                      )
                    }
                    placeholder="Re-enter password"
                    required
                    error={
                      touched.confirmPassword &&
                      !accountInfo.confirmPassword
                        ? "Please confirm your password."
                        : touched.confirmPassword &&
                          passwordMismatch
                        ? "Passwords do not match."
                        : ""
                    }
                  />

                  {touched.confirmPassword &&
                    accountInfo.confirmPassword &&
                    !passwordMismatch && (
                      <p className="mt-1 text-sm font-medium text-green-600">
                        ✓ Passwords match.
                      </p>
                    )}
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-lg border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </section>
          )}

          {/* ==========================================
              STEP 3
          ========================================== */}

          {currentStep === 3 && (
            <section>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Security Information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Provide answers to the security
                  questions below.
                </p>
              </div>

              <div className="space-y-6">
                {/* Pet Name */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    What is your pet name?{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      securityInfo.petName
                    }
                    onChange={(event) =>
                      setSecurityInfo({
                        ...securityInfo,
                        petName:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("petName")
                    }
                    placeholder="Enter your pet name"
                    className={inputClass(
                      !!securityErrors.petName
                    )}
                  />

                  {securityErrors.petName && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter your pet name.
                    </p>
                  )}
                </div>

                {/* Childhood Friend */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    What is your childhood
                    friend&apos;s name?{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      securityInfo.childhoodFriendName
                    }
                    onChange={(event) =>
                      setSecurityInfo({
                        ...securityInfo,
                        childhoodFriendName:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "childhoodFriendName"
                      )
                    }
                    placeholder="Enter your childhood friend's name"
                    className={inputClass(
                      !!securityErrors.childhoodFriendName
                    )}
                  />

                  {securityErrors.childhoodFriendName && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter your childhood
                      friend&apos;s name.
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-lg border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </section>
          )}

          {/* ==========================================
              STEP 4
          ========================================== */}

          {currentStep === 4 && (
            <section>
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Contact Information
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Enter your contact and address
                  information.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Email */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Email{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="email"
                    value={
                      contactInfo.email
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        email:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("email")
                    }
                    placeholder="Enter email address"
                    autoComplete="email"
                    className={inputClass(
                      !!contactErrors.email
                    )}
                  />

                  {touched.email &&
                    !contactInfo.email && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter Email.
                      </p>
                    )}

                  {touched.email &&
                    contactInfo.email &&
                    !emailIsValid && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter a valid email
                        address.
                      </p>
                    )}
                </div>

                {/* Phone */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Phone{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="tel"
                    value={
                      contactInfo.phone
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        phone:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("phone")
                    }
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    className={inputClass(
                      !!contactErrors.phone
                    )}
                  />

                  {contactErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Phone Number.
                    </p>
                  )}
                </div>

                {/* Street Address */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Street Address{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.streetAddress
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        streetAddress:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "streetAddress"
                      )
                    }
                    placeholder="Enter street address"
                    autoComplete="street-address"
                    className={inputClass(
                      !!contactErrors.streetAddress
                    )}
                  />

                  {contactErrors.streetAddress && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Street Address.
                    </p>
                  )}
                </div>

                {/* Address Line 2 */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Street Address Line 2
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.streetAddressLine2
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        streetAddressLine2:
                          event.target.value,
                      })
                    }
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    autoComplete="address-line2"
                    className={inputClass(false)}
                  />
                </div>

                {/* City */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    City{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.city
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        city:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("city")
                    }
                    placeholder="Enter city"
                    autoComplete="address-level2"
                    className={inputClass(
                      !!contactErrors.city
                    )}
                  />

                  {contactErrors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter City.
                    </p>
                  )}
                </div>

                {/* State */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    State / Province{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.state
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        state:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("state")
                    }
                    placeholder="Enter state or province"
                    autoComplete="address-level1"
                    className={inputClass(
                      !!contactErrors.state
                    )}
                  />

                  {contactErrors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter State / Province.
                    </p>
                  )}
                </div>

                {/* ZIP */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    ZIP Code{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.zipCode
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        zipCode:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched(
                        "zipCodeContact"
                      )
                    }
                    placeholder="Enter ZIP code"
                    autoComplete="postal-code"
                    className={inputClass(
                      !!contactErrors.zipCode
                    )}
                  />

                  {contactErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter ZIP Code.
                    </p>
                  )}
                </div>

                {/* Country */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-900">
                    Country{" "}
                    <RequiredMark />
                  </label>

                  <input
                    type="text"
                    value={
                      contactInfo.country
                    }
                    onChange={(event) =>
                      setContactInfo({
                        ...contactInfo,
                        country:
                          event.target.value,
                      })
                    }
                    onBlur={() =>
                      markTouched("country")
                    }
                    placeholder="Enter country"
                    autoComplete="country-name"
                    className={inputClass(
                      !!contactErrors.country
                    )}
                  />

                  {contactErrors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      Please enter Country.
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="rounded-lg border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRegistering
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Required field note */}

        <p className="mt-6 text-center text-sm text-gray-500">
          <span className="text-red-600">
            *
          </span>{" "}
          indicates a required field.
        </p>
      </div>

      <Footer />
    </main>
  );
}