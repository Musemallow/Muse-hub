"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../lib/supabase";

const rememberedEmailKey = "musehub-remembered-email";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);

      if (rememberedEmail) {
        setEmail(rememberedEmail);
      }
    } catch {
      return;
    }
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      try {
        if (rememberEmail) {
          window.localStorage.setItem(rememberedEmailKey, email.trim());
        } else {
          window.localStorage.removeItem(rememberedEmailKey);
        }
      } catch {
        return;
      }

      setStatusMessage("Login successful. Returning to the hub.");
      router.push("/hub");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to log in right now. Check Supabase configuration."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/hub"
              className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
            >
              Back to Hub
            </Link>
            <Link className="hub-nav-link" href="/join/create">
              Join
            </Link>
          </nav>

          <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
              Member Access
            </p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              Login
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
              Sign in to comment, manage your profile, and use your member
              card. Account creation is separated into the join flow.
            </p>

            <form
              className="mt-7 grid gap-4"
              onSubmit={handleLogin}
            >
              <AuthField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
              />
              <AuthField
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <label className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => setRememberEmail(event.target.checked)}
                  className="h-4 w-4 accent-blue-500"
                />
                Remember my email on this device
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100 transition hover:border-blue-200 hover:bg-blue-500/25"
              >
                {isSubmitting ? "Checking Signal..." : "Login"}
              </button>

              {errorMessage && (
                <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
                  {errorMessage}
                </p>
              )}

              {statusMessage && (
                <p className="rounded-[8px] border border-blue-400/25 bg-blue-500/10 p-3 text-sm leading-6 text-blue-100">
                  {statusMessage}
                </p>
              )}
            </form>

            <div className="mt-6 rounded-[8px] border border-white/10 bg-black/35 p-4">
              <p className="text-sm text-zinc-400">New to MuseHub?</p>
              <Link
                href="/join/create"
                className="mt-3 inline-flex rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/45 hover:text-blue-100"
              >
                Create an account
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
      />
    </label>
  );
}
