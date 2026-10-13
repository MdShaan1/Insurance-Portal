"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PersonalInformationStep from "@/components/register/PersonalInformationStep";
import AccountInformationStep from "@/components/register/AccountInformationStep";
import SecurityInformationStep from "@/components/register/SecurityInformationStep";
import ContactInformationStep from "@/components/register/ContactInformationStep";
import { useRegistration } from "@/src/hooks/useRegistration";

export default function RegisterPage() {
  const registration = useRegistration();

  const {
    step,
    values,
    errors,
    message,
    questionLabels,
    isVerifying,
    isRegistering,
    isLoadingQuestions,
    success,
    updateSection,
    next,
    back,
    submitRegistration,
  } = registration;

  function handleNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    next();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitRegistration();
  }

  const stepTitles = ["Personal", "Account", "Security", "Contact"];

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-gray-600">
              Register to access your insurance policy information.
            </p>
          </header>

          {!success ? (
            <>
              {/* Registration progress */}
              <div className="mb-8">
                <div className="mb-3 flex justify-between text-sm text-gray-600">
                  <span>Step {step} of 4</span>
                  <span>{Math.round((step / 4) * 100)}% complete</span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-gray-200"
                  role="progressbar"
                  aria-valuenow={step}
                  aria-valuemin={1}
                  aria-valuemax={4}
                  aria-label="Registration progress"
                >
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>

                {/* Show all four step labels */}
                <div className="mt-3 grid grid-cols-4 text-center text-sm font-semibold">
                  {stepTitles.map((title, index) => (
                    <span
                      key={title}
                      className={
                        step === index + 1
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>

              {/* General error or status message */}
              {message && (
                <div
                  role="alert"
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {message}
                </div>
              )}

              {/* Step 1: Personal information */}
              {step === 1 && (
                <PersonalInformationStep
                  values={values.personal}
                  errors={errors}
                  isSubmitting={isVerifying}
                  onChange={(field, value) =>
                    updateSection("personal", field, value)
                  }
                  onSubmit={handleNext}
                />
              )}

              {/* Step 2: Account information */}
              {step === 2 && (
                <AccountInformationStep
                  values={values.account}
                  errors={errors}
                  isLoadingQuestions={isLoadingQuestions}
                  onChange={(field, value) =>
                    updateSection("account", field, value)
                  }
                  onSubmit={handleNext}
                  onBack={back}
                />
              )}

              {/* Step 3: Security information */}
              {step === 3 &&
                (questionLabels ? (
                  <SecurityInformationStep
                    values={values.security}
                    questionLabels={questionLabels}
                    errors={errors}
                    onChange={(field, value) =>
                      updateSection("security", field, value)
                    }
                    onSubmit={handleNext}
                    onBack={back}
                  />
                ) : (
                  <div
                    role="alert"
                    className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                  >
                    Security questions are not available yet. Please go back
                    and try again.
                    <button
                      type="button"
                      onClick={back}
                      className="ml-2 font-semibold underline"
                    >
                      Go back
                    </button>
                  </div>
                ))}

              {/* Step 4: Contact information */}
              {step === 4 && (
                <ContactInformationStep
                  values={values.contact}
                  errors={errors}
                  isSubmitting={isRegistering}
                  onChange={(field, value) =>
                    updateSection("contact", field, value)
                  }
                  onSubmit={handleSubmit}
                  onBack={back}
                />
              )}
            </>
          ) : (
            /* Registration success */
            <section
              className="rounded-2xl bg-white p-10 text-center shadow-lg"
              role="status"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Registration Successful
              </h2>

              <p className="mt-3 text-gray-600">
                Your account has been created successfully. You can now sign
                in to access your policy information.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Go to Login
              </Link>
            </section>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}