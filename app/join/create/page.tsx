"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { uploadProfileMedia } from "../../../lib/profileMedia";
import { getSupabaseClient } from "../../../lib/supabase";
import { Profile } from "../../../types/profile";

type JoinStep = "account" | "verify" | "birthdate" | "identity" | "done";

const defaultProfile: Profile = {
  id: "preview-member",
  username: "new-wanderer",
  displayName: "New Wanderer",
  status: "New signal detected.",
  bio: "",
  socialHandle: "",
  socialLinks: {},
  birthdate: "",
  showBirthdate: false,
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
  const [step, setStep] = useState<JoinStep>("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(defaultProfile.username);
  const [verificationCode, setVerificationCode] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [showBirthdate, setShowBirthdate] = useState(false);
  const [displayName, setDisplayName] = useState(defaultProfile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(defaultProfile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(defaultProfile.bannerUrl);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const normalizedUsername = normalizeUsername(username);
  const normalizedEmail = email.trim().toLowerCase();
  const passwordRules = getPasswordRules(password);
  const passwordIsValid = passwordRules.every((rule) => rule.valid);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const accountIsValid =
    emailIsValid && normalizedUsername.length >= 3 && passwordIsValid;

  const previewProfile = useMemo<Profile>(
    () => ({
      ...defaultProfile,
      username: normalizedUsername,
      displayName: displayName.trim() || "New Wanderer",
      birthdate,
      showBirthdate,
      avatarUrl: avatarUrl.trim() || defaultProfile.avatarUrl,
      bannerUrl: bannerUrl.trim() || defaultProfile.bannerUrl,
      membership: {
        ...defaultProfile.membership,
        cardId: `WANDER-${normalizedUsername.slice(0, 4).toUpperCase() || "0001"}`,
      },
    }),
    [avatarUrl, bannerUrl, birthdate, displayName, normalizedUsername, showBirthdate]
  );

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!accountIsValid) {
      setErrorMessage("Finish the required account fields first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/join/create`,
          data: {
            username: normalizedUsername,
            display_name: displayName.trim() || "New Wanderer",
            status: defaultProfile.status,
            bio: "",
            social_handle: "",
            theme_mode: defaultProfile.themeMode,
          },
        },
      });

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      if (data.session) {
        setStep("birthdate");
        setStatusMessage("Account verified. Continue your profile setup.");
        return;
      }

      setStep("verify");
      setStatusMessage("Check your email for the six-digit verification code.");
    } catch {
      setErrorMessage("Unable to create the account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (verificationCode.length !== 6) {
      setErrorMessage("Enter the six-digit code from your email.");
      return;
    }

    setIsVerifying(true);

    try {
      const supabase = getSupabaseClient();
      const emailOtpResult = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: verificationCode,
        type: "email",
      });
      const signupOtpResult = emailOtpResult.error
        ? await supabase.auth.verifyOtp({
            email: normalizedEmail,
            token: verificationCode,
            type: "signup",
          })
        : null;
      const error = emailOtpResult.error ? signupOtpResult?.error : null;

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      setStep("birthdate");
      setStatusMessage("Email verified. Continue your profile setup.");
    } catch {
      setErrorMessage("Unable to verify the code right now.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleFinishProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setIsSavingProfile(true);

    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Log in again to finish your profile.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || "New Wanderer",
          birthdate: birthdate || null,
          show_birthdate: showBirthdate,
          avatar_url: avatarUrl.trim() || defaultProfile.avatarUrl,
          banner_url: bannerUrl.trim() || defaultProfile.bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setErrorMessage(getFriendlyAuthError(error.message));
        return;
      }

      setStep("done");
      setStatusMessage("Profile setup complete. Welcome to The Forest.");
      router.refresh();
    } catch {
      setErrorMessage("Unable to save your profile right now.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleProfileMediaUpload(
    file: File | undefined,
    kind: "avatar" | "banner"
  ) {
    if (!file) return;

    setErrorMessage("");

    if (kind === "avatar") {
      setIsUploadingAvatar(true);
    } else {
      setIsUploadingBanner(true);
    }

    try {
      const publicUrl = await uploadProfileMedia(file, kind);
      if (kind === "avatar") {
        setAvatarUrl(publicUrl);
      } else {
        setBannerUrl(publicUrl);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload image."
      );
    } finally {
      if (kind === "avatar") {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
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

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Join The Forest
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            {getStepTitle(step)}
          </h1>
          <StepTracker step={step} />

          {step === "account" && (
            <form className="mt-6 grid gap-4" onSubmit={handleCreateAccount}>
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
              <PrimaryButton disabled={!accountIsValid || isSubmitting}>
                {isSubmitting ? "Sending Code..." : "Send Verification Email"}
              </PrimaryButton>
            </form>
          )}

          {step === "verify" && (
            <form className="mt-6 grid gap-4" onSubmit={handleVerifyCode}>
              <p className="text-sm leading-7 text-zinc-400">
                Enter the six-digit code sent to {normalizedEmail}.
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
                className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-2xl font-black tracking-[0.35em] text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/45"
                placeholder="000000"
              />
              <PrimaryButton disabled={verificationCode.length !== 6 || isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Email"}
              </PrimaryButton>
            </form>
          )}

          {step === "birthdate" && (
            <div className="mt-6 grid gap-4">
              <ProfileField
                label="Birthdate"
                type="date"
                value={birthdate}
                onChange={setBirthdate}
              />
              <label className="flex items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-white">
                    Show birthdate on profile
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    You can change this later.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={showBirthdate}
                  onChange={(event) => setShowBirthdate(event.target.checked)}
                  className="h-5 w-5 accent-blue-500"
                />
              </label>
              <PrimaryButton onClick={() => setStep("identity")}>
                Continue
              </PrimaryButton>
            </div>
          )}

          {step === "identity" && (
            <form className="mt-6 grid gap-5" onSubmit={handleFinishProfile}>
              <ProfileField
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                maxLength={80}
              />
              <FileField
                label="Profile Picture"
                isUploading={isUploadingAvatar}
                onChange={(file) => handleProfileMediaUpload(file, "avatar")}
              />
              <FileField
                label="Banner"
                isUploading={isUploadingBanner}
                onChange={(file) => handleProfileMediaUpload(file, "banner")}
              />
              <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
                <div className="relative aspect-square overflow-hidden rounded-[8px] border border-blue-300/40 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewProfile.avatarUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="relative aspect-[16/7] overflow-hidden rounded-[8px] border border-white/10 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewProfile.bannerUrl}
                    alt="Banner preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <PrimaryButton disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Finish Profile"}
              </PrimaryButton>
            </form>
          )}

          {step === "done" && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100"
              >
                View Profile
              </Link>
              <Link
                href="/hub"
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white"
              >
                Go to Hub
              </Link>
            </div>
          )}

          {errorMessage && (
            <p className="mt-5 rounded-[8px] border border-red-400/40 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
              {errorMessage}
            </p>
          )}

          {statusMessage && (
            <p className="mt-5 rounded-[8px] border border-blue-400/25 bg-blue-500/10 p-3 text-sm leading-6 text-blue-100">
              {statusMessage}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

function FileField({
  label,
  isUploading,
  onChange,
}: {
  label: string;
  isUploading: boolean;
  onChange: (file: File | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={isUploading}
        onChange={(event) => onChange(event.target.files?.[0])}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-blue-500/15 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-100 disabled:cursor-not-allowed disabled:text-zinc-600"
      />
      <p className="mt-2 text-xs text-zinc-500">
        {isUploading ? "Uploading..." : "JPG, PNG, WEBP, or GIF."}
      </p>
    </label>
  );
}

function StepTracker({ step }: { step: JoinStep }) {
  const steps: { key: JoinStep; label: string }[] = [
    { key: "account", label: "Account" },
    { key: "verify", label: "Verify" },
    { key: "birthdate", label: "Birthdate" },
    { key: "identity", label: "Profile" },
  ];
  const activeIndex = steps.findIndex((item) => item.key === step);

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-4">
      {steps.map((item, index) => (
        <div
          key={item.key}
          className={`rounded-full border px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] ${
            index <= activeIndex
              ? "border-blue-300/40 bg-blue-500/15 text-blue-100"
              : "border-white/10 bg-white/[0.03] text-zinc-600"
          }`}
        >
          {item.label}
        </div>
      ))}
    </div>
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
  type?: "email" | "password" | "text" | "date";
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

function PrimaryButton({
  children,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex justify-center rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
    >
      {children}
    </button>
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

function getStepTitle(step: JoinStep) {
  if (step === "verify") return "Verify Your Email";
  if (step === "birthdate") return "Birthdate Settings";
  if (step === "identity") return "Profile Look";
  if (step === "done") return "Signal Confirmed";
  return "Create Your Account";
}

function getEmailMessage(email: string, emailIsValid: boolean) {
  if (!email) return "Email will be verified before setup continues.";
  if (!emailIsValid) return "Enter a valid email address.";
  return "Email format is valid.";
}

function getUsernameMessage(username: string) {
  if (username.length < 3) return "Username needs at least 3 characters.";
  return "Username format is valid.";
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
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("already")) {
    return "That email or username may already be in use.";
  }

  if (
    lowerMessage.includes("sending confirmation") ||
    lowerMessage.includes("send")
  ) {
    return "MuseHub could not send the verification email yet. Check that Supabase SMTP is saved, the SendPulse sender email is verified, and the SendPulse SMTP profile is approved.";
  }

  if (lowerMessage.includes("invalid")) {
    return "That verification code is not valid.";
  }

  if (lowerMessage.includes("expired")) {
    return "That verification code has expired. Please request a new one.";
  }

  return message;
}
