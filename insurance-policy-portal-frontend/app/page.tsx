import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Secure Insurance Policy Management
            </div>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Manage Your Insurance
              <span className="block text-blue-600">
                Policy With Ease
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Access your insurance policy information,
              manage your account, and securely stay
              connected with your policy details through
              the Insurance Policy Portal.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-7 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Hero Card */}
          <div className="rounded-3xl bg-blue-600 p-8 shadow-xl">
            <div className="rounded-2xl bg-white p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Insurance Policy Portal
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    Your Policy
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl font-bold text-blue-600">
                    ✓
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Policy Status
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    Active
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Policy Number
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      Protected
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Account
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      Secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need in One Place
            </h2>

            <p className="mt-4 text-gray-600">
              The portal provides a secure and convenient
              way for existing policyholders to create and
              access their accounts.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-xl text-blue-600">
                  ✓
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Secure Registration
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Registration is available only to
                existing policyholders whose information
                matches the policy records.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <span className="text-xl text-green-600">
                  🔒
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Protected Account
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Passwords are securely hashed before they
                are stored by the backend.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-white p-7 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-xl text-purple-600">
                  ◉
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Easy Access
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Sign in to your portal account and access
                your insurance-related information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Already Have an Insurance Policy?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Create your Customer Portal account by
            verifying your existing policy information.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Register Now
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}