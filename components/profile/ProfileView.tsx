import Link from "next/link";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import ProfileTabs from "./ProfileTabs";
import { Profile } from "../../types/profile";

type ProfileViewProps = {
  profile: Profile;
  onEdit?: () => void;
  onClaimDailyCheckin?: () => void;
  isClaimingDailyCheckin?: boolean;
};

export default function ProfileView({
  profile,
  onEdit,
  onClaimDailyCheckin,
  isClaimingDailyCheckin = false,
}: ProfileViewProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_30%),linear-gradient(to_bottom,#020309,#080b12,#020309)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-blue-400/15 bg-black/45 px-4 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>

          <div className="flex flex-wrap gap-2">
            <Link className="hub-nav-link" href="/events">
              Schedule
            </Link>
            <Link className="hub-nav-link" href="/discussions">
              Discussions
            </Link>
            <Link className="hub-nav-link" href="/store">
              Store
            </Link>
            <Link className="hub-nav-link" href="/profile">
              Profile
            </Link>
            <Link className="hub-nav-link" href="/login">
              Login
            </Link>
          </div>
        </nav>

        <ProfileHeader profile={profile} onEdit={onEdit} />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.75fr]">
          <div>
            <ProfileTabs profileId={profile.id} />
          </div>

          <div>
            <ProfileSidebar
              profile={profile}
              onClaimDailyCheckin={onClaimDailyCheckin}
              isClaimingDailyCheckin={isClaimingDailyCheckin}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
