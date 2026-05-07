"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ProfileView from "../../../components/profile/ProfileView";
import { getSupabaseClient } from "../../../lib/supabase";
import { Profile } from "../../../types/profile";

const defaultProfile: Profile = {
  id: "preview-member",
  username: "new-wanderer",
  displayName: "New Wanderer",
  status: "New signal detected.",
  bio: "A new member profile for The Forest.",
  socialHandle: "",
  avatarUrl: "/images/profile-avatar.svg",
  bannerUrl: "/images/profile-banner-placeholder.svg",
  themeMode: "nox",
  points: 0,
  isCreator: false,
  membership: {
    tier: "free",
    memberSince: "Today",
    cardId: "PENDING",
  },
  stats: {
    posts: 0,
    clips: 0,
    supporters: 0,
  },
  schedule: [],
};

export default function CreateAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(defaultProfile.displayName);
  const [username, setUsername] = useState(defaultProfile.username);
  const [status, setStatus] = useState(defaultProfile.status);
  const [bio, setBio] = useState(defaultProfile.bio);
  const [socialHandle, setSocialHandle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = email.trim().toLowerCase();
  const passwordRules = getPasswordRules(password);
  const passwordIsValid = passwordRules.every((rule) => rule.valid);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const canSubmit =
    emailIsValid &&
    normalizedUsername.length >= 3 &&
    passwordIsValid;

  const previewProfile = useMemo<Profile>(
    () => ({
      ...defaultProfile,
      displayName,
      username: normalizedUsername,
      status,
      bio,
      socialHandle,
      membership: {
        ...defaultProfile.membership,
        cardId: `WANDER-${normalizedUsername.slice(0, 4).toUpperCase() || "0001"}`,
      },
    }),
    [bio, displayName, normalizedUsername, socialHandle, status]
  );

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setErrorMessage("");
    setStatusMessage("");

    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            username: normalizedUsername,
            display_name: displayName.trim(),
            status: status.trim(),
            bio: bio.trim(),
            social_handle: socialHandle.trim(),
            theme_mode: previewProfile.themeMode,
          },
        },
      });

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      if (data.session) {
        setStatusMessage("Account created. Welcome to The Forest.");
        router.push("/profile");
        return;
      }

      setPendingEmail(normalizedEmail);
      setStatusMessage(
        "Account created. Check your email for the verification code, then enter it below."
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? getFriendlyAuthError(error.message)
          : "Unable to create the account right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!pendingEmail || verificationCode.length !== 6) {
      setErrorMessage("Enter the six-digit code from your email.");
      return;
    }

    setIsVerifying(true);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: verificationCode,
        type: "signup",
      });

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      setStatusMessage("Email verified. Welcome to The Forest.");
      router.push("/profile");
    } catch {
      setErrorMessage("Unable to verify the code right now.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/login"
              className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
            >
              Back to Login
            </Link>
            <Link className="hub-nav-link" href="/hub">
              Hub
            </Link>
          </nav>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <section className="h-fit rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
                Join
              </p>
              <h1 className="mt-3 text-3xl font-black text-white">
                Create Member Profile
              </h1>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Join The Forest with a verified email, secure password, and
                member profile.
              </p>

              <form
                className="mt-6 grid gap-4"
                onSubmit={handleCreateAccount}
              >
                <ProfileField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  message={getEmailMessage(email, emailIsValid)}
                  isInvalid={Boolean(email) && !emailIsValid}
                />
                <ProfileField
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  autoComplete="username"
                  maxLength={32}
                  message={getUsernameMessage(normalizedUsername)}
                  isInvalid={normalizedUsername.length < 3}
                />
                <ProfileField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  isInvalid={Boolean(password) && !passwordIsValid}
                />
                <PasswordChecklist rules={passwordRules} />
                <ProfileField
                  label="Display Name"
                  value={displayName}
                  onChange={setDisplayName}
                  maxLength={80}
                />
                <ProfileField
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  maxLength={160}
                />
                <ProfileField
                  label="Social Handle"
                  value={socialHandle}
                  onChange={setSocialHandle}
                  maxLength={80}
                />
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Bio
                  </span>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={1000}
                    rows={5}
                    className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="inline-flex justify-center rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>

                {submitted && !canSubmit && (
                  <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
                    Finish the required fields before creating an account.
                  </p>
                )}

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

              {pendingEmail && (
                <form
                  className="mt-5 rounded-[8px] border border-blue-400/20 bg-black/30 p-4"
                  onSubmit={handleVerifyCode}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300/75">
                    Email Verification
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    Enter the six-digit code sent to {pendingEmail}.
                  </p>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={verificationCode}
                    maxLength={6}
                    onChange={(event) =>
                      setVerificationCode(
                        event.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    className="mt-4 w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xl font-black tracking-[0.35em] text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
                    placeholder="000000"
                  />
                  <button
                    type="submit"
                    disabled={verificationCode.length !== 6 || isVerifying}
                    className="mt-4 inline-flex w-full justify-center rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
                  >
                    {isVerifying ? "Verifying..." : "Verify Email"}
                  </button>
                </form>
              )}
            </section>

            <div className="overflow-hidden rounded-[8px] border border-white/10">
              <ProfileView profile={previewProfile} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  message,
  isInvalid = false,
  maxLength,
}: {
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  message?: string;
  isInvalid?: boolean;
  maxLength?: number;
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
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-[8px] border bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45 ${
          isInvalid ? "border-red-400/55" : "border-white/10"
        }`}
      />
      {message && (
        <p
          className={`mt-2 text-xs ${
            isInvalid ? "text-red-200" : "text-zinc-500"
          }`}
        >
          {message}
        </p>
      )}
    </label>
  );
}

function PasswordChecklist({
  rules,
}: {
  rules: { label: string; valid: boolean }[];
}) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-black/30 p-3">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        Password Rules
      </p>
      <div className="mt-3 grid gap-2">
        {rules.map((rule) => (
          <p
            key={rule.label}
            className={`text-sm ${
              rule.valid ? "text-blue-100" : "text-zinc-500"
            }`}
          >
            {rule.valid ? "Pass" : "Needed"}: {rule.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function getEmailMessage(
  email: string,
  emailIsValid: boolean
) {
  if (!email) return "Email will be checked before account creation.";
  if (!emailIsValid) return "Enter a valid email address.";
  return "Email format is valid. Supabase will confirm availability.";
}

function getUsernameMessage(username: string) {
  if (username.length < 3) return "Username needs at least 3 characters.";
  return "Username format is valid. Supabase will confirm availability.";
}

function getPasswordRules(password: string) {
  const numberMatches = password.match(/\d/g) ?? [];

  return [
    {
      label: "At least one capital letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least two numbers",
      valid: numberMatches.length >= 2,
    },
    {
      label: "At least one symbol",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function normalizeUsername(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "new-wanderer"
  );
}

function getFriendlyAuthError(message: string) {
  if (message.toLowerCase().includes("already")) {
    return "That email or username may already be in use.";
  }

  if (message.toLowerCase().includes("invalid")) {
    return "That verification code is not valid.";
  }

  if (message.toLowerCase().includes("expired")) {
    return "That verification code has expired. Please request a new one.";
  }

  return message;
}
