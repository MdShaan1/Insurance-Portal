"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationFlow } from "@/src/hooks/RegistrationFlowProvider";
import ContactInformationStep from "@/components/register/ContactInformationStep";
import RegistrationRouteFrame from "@/components/register/routes/RegistrationRouteFrame";
import RegistrationRouteMessage from "@/components/register/routes/RegistrationRouteMessage";

export default function ContactRegistrationPage() {
  const flow = useRegistrationFlow();
  const router = useRouter();

  useEffect(() => {
    if (flow.step < 4) {
      router.replace(
        flow.step < 2
          ? "/register/personal"
          : flow.step < 3
            ? "/register/account"
            : "/register/security",
      );
    }
  }, [flow.step, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (await flow.submitRegistration()) {
      router.push("/register/success");
    }
  }

  function back() {
    flow.back();
    router.push("/register/security");
  }

  return (
    <RegistrationRouteFrame step={4}>
      <RegistrationRouteMessage message={flow.message} />
      <ContactInformationStep
        values={flow.values.contact}
        errors={flow.errors}
        isSubmitting={flow.isRegistering}
        onChange={(field, value) =>
          flow.updateSection("contact", field, value)
        }
        onSubmit={submit}
        onBack={back}
      />
    </RegistrationRouteFrame>
  );
}
