"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationFlow } from "@/src/hooks/RegistrationFlowProvider";
import PersonalInformationStep from "@/components/register/PersonalInformationStep";
import RegistrationRouteFrame from "@/components/register/routes/RegistrationRouteFrame";
import RegistrationRouteMessage from "@/components/register/routes/RegistrationRouteMessage";

export default function PersonalRegistrationPage() {
  const flow = useRegistrationFlow();
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await flow.next()) router.push("/register/account");
  }
  return <RegistrationRouteFrame step={1}><RegistrationRouteMessage message={flow.message} /><PersonalInformationStep values={flow.values.personal} errors={flow.errors} isSubmitting={flow.isVerifying} onChange={(field, value) => flow.updateSection("personal", field, value)} onSubmit={submit} /></RegistrationRouteFrame>;
}
