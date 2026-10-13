"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";

export type FieldErrors = Record<string, string>;

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
  error?: string;
  onChange: (value: string) => void;
}

export function TextField({
  id,
  label,
  value,
  placeholder,
  type = "text",
  autoComplete,
  maxLength,
  inputMode,
  error,
  onChange,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-900">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition ${
          error
            ? "border-red-500 ring-1 ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface StepFormProps {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
  submitLabel: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
}

export function StepForm({
  children,
  onSubmit,
  onBack,
  submitLabel,
  submittingLabel = "Creating Account...",
  isSubmitting = false,
}: StepFormProps) {
  return (
    <form className="rounded-2xl bg-white p-8 shadow-lg" onSubmit={onSubmit} noValidate>
      {children}
      <div className="mt-8 flex justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-gray-300 bg-white px-7 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Back
          </button>
        ) : <span />}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
