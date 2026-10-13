"use client";

import type { FormEvent } from "react";
import type { AccountInformation } from "@/src/lib/api";
import PasswordInput from "@/components/PasswordInput";
import { StepForm, TextField, type FieldErrors } from "./RegistrationFields";

export interface AccountFormValues extends AccountInformation {
  confirmPassword: string;
}

interface Props {
  values: AccountFormValues;
  errors: FieldErrors;
  isLoadingQuestions: boolean;
  onChange: (field: keyof AccountFormValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const passwordRequirements = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "At least one uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "At least one lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "At least one special character", test: (value: string) => /[@#$%!]/.test(value) },
];

export default function AccountInformationStep({
  values,
  errors,
  isLoadingQuestions,
  onChange,
  onSubmit,
  onBack,
}: Props) {
  return (
    <StepForm
      onSubmit={onSubmit}
      onBack={onBack}
      submitLabel="Continue"
      submittingLabel="Loading security questions..."
      isSubmitting={isLoadingQuestions}
    >
      <header className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create the username and password you will use to access your portal account.
        </p>
      </header>
      <div className="space-y-6">
        <TextField
          id="username"
          label="Username"
          value={values.username}
          placeholder="Enter username"
          maxLength={30}
          autoComplete="username"
          error={errors.username}
          onChange={(value) => onChange("username", value)}
        />
        <div>
          <PasswordInput
            id="password"
            label="Password"
            value={values.password}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="Enter password"
            required
            error={errors.password}
          />
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">Password requirements:</p>
            <div className="space-y-2">
              {passwordRequirements.map(({ label, test }) => {
                const valid = test(values.password);
                return (
                  <p key={label} className={`text-sm ${valid ? "text-green-600" : "text-red-600"}`}>
                    <span className="mr-2 font-bold">{valid ? "✓" : "✗"}</span>{label}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            value={values.confirmPassword}
            onChange={(event) => onChange("confirmPassword", event.target.value)}
            placeholder="Re-enter password"
            required
            error={errors.confirmPassword}
          />
          {values.confirmPassword && !errors.confirmPassword && (
            <p className="mt-1 text-sm font-medium text-green-600">✓ Passwords match.</p>
          )}
        </div>
      </div>
    </StepForm>
  );
}
