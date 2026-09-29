import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
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
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side */}
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Secure Policyholder Access
            </div>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Manage your insurance policy with confidence.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Access your policyholder account, securely register your
              account, and manage your insurance information through one
              convenient portal.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="lg:pl-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.5 12l1.7 1.7 3.5-3.5"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-slate-900">
                  Secure Account Access
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Register using your existing policy information or sign in
                  if you already have an account.
                </p>
              </div>

              <div className="space-y-5">
                <Feature
                  number="01"
                  title="Verify Policy"
                  description="Confirm your policyholder information."
                />

                <Feature
                  number="02"
                  title="Create Account"
                  description="Set up your secure portal credentials."
                />

                <Feature
                  number="03"
                  title="Access Portal"
                  description="Sign in to your policyholder account."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Insurance Policyholder Portal</p>

          <div className="flex gap-5">
            <Link
              href="/register"
              className="hover:text-blue-600"
            >
              Register
            </Link>

            <Link
              href="/login"
              className="hover:text-blue-600"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
        {number}
      </div>

      <div>
        <h4 className="font-semibold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}