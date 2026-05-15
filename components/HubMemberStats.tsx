"use client";

import { useEffect, useState } from "react";
import { getCurrentProfileFromSupabase } from "../lib/profiles";
import { Profile } from "../types/profile";

type HubMemberStatsProps = {
  nextEventValue: string;
};

export default function HubMemberStats({ nextEventValue }: HubMemberStatsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const currentProfile = await getCurrentProfileFromSupabase();

        if (isMounted) {
          setProfile(currentProfile);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const membershipLabel = profile
    ? getMembershipTierLabel(profile.membership.tier)
    : "Guest";
  const pointsValue = profile ? String(profile.points) : "0";

  return (
    <div className="grid gap-3 rounded-[8px] border border-blue-400/15 bg-black/60 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-1">
      <HubStat label="Membership" value={membershipLabel} />
      <HubStat label="Sync Points" value={pointsValue} />
      <HubStat label="Next Event" value={nextEventValue} />
    </div>
  );
}

function HubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold capitalize text-white">{value}</p>
    </div>
  );
}

function getMembershipTierLabel(tier: Profile["membership"]["tier"]) {
  if (tier === "tier_1") return "Witness";
  if (tier === "tier_2") return "Signal Infected";
  if (tier === "tier_3") return "Anomaly";
  return "Wanderer";
}
