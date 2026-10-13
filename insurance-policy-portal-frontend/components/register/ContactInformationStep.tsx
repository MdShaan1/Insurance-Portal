"use client";

import type { FormEvent } from "react";
import type { ContactInformation } from "@/src/lib/api";
import { StepForm, TextField, type FieldErrors } from "./RegistrationFields";

interface Props {
  values: ContactInformation;
  errors: FieldErrors;
  isSubmitting: boolean;
  onChange: (field: keyof ContactInformation, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export default function ContactInformationStep({
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onBack,
}: Props) {
  const field = (name: keyof ContactInformation, label: string, placeholder: string, options: Partial<{
    type: string;
    autoComplete: string;
    maxLength: number;
    inputMode: "text" | "numeric" | "email" | "tel";
  }> = {}) => (
    <TextField
      id={name}
      label={label}
      value={values[name]}
      placeholder={placeholder}
      error={errors[name]}
      onChange={(value) => onChange(name, value)}
      {...options}
    />
  );

  return (
    <StepForm
      onSubmit={onSubmit}
      onBack={onBack}
      submitLabel="Create Account"
      isSubmitting={isSubmitting}
    >
      <header className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="mt-2 text-sm text-gray-600">Enter your contact and address information.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {field("email", "Email", "Enter email address", { type: "email", autoComplete: "email", maxLength: 254 })}
        {field("phone", "Phone", "Enter phone number", { type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 10 })}
        <div className="md:col-span-2">
          {field("streetAddress", "Street Address", "Enter street address", { autoComplete: "street-address", maxLength: 200 })}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="streetAddressLine2" className="mb-2 block text-sm font-semibold text-gray-900">
            Street Address Line 2
          </label>
          <input
            id="streetAddressLine2"
            name="streetAddressLine2"
            type="text"
            value={values.streetAddressLine2}
            onChange={(event) => onChange("streetAddressLine2", event.target.value)}
            placeholder="Apartment, suite, unit, etc. (optional)"
            autoComplete="address-line2"
            maxLength={100}
            aria-invalid={!!errors.streetAddressLine2}
            aria-describedby={errors.streetAddressLine2 ? "streetAddressLine2-error" : undefined}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {errors.streetAddressLine2 && (
            <p id="streetAddressLine2-error" className="mt-1 text-sm text-red-600">
              {errors.streetAddressLine2}
            </p>
          )}
        </div>
        {field("city", "City", "Enter city", { autoComplete: "address-level2", maxLength: 60 })}
        {field("state", "State / Province", "Enter state or province", { autoComplete: "address-level1", maxLength: 60 })}
        {field("zipCode", "ZIP Code", "Enter ZIP code", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
        {field("country", "Country", "Enter country", { autoComplete: "country-name", maxLength: 60 })}
      </div>
    </StepForm>
  );
}
