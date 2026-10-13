"use client";

import type { FormEvent } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegistrationFlow } from "@/src/hooks/RegistrationFlowProvider";
import SecurityInformationStep from "@/components/register/SecurityInformationStep";
import RegistrationRouteFrame from "@/components/register/routes/RegistrationRouteFrame";
import RegistrationRouteMessage from "@/components/register/routes/RegistrationRouteMessage";

export default function SecurityRegistrationPage() {
  const flow = useRegistrationFlow();
  const router = useRouter();
  useEffect(() => { if (flow.step < 3) router.replace(flow.step < 2 ? "/register/personal" : "/register/account"); }, [flow.step, router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await flow.next()) router.push("/register/contact");
  }
  function back() { flow.back(); router.push("/register/account"); }
  return <RegistrationRouteFrame step={3}><RegistrationRouteMessage message={flow.message} />{flow.questionLabels ? <SecurityInformationStep values={flow.values.security} questionLabels={flow.questionLabels} errors={flow.errors} onChange={(field, value) => flow.updateSection("security", field, value)} onSubmit={submit} onBack={back} /> : <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Security questions are not available. Please return to personal information and verify your policyholder details again.<button type="button" className="ml-2 font-semibold underline" onClick={() => router.push("/register/personal")}>Go back</button></div>}</RegistrationRouteFrame>;
}
