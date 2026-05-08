import { getSupabaseClient } from "./supabase";

export async function claimDailyCheckin() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("claim_daily_checkin");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? 0;
}
