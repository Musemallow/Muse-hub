"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ProfileView from "../../components/profile/ProfileView";
import { claimDailyCheckin } from "../../lib/economy";
import {
  getCurrentProfileFromSupabase,
  updateCurrentProfileInSupabase,
} from "../../lib/profiles";
import { Profile } from "../../types/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClaimingDailyCheckin, setIsClaimingDailyCheckin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let hasAuthEvent = false;

    async function loadProfile(userId?: string) {
      try {
        const { getSupabaseClient } = await import("../../lib/supabase");
        const supabase = getSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const activeUserId = userId ?? session?.user.id;

        if (!isMounted) return;

        setIsLoggedIn(Boolean(activeUserId));

        if (!activeUserId) {
          setProfile(null);
          setProfileError("");
          setIsLoading(false);
          return;
        }

        const currentProfile = await getCurrentProfileFromSupabase();

        if (!isMounted) return;

        setProfile(currentProfile);
        setProfileError(currentProfile ? "" : "Your account is logged in, but the profile row is not ready yet. Run the Supabase profile SQL, then refresh.");
      } catch (error) {
        if (!isMounted) return;

        setProfile(null);
        setProfileError(
          error instanceof Error
            ? getFriendlyProfileError(error.message)
            : "Unable to load your profile right now."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    async function subscribeToAuth() {
      const { getSupabaseClient } = await import("../../lib/supabase");
      const supabase = getSupabaseClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;

        hasAuthEvent = true;
        setIsLoading(true);
        setIsLoggedIn(Boolean(session?.user));

        if (!session?.user) {
          setProfile(null);
          setProfileError("");
          setIsLoading(false);
          return;
        }

        loadProfile(session.user.id);
      });

      setTimeout(() => {
        if (isMounted && !hasAuthEvent) {
          loadProfile();
        }
      }, 250);

      return subscription;
    }

    let subscription: { unsubscribe: () => void } | null = null;
    subscribeToAuth().then((authSubscription) => {
      subscription = authSubscription;
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  async function handleSaveProfile(updatedProfile: Profile) {
    setSaveError("");

    try {
      const savedProfile = await updateCurrentProfileInSupabase(updatedProfile);
      setProfile(savedProfile);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save profile changes right now.";
      setSaveError(message);
    }

    return false;
  }

  async function handleClaimDailyCheckin() {
    if (!profile) return;

    setSaveError("");
    setIsClaimingDailyCheckin(true);

    try {
      await claimDailyCheckin();
      const refreshedProfile = await getCurrentProfileFromSupabase();
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
    } catch {
      setSaveError("Daily check-in unlocks after the alpha economy tables are live.");
    } finally {
      setIsClaimingDailyCheckin(false);
    }
  }

  if (isLoading) {
    return <ProfileAccessMessage body="Loading your profile..." />;
  }

  if (!profile) {
    if (isLoggedIn) {
      return (
        <ProfileAccessMessage
          title="Profile not ready"
          body={
            profileError ||
            "You are logged in, but your profile is not ready yet. Refresh in a moment or run the Supabase profile SQL."
          }
          showLogin
        />
      );
    }

    return (
      <ProfileAccessMessage
        title="You're not logged in"
        body="Log in or join The Forest to view your member profile, membership card, and account details."
        showLogin
      />
    );
  }

  return (
    <>
      <ProfileView
        profile={profile}
        isCurrentUser
        onEdit={() => setIsEditOpen(true)}
        onClaimDailyCheckin={handleClaimDailyCheckin}
        isClaimingDailyCheckin={isClaimingDailyCheckin}
      />

      {saveError && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-[8px] border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          {saveError}
        </div>
      )}

      <EditProfileModal
        isOpen={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

function getFriendlyProfileError(message: string) {
  if (
    message.includes("schema cache") ||
    message.includes("birthdate") ||
    message.includes("social_links")
  ) {
    return "You are logged in, but the live database is missing the latest profile columns. Run security-hardening.sql in Supabase, then refresh.";
  }

  return message;
}

function ProfileAccessMessage({
  body,
  title = "Member Access",
  showLogin = false,
}: {
  body: string;
  title?: string;
  showLogin?: boolean;
}) {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>
          <Link className="hub-nav-link" href="/login">
            Login
          </Link>
        </nav>

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{body}</p>

          {showLogin && (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100"
              >
                Login
              </Link>
              <Link
                href="/join/create"
                className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white"
              >
                Join
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
