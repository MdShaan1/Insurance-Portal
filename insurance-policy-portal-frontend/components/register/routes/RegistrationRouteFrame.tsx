"use client";

import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const titles = ["Personal", "Account", "Security", "Contact"];

export default function RegistrationRouteFrame({ step, children }: { step: 1 | 2 | 3 | 4; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-gray-600">Register to access your insurance policy information.</p>
          </header>
          <div className="mb-8">
            <div className="mb-3 flex justify-between text-sm text-gray-600">
              <span>Step {step} of 4</span><span>{Math.round((step / 4) * 100)}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Registration progress">
              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-4 text-center text-sm font-semibold">
              {titles.map((title, index) => <span key={title} className={step === index + 1 ? "text-blue-600" : "text-gray-500"}>{title}</span>)}
            </div>
          </div>
          {children}
          <p className="mt-6 text-center text-sm text-gray-600">Already have an account? <a href="/login" className="font-semibold text-blue-600 hover:underline">Sign in</a></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
