import { notFound } from "next/navigation";
import ProfileView from "../../../components/profile/ProfileView";
import {
  getProfileByUsername,
  mockProfiles,
} from "../../../data/mockProfiles";
import { getProfileByUsernameFromSupabase } from "../../../lib/profiles";

type UserProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return mockProfiles.map((profile) => ({
    username: profile.username,
  }));
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;
  const profile = await loadProfile(username);

  if (!profile) {
    notFound();
  }

  return <ProfileView profile={profile} />;
}

async function loadProfile(username: string) {
  try {
    return (
      (await getProfileByUsernameFromSupabase(username)) ??
      getProfileByUsername(username)
    );
  } catch {
    return getProfileByUsername(username);
  }
}
