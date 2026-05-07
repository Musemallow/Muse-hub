"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ProfileView from "../../components/profile/ProfileView";
import { getCurrentProfileFromSupabase } from "../../lib/profiles";
import { Profile } from "../../types/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const currentProfile = await getCurrentProfileFromSupabase();

        if (!isMounted) return;

        setProfile(currentProfile);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your profile."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSaveProfile(updatedProfile: Profile) {
    setProfile(updatedProfile);
  }

  if (isLoading) {
    return <ProfileAccessMessage body="Loading your profile..." />;
  }

  if (!profile) {
    return (
      <ProfileAccessMessage
        body={
          errorMessage ||
          "Log in to view your member profile, membership card, and account details."
        }
        showLogin
      />
    );
  }

  return (
    <>
      <ProfileView profile={profile} onEdit={() => setIsEditOpen(true)} />

      <EditProfileModal
        isOpen={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

function ProfileAccessMessage({
  body,
  showLogin = false,
}: {
  body: string;
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
            Member Access
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
