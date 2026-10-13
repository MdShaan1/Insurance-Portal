"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRegistrationFlow } from "@/src/hooks/RegistrationFlowProvider";

export default function RegistrationSuccessPage() {
  const flow = useRegistrationFlow();
  const router = useRouter();
  useEffect(() => { if (!flow.success) router.replace("/register/personal"); }, [flow.success, router]);
  if (!flow.success) return null;
  return <><Header /><main className="min-h-screen bg-gray-50 px-4 py-12"><section className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-lg" role="status"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">✓</div><h1 className="text-2xl font-bold text-gray-900">Registration Successful</h1><p className="mt-3 text-gray-600">Your account has been created successfully. You can now sign in to access your policy information.</p><Link href="/login" className="mt-7 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700">Go to Login</Link></section></main><Footer /></>;
}
