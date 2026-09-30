"use client";

import { useState } from "react";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordInput from "@/components/PasswordInput";

import { login } from "@/src/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameTouched, setUsernameTouched] =
    useState(false);

  const [passwordTouched, setPasswordTouched] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const usernameError =
    usernameTouched && !username.trim()
      ? "Please enter Username."
      : "";

  const passwordError =
    passwordTouched && !password
      ? "Please enter Password."
      : "";

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");

    setUsernameTouched(true);
    setPasswordTouched(true);

    if (!username.trim()) {
      return;
    }

    if (!password) {
      return;
    }

    try {
      setIsLoggingIn(true);

      await login({
        username: username.trim(),
        password,
      });

      /*
       * Login API call was successful.
       *
       * JWT/session authentication has not been
       * implemented yet in the current project.
       *
       * For the current demo we redirect to home.
       */
      window.location.href = "/";
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Invalid username or password."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <Header />

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Sign In
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Sign in to access your Insurance Policy
                Portal account.
              </p>
            </div>

            {/* API Error */}
            {errorMessage && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-6"
            >
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Username{" "}
                  <span className="text-red-600">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  onBlur={() =>
                    setUsernameTouched(true)
                  }
                  placeholder="Enter username"
                  autoComplete="username"
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none transition ${
                    usernameError
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />

                {usernameError && (
                  <p className="mt-1 text-sm font-medium text-red-600">
                    {usernameError}
                  </p>
                )}
              </div>

              {/* Password */}
              <PasswordInput
                label="Password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                onBlur={() =>
                  setPasswordTouched(true)
                }
                placeholder="Enter password"
                required
                error={passwordError}
              />

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn
                  ? "Signing In..."
                  : "Sign In"}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}