"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationFlow } from "@/src/hooks/RegistrationFlowProvider";
import AccountInformationStep from "@/components/register/AccountInformationStep";
import RegistrationRouteFrame from "@/components/register/routes/RegistrationRouteFrame";
import RegistrationRouteMessage from "@/components/register/routes/RegistrationRouteMessage";

export default function AccountRegistrationPage() {
  const flow = useRegistrationFlow();
  const router = useRouter();
  useEffect(() => { if (flow.step < 2) router.replace("/register/personal"); }, [flow.step, router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await flow.next()) router.push("/register/security");
  }
  function back() { flow.back(); router.push("/register/personal"); }
  return <RegistrationRouteFrame step={2}><RegistrationRouteMessage message={flow.message} /><AccountInformationStep values={flow.values.account} errors={flow.errors} isLoadingQuestions={flow.isLoadingQuestions} onChange={(field, value) => flow.updateSection("account", field, value)} onSubmit={submit} onBack={back} /></RegistrationRouteFrame>;
}
