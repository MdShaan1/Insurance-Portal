"use client";

import { useState } from "react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  showValidationMessage?: boolean;
}

export default function PasswordInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "Enter password",
  required = false,
  error,
  showValidationMessage = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const hasError =
    !!error && showValidationMessage;

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-900">
        {label}{" "}
        {required && (
          <span className="text-red-600">*</span>
        )}
      </label>

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition ${
          hasError
            ? "border-red-500 ring-1 ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        }`}
      />

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) =>
            setShowPassword(event.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300"
        />

        <span>Show password</span>
      </label>

      {hasError && (
        <p className="mt-1 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}