"use client";

import type { FormEvent } from "react";
import type { PolicyholderVerificationRequest } from "@/src/lib/api";
import { StepForm, TextField, type FieldErrors } from "./RegistrationFields";

interface Props {
  values: PolicyholderVerificationRequest;
  errors: FieldErrors;
  isSubmitting: boolean;
  onChange: (field: keyof PolicyholderVerificationRequest, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function PersonalInformationStep({
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
}: Props) {
  return (
    <StepForm
      onSubmit={onSubmit}
      submitLabel="Verify & Continue"
      submittingLabel="Verifying..."
      isSubmitting={isSubmitting}
    >
      <header className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your information exactly as it appears on your insurance policy.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField
          id="ssn"
          label="Last 4 Digits of SSN"
          value={values.ssn}
          placeholder="Enter 4 digits"
          inputMode="numeric"
          maxLength={4}
          error={errors.ssn}
          onChange={(value) => onChange("ssn", value.replace(/\D/g, ""))}
        />
        <TextField
          id="policyNumber"
          label="Policy Number"
          value={values.policyNumber}
          placeholder="Enter policy number"
          maxLength={12}
          error={errors.policyNumber}
          onChange={(value) => onChange("policyNumber", value)}
        />
        <TextField
          id="firstName"
          label="First Name"
          value={values.firstName}
          placeholder="Enter first name"
          maxLength={50}
          autoComplete="given-name"
          error={errors.firstName}
          onChange={(value) => onChange("firstName", value)}
        />
        <TextField
          id="lastName"
          label="Last Name"
          value={values.lastName}
          placeholder="Enter last name"
          maxLength={50}
          autoComplete="family-name"
          error={errors.lastName}
          onChange={(value) => onChange("lastName", value)}
        />
        <TextField
          id="dateOfBirth"
          label="Date of Birth"
          value={values.dateOfBirth}
          placeholder="MM/DD/YYYY"
          maxLength={10}
          error={errors.dateOfBirth}
          onChange={(value) => onChange("dateOfBirth", value)}
        />
        <TextField
          id="personalZipCode"
          label="ZIP Code"
          value={values.zipCode}
          placeholder="Enter ZIP code"
          inputMode="numeric"
          maxLength={6}
          error={errors.zipCode}
          onChange={(value) => onChange("zipCode", value)}
        />
      </div>
    </StepForm>
  );
}
