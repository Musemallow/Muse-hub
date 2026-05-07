import { notFound } from "next/navigation";
import ProfileView from "../../../components/profile/ProfileView";
import { getProfileByUsernameFromSupabase } from "../../../lib/profiles";

type UserProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export const dynamic = "force-dynamic";

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
    return await getProfileByUsernameFromSupabase(username);
  } catch {
    return null;
  }
}
