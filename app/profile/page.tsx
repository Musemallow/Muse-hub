import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import ProfileTabs from "../../components/profile/ProfileTabs";
import { mockProfile } from "../../data/mockProfile";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(0,180,255,0.12),transparent_30%),linear-gradient(to_bottom,#05070b,#090d14,#05070b)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ProfileHeader profile={mockProfile} />

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.75fr]">
          <div>
            <ProfileTabs />
          </div>

          <div>
            <ProfileSidebar profile={mockProfile} />
          </div>
        </div>
      </div>
    </main>
  );
}