
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRegistration } from "./useRegistration";

type RegistrationFlow = ReturnType<typeof useRegistration>;

const RegistrationFlowContext =
  createContext<RegistrationFlow | null>(null);

export function RegistrationFlowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const registration = useRegistration();

  return (
    <RegistrationFlowContext.Provider value={registration}>
      {children}
    </RegistrationFlowContext.Provider>
  );
}

export function useRegistrationFlow() {
  const context = useContext(RegistrationFlowContext);

  if (!context) {
    throw new Error(
      "useRegistrationFlow must be used within RegistrationFlowProvider"
    );
  }

  return context;
}
