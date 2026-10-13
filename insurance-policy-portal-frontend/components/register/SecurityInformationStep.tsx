"use client";

import type { FormEvent } from "react";
import type { SecurityInformation, SecurityQuestionLabels } from "@/src/lib/api";
import { StepForm, TextField, type FieldErrors } from "./RegistrationFields";

interface Props {
  values: SecurityInformation;
  questionLabels: SecurityQuestionLabels;
  errors: FieldErrors;
  onChange: (field: keyof SecurityInformation, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

export default function SecurityInformationStep({
  values,
  questionLabels,
  errors,
  onChange,
  onSubmit,
  onBack,
}: Props) {
  return (
    <StepForm onSubmit={onSubmit} onBack={onBack} submitLabel="Continue">
      <header className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Security Information</h2>
        <p className="mt-2 text-sm text-gray-600">Provide answers to the security questions below.</p>
      </header>
      <div className="space-y-6">
        <TextField
          id="petName"
          label={questionLabels.petName}
          value={values.petName}
          placeholder="Enter your pet name"
          maxLength={100}
          error={errors.petName}
          onChange={(value) => onChange("petName", value)}
        />
        <TextField
          id="childhoodFriendName"
          label={questionLabels.childhoodFriendName}
          value={values.childhoodFriendName}
          placeholder="Enter your childhood friend's name"
          maxLength={100}
          error={errors.childhoodFriendName}
          onChange={(value) => onChange("childhoodFriendName", value)}
        />
      </div>
    </StepForm>
  );
}
