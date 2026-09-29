"use client";

import Link from "next/link";
import { useState } from "react";
import {
  verifyPolicyholder,
  signUp,
  type RegistrationRequest,
  type PolicyholderVerificationRequest,
} from "@/src/lib/api";

type Step =
  | "personal"
  | "account"
  | "security"
  | "contact"
  | "success";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("personal");

  const [personal, setPersonal] =
    useState<PolicyholderVerificationRequest>({
      ssn: "",
      policyNumber: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      zipCode: "",
    });

  const [account, setAccount] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [security, setSecurity] = useState({
    petName: "",
    childhoodFriendName: "",
  });

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    streetAddress: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [error, setError] = useState("");
  const [, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError("");
    setMessage("");

    if (
      !personal.ssn ||
      !personal.policyNumber ||
      !personal.firstName ||
      !personal.lastName ||
      !personal.dateOfBirth ||
      !personal.zipCode
    ) {
      setError("Please complete all policyholder fields.");
      return;
    }

    try {
      setLoading(true);

      await verifyPolicyholder({
        ...personal,
        ssn: personal.ssn.trim(),
        policyNumber: personal.policyNumber.trim(),
        firstName: personal.firstName.trim(),
        lastName: personal.lastName.trim(),
        dateOfBirth: personal.dateOfBirth.trim(),
        zipCode: personal.zipCode.trim(),
      });

      setStep("account");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Policyholder verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAccountContinue() {
    setError("");

    if (
      !account.username ||
      !account.password ||
      !account.confirmPassword
    ) {
      setError("Please complete all account fields.");
      return;
    }

    if (account.password !== account.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (account.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(account.password)) {
      setError(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(account.password)) {
      setError(
        "Password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(account.password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    setStep("security");
  }

  function handleSecurityContinue() {
    setError("");

    if (
      !security.petName ||
      !security.childhoodFriendName
    ) {
      setError("Please answer both security questions.");
      return;
    }

    setStep("contact");
  }

  async function handleCreateAccount() {
    setError("");
    setMessage("");

    if (
      !contact.email ||
      !contact.phone ||
      !contact.streetAddress ||
      !contact.city ||
      !contact.state ||
      !contact.zipCode ||
      !contact.country
    ) {
      setError("Please complete all required contact fields.");
      return;
    }

    const registrationData: RegistrationRequest = {
      personalInformation: {
        ...personal,
      },

      accountInformation: {
        ...account,
      },

      securityInformation: {
        ...security,
      },

      contactInformation: {
        ...contact,
      },
    };

    try {
      setLoading(true);

      await signUp(registrationData);

      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <Header active="register" />

        <section className="flex min-h-[75vh] items-center justify-center px-6 py-14">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-3xl font-bold text-slate-900">
              Registration Successful
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              Your policyholder account has been created
              successfully. You can now sign in using your
              username and password.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </Link>

            <div className="mt-5">
              <Link
                href="/"
                className="text-sm font-medium text-slate-500 hover:text-blue-600"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header active="register" />

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* Page heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-7 w-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 003.142-1.4 4.5 4.5 0 00-8.284 0A9.38 9.38 0 0015 19.128z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Create Your Account
          </h2>

          <p className="mt-2 text-slate-600">
            Register securely using your existing policy information.
          </p>
        </div>

        {/* Progress */}
        <ProgressBar step={step} />

        {/* Error */}
        {error && (
          <div className="mx-auto mb-6 max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">
              {error}
            </p>
          </div>
        )}

        {/* Form card */}
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          {step === "personal" && (
            <PersonalStep
              personal={personal}
              setPersonal={setPersonal}
              onContinue={handleVerify}
              loading={loading}
            />
          )}

          {step === "account" && (
            <AccountStep
              account={account}
              setAccount={setAccount}
              onBack={() => setStep("personal")}
              onContinue={handleAccountContinue}
            />
          )}

          {step === "security" && (
            <SecurityStep
              security={security}
              setSecurity={setSecurity}
              onBack={() => setStep("account")}
              onContinue={handleSecurityContinue}
            />
          )}

          {step === "contact" && (
            <ContactStep
              contact={contact}
              setContact={setContact}
              onBack={() => setStep("security")}
              onSubmit={handleCreateAccount}
              loading={loading}
            />
          )}
        </div>

        {/* Login shortcut */}
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm text-slate-600">
            Already have a policyholder account?
          </p>

          <Link
            href="/login"
            className="mt-1 inline-block font-semibold text-blue-600 hover:text-blue-700"
          >
            Login to your account
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* -------------------------------------------------
   HEADER
------------------------------------------------- */

function Header({
  active,
}: {
  active: "register" | "login";
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            IP
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Insurance Policyholder Portal
            </h1>

            <p className="text-xs text-slate-500">
              Secure Policyholder Services
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={
              active === "login"
                ? "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            }
          >
            Login
          </Link>

          <Link
            href="/register"
            className={
              active === "register"
                ? "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            }
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------
   PROGRESS BAR
------------------------------------------------- */

function ProgressBar({
  step,
}: {
  step: Step;
}) {
  const steps = [
    {
      key: "personal",
      label: "Personal",
    },
    {
      key: "account",
      label: "Account",
    },
    {
      key: "security",
      label: "Security",
    },
    {
      key: "contact",
      label: "Contact",
    },
  ];

  const currentIndex = steps.findIndex(
    (item) => item.key === step
  );

  return (
    <div className="mx-auto mb-8 max-w-3xl">
      <div className="flex items-center justify-between">
        {steps.map((item, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={item.key}
              className="flex flex-1 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={
                    completed || active
                      ? "flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
                      : "flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-bold text-slate-500"
                  }
                >
                  {completed ? "✓" : index + 1}
                </div>

                <span
                  className={
                    active
                      ? "mt-2 text-xs font-semibold text-blue-600"
                      : "mt-2 text-xs font-medium text-slate-500"
                  }
                >
                  {item.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={
                    index < currentIndex
                      ? "mx-2 h-0.5 flex-1 bg-blue-600"
                      : "mx-2 h-0.5 flex-1 bg-slate-200"
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------
   PERSONAL STEP
------------------------------------------------- */

function PersonalStep({
  personal,
  setPersonal,
  onContinue,
  loading,
}: {
  personal: PolicyholderVerificationRequest;
  setPersonal: React.Dispatch<
    React.SetStateAction<PolicyholderVerificationRequest>
  >;
  onContinue: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <StepHeading
        title="Verify Your Policy"
        description="Enter your policyholder information exactly as it appears in your policy records."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label="SSN / Last 4 Digits"
          value={personal.ssn}
          onChange={(value) =>
            setPersonal({
              ...personal,
              ssn: value,
            })
          }
          placeholder="Enter last 4 digits"
        />

        <FormField
          label="Policy Number"
          value={personal.policyNumber}
          onChange={(value) =>
            setPersonal({
              ...personal,
              policyNumber: value,
            })
          }
          placeholder="e.g. VA8899001"
        />

        <FormField
          label="First Name"
          value={personal.firstName}
          onChange={(value) =>
            setPersonal({
              ...personal,
              firstName: value,
            })
          }
          placeholder="First name"
        />

        <FormField
          label="Last Name"
          value={personal.lastName}
          onChange={(value) =>
            setPersonal({
              ...personal,
              lastName: value,
            })
          }
          placeholder="Last name"
        />

        <FormField
          label="Date of Birth"
          value={personal.dateOfBirth}
          onChange={(value) =>
            setPersonal({
              ...personal,
              dateOfBirth: value,
            })
          }
          placeholder="MM/DD/YYYY"
        />

        <FormField
          label="ZIP Code"
          value={personal.zipCode}
          onChange={(value) =>
            setPersonal({
              ...personal,
              zipCode: value,
            })
          }
          placeholder="ZIP code"
        />
      </div>

      <button
        onClick={onContinue}
        disabled={loading}
        className="mt-8 w-full rounded-lg bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Verifying..."
          : "Verify Policy & Continue"}
      </button>
    </div>
  );
}

/* -------------------------------------------------
   ACCOUNT STEP
------------------------------------------------- */

function AccountStep({
  account,
  setAccount,
  onBack,
  onContinue,
}: {
  account: {
    username: string;
    password: string;
    confirmPassword: string;
  };
  setAccount: React.Dispatch<
    React.SetStateAction<{
      username: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading
        title="Account Information"
        description="Create the username and password you will use to access the portal."
      />

      <div className="space-y-6">
        <FormField
          label="Username"
          value={account.username}
          onChange={(value) =>
            setAccount({
              ...account,
              username: value,
            })
          }
          placeholder="Choose a username"
        />

        <FormField
          label="Password"
          type="password"
          value={account.password}
          onChange={(value) =>
            setAccount({
              ...account,
              password: value,
            })
          }
          placeholder="Create a password"
        />

        <FormField
          label="Confirm Password"
          type="password"
          value={account.confirmPassword}
          onChange={(value) =>
            setAccount({
              ...account,
              confirmPassword: value,
            })
          }
          placeholder="Re-enter your password"
        />
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">
          Password requirements
        </p>

        <ul className="mt-2 space-y-1 text-sm text-slate-500">
          <li>• At least 8 characters</li>
          <li>• One uppercase letter</li>
          <li>• One lowercase letter</li>
          <li>• One special character</li>
        </ul>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>

        <button
          onClick={onContinue}
          className="w-2/3 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   SECURITY STEP
------------------------------------------------- */

function SecurityStep({
  security,
  setSecurity,
  onBack,
  onContinue,
}: {
  security: {
    petName: string;
    childhoodFriendName: string;
  };
  setSecurity: React.Dispatch<
    React.SetStateAction<{
      petName: string;
      childhoodFriendName: string;
    }>
  >;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeading
        title="Security Information"
        description="Provide answers to your security questions."
      />

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            What is your pet name?
          </label>

          <input
            type="text"
            value={security.petName}
            onChange={(e) =>
              setSecurity({
                ...security,
                petName: e.target.value,
              })
            }
            placeholder="Enter your answer"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            What is your childhood friend&apos;s name?
          </label>

          <input
            type="text"
            value={security.childhoodFriendName}
            onChange={(e) =>
              setSecurity({
                ...security,
                childhoodFriendName: e.target.value,
              })
            }
            placeholder="Enter your answer"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>

        <button
          onClick={onContinue}
          className="w-2/3 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   CONTACT STEP
------------------------------------------------- */

function ContactStep({
  contact,
  setContact,
  onBack,
  onSubmit,
  loading,
}: {
  contact: {
    email: string;
    phone: string;
    streetAddress: string;
    streetAddressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  setContact: React.Dispatch<
    React.SetStateAction<{
      email: string;
      phone: string;
      streetAddress: string;
      streetAddressLine2: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>
  >;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div>
      <StepHeading
        title="Contact Information"
        description="Provide your contact and address information."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label="Email"
          type="email"
          value={contact.email}
          onChange={(value) =>
            setContact({
              ...contact,
              email: value,
            })
          }
          placeholder="you@example.com"
        />

        <FormField
          label="Phone"
          value={contact.phone}
          onChange={(value) =>
            setContact({
              ...contact,
              phone: value,
            })
          }
          placeholder="Phone number"
        />

        <div className="md:col-span-2">
          <FormField
            label="Street Address"
            value={contact.streetAddress}
            onChange={(value) =>
              setContact({
                ...contact,
                streetAddress: value,
              })
            }
            placeholder="Street address"
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Street Address Line 2"
            value={contact.streetAddressLine2}
            onChange={(value) =>
              setContact({
                ...contact,
                streetAddressLine2: value,
              })
            }
            placeholder="Apartment, suite, unit, etc. (optional)"
          />
        </div>

        <FormField
          label="City"
          value={contact.city}
          onChange={(value) =>
            setContact({
              ...contact,
              city: value,
            })
          }
          placeholder="City"
        />

        <FormField
          label="State"
          value={contact.state}
          onChange={(value) =>
            setContact({
              ...contact,
              state: value,
            })
          }
          placeholder="State"
        />

        <FormField
          label="ZIP Code"
          value={contact.zipCode}
          onChange={(value) =>
            setContact({
              ...contact,
              zipCode: value,
            })
          }
          placeholder="ZIP code"
        />

        <FormField
          label="Country"
          value={contact.country}
          onChange={(value) =>
            setContact({
              ...contact,
              country: value,
            })
          }
          placeholder="Country"
        />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="w-1/3 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back
        </button>

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-2/3 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   COMMON COMPONENTS
------------------------------------------------- */

function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
        © 2026 Insurance Policyholder Portal
      </div>
    </footer>
  );
}