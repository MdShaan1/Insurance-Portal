
import type { ReactNode } from "react";
import { RegistrationFlowProvider } from "@/src/hooks/RegistrationFlowProvider";

export default function RegistrationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RegistrationFlowProvider>
      {children}
    </RegistrationFlowProvider>
  );
}
