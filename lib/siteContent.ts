import { storeDrops, upcomingEvents } from "../data/landingContent";
import { Json } from "../types/database";
import { getCurrentProfileFromSupabase } from "./profiles";
import { getSupabaseClient } from "./supabase";

export type EditableStoreDrop = {
  id: string;
  title: string;
  status: string;
  price: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
};

export type EditableEventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
};

export type SiteContent = {
  hero: {
    bannerUrl: string;
    eyebrow: string;
    title: string;
    body: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    storeButtonText: string;
  };
  stats: {
    memberLabel: string;
    memberValue: string;
    pointsLabel: string;
    pointsValue: string;
    nextEventLabel: string;
    nextEventValue: string;
  };
  sections: {
    postsEyebrow: string;
    postsTitle: string;
    scheduleEyebrow: string;
    scheduleTitle: string;
    storeEyebrow: string;
    storeTitle: string;
  };
  events: EditableEventItem[];
  storeDrops: EditableStoreDrop[];
};

export const defaultSiteContent: SiteContent = {
  hero: {
    bannerUrl: "/images/musemallow-banner.jpeg",
    eyebrow: "Welcome to The Forest",
    title: "MuseMallow",
    body: "Current posts, store drops, schedule notes, and member access for the MuseHub community.",
    primaryButtonText: "Latest Posts",
    secondaryButtonText: "Schedule",
    storeButtonText: "Store Drops",
  },
  stats: {
    memberLabel: "Member",
    memberValue: "Anomaly",
    pointsLabel: "Points",
    pointsValue: "1460",
    nextEventLabel: "Next Event",
    nextEventValue: "Sunday / 8 PM",
  },
  sections: {
    postsEyebrow: "Posts",
    postsTitle: "Latest From MuseMallow",
    scheduleEyebrow: "Schedule",
    scheduleTitle: "Coming Up",
    storeEyebrow: "Store",
    storeTitle: "Drops And Perks",
  },
  events: upcomingEvents,
  storeDrops,
};

export async function getSiteContent() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle();

    if (error || !data?.content) {
      return defaultSiteContent;
    }

    return normalizeSiteContent(data.content);
  } catch {
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  const profile = await getCurrentProfileFromSupabase();

  if (!profile?.isCreator) {
    throw new Error("Only the owner profile can edit site content.");
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from("site_content").upsert({
    id: "main",
    content: sanitizeSiteContent(content) as unknown as Json,
    updated_by: profile.id,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(getSiteContentSaveError(error.message));
  }
}

function sanitizeSiteContent(content: SiteContent): SiteContent {
  return {
    hero: {
      bannerUrl: cleanText(content.hero.bannerUrl, 500),
      eyebrow: cleanText(content.hero.eyebrow, 80),
      title: cleanText(content.hero.title, 80),
      body: cleanText(content.hero.body, 400),
      primaryButtonText: cleanText(content.hero.primaryButtonText, 40),
      secondaryButtonText: cleanText(content.hero.secondaryButtonText, 40),
      storeButtonText: cleanText(content.hero.storeButtonText, 40),
    },
    stats: {
      memberLabel: cleanText(content.stats.memberLabel, 40),
      memberValue: cleanText(content.stats.memberValue, 40),
      pointsLabel: cleanText(content.stats.pointsLabel, 40),
      pointsValue: cleanText(content.stats.pointsValue, 40),
      nextEventLabel: cleanText(content.stats.nextEventLabel, 40),
      nextEventValue: cleanText(content.stats.nextEventValue, 60),
    },
    sections: {
      postsEyebrow: cleanText(content.sections.postsEyebrow, 40),
      postsTitle: cleanText(content.sections.postsTitle, 80),
      scheduleEyebrow: cleanText(content.sections.scheduleEyebrow, 40),
      scheduleTitle: cleanText(content.sections.scheduleTitle, 80),
      storeEyebrow: cleanText(content.sections.storeEyebrow, 40),
      storeTitle: cleanText(content.sections.storeTitle, 80),
    },
    events: content.events.slice(0, 8).map((event) => ({
      id: cleanId(event.id),
      title: cleanText(event.title, 80),
      date: cleanText(event.date, 40),
      time: cleanText(event.time, 40),
      location: cleanText(event.location, 80),
    })),
    storeDrops: content.storeDrops.slice(0, 9).map((drop) => ({
      id: cleanId(drop.id),
      title: cleanText(drop.title, 80),
      status: cleanText(drop.status, 40),
      price: cleanText(drop.price, 40),
      description: cleanText(drop.description, 400),
      imageUrl: cleanText(drop.imageUrl, 500),
      externalUrl: cleanText(drop.externalUrl, 500),
    })),
  };
}

function normalizeSiteContent(value: Json): SiteContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultSiteContent;
  }

  const content = value as { [key: string]: Json | undefined };
  const hero = readObject(content.hero);
  const stats = readObject(content.stats);
  const sections = readObject(content.sections);

  return sanitizeSiteContent({
    hero: {
      ...defaultSiteContent.hero,
      bannerUrl: readString(hero.bannerUrl, defaultSiteContent.hero.bannerUrl),
      eyebrow: readString(hero.eyebrow, defaultSiteContent.hero.eyebrow),
      title: readString(hero.title, defaultSiteContent.hero.title),
      body: readString(hero.body, defaultSiteContent.hero.body),
      primaryButtonText: readString(
        hero.primaryButtonText,
        defaultSiteContent.hero.primaryButtonText
      ),
      secondaryButtonText: readString(
        hero.secondaryButtonText,
        defaultSiteContent.hero.secondaryButtonText
      ),
      storeButtonText: readString(
        hero.storeButtonText,
        defaultSiteContent.hero.storeButtonText
      ),
    },
    stats: {
      ...defaultSiteContent.stats,
      memberLabel: readString(
        stats.memberLabel,
        defaultSiteContent.stats.memberLabel
      ),
      memberValue: readString(
        stats.memberValue,
        defaultSiteContent.stats.memberValue
      ),
      pointsLabel: readString(
        stats.pointsLabel,
        defaultSiteContent.stats.pointsLabel
      ),
      pointsValue: readString(
        stats.pointsValue,
        defaultSiteContent.stats.pointsValue
      ),
      nextEventLabel: readString(
        stats.nextEventLabel,
        defaultSiteContent.stats.nextEventLabel
      ),
      nextEventValue: readString(
        stats.nextEventValue,
        defaultSiteContent.stats.nextEventValue
      ),
    },
    sections: {
      ...defaultSiteContent.sections,
      postsEyebrow: readString(
        sections.postsEyebrow,
        defaultSiteContent.sections.postsEyebrow
      ),
      postsTitle: readString(
        sections.postsTitle,
        defaultSiteContent.sections.postsTitle
      ),
      scheduleEyebrow: readString(
        sections.scheduleEyebrow,
        defaultSiteContent.sections.scheduleEyebrow
      ),
      scheduleTitle: readString(
        sections.scheduleTitle,
        defaultSiteContent.sections.scheduleTitle
      ),
      storeEyebrow: readString(
        sections.storeEyebrow,
        defaultSiteContent.sections.storeEyebrow
      ),
      storeTitle: readString(
        sections.storeTitle,
        defaultSiteContent.sections.storeTitle
      ),
    },
    events: readArray(content.events, defaultSiteContent.events).map(
      normalizeEvent
    ),
    storeDrops: readArray(
      content.storeDrops,
      defaultSiteContent.storeDrops
    ).map(normalizeStoreDrop),
  });
}

function normalizeEvent(value: Json): EditableEventItem {
  const event = readObject(value);
  return {
    id: readString(event.id, `event-${Date.now()}`),
    title: readString(event.title, "Upcoming Event"),
    date: readString(event.date, "TBD"),
    time: readString(event.time, "TBD"),
    location: readString(event.location, "The Forest"),
  };
}

function normalizeStoreDrop(value: Json): EditableStoreDrop {
  const drop = readObject(value);
  return {
    id: readString(drop.id, `drop-${Date.now()}`),
    title: readString(drop.title, "Store Item"),
    status: readString(drop.status, "Planned"),
    price: readString(drop.price, "External"),
    description: readString(drop.description, ""),
    imageUrl: readString(drop.imageUrl, "/images/store-placeholder.svg"),
    externalUrl: readString(drop.externalUrl, "https://twitch.tv/musemallow"),
  };
}

function readObject(value: Json | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as { [key: string]: Json | undefined };
  }

  return value;
}

function readArray<T extends Json>(value: Json | undefined, fallback: T[]) {
  return Array.isArray(value) ? value : fallback;
}

function readString(value: Json | undefined, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function cleanText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function cleanId(value: string) {
  const id = value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return id || `item-${Date.now()}`;
}

function getSiteContentSaveError(message: string) {
  if (message.includes("site_content")) {
    return "The site editor table is not ready yet. Run supabase/site-content.sql in Supabase, then refresh.";
  }

  if (message.includes("row-level security") || message.includes("permission")) {
    return "Supabase blocked this edit. Make sure your profile role is owner and run supabase/site-content.sql.";
  }

  return message;
}
