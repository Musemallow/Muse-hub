"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import {
  EditableEventItem,
  EditableChatRoom,
  EditableStoreDrop,
  SiteContent,
  defaultSiteContent,
  getSiteContent,
  saveSiteContent,
} from "../../lib/siteContent";
import { getCurrentProfileFromSupabase } from "../../lib/profiles";
import { Profile } from "../../types/profile";

type AdminTab = "hub" | "schedule" | "rooms" | "store";

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [activeTab, setActiveTab] = useState<AdminTab>("hub");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        const currentProfile = await getCurrentProfileFromSupabase();
        const currentContent = await getSiteContent();

        if (!isMounted) return;

        setProfile(currentProfile);
        setContent(currentContent);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load the site editor."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const canEdit = profile?.role === "owner";

  async function handleSave() {
    setStatusMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      await saveSiteContent(content);
      setStatusMessage("Site content saved. Refresh the hub to see it live.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save site content."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <AdminAccessMessage body="Checking owner access..." />;
  }

  if (!canEdit) {
    return (
      <AdminAccessMessage
        title="Owner Access"
        body="Log in with the owner profile to edit MuseHub."
      />
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hub"
            className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
          >
            Back to Hub
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="hub-nav-link" href="/create">
              Create Post
            </Link>
            <Link className="hub-nav-link" href="/profile">
              Profile
            </Link>
          </div>
        </nav>

        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Owner Console
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white sm:text-5xl">
                Site Editor
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 sm:text-base">
                Edit the hub banner, public text, schedule cards, and external
                store links from the owner profile.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full border border-blue-400/45 bg-blue-500/15 px-5 py-3 text-sm font-bold text-blue-100 transition enabled:hover:border-blue-200 enabled:hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.04] disabled:text-zinc-500"
            >
              {isSaving ? "Saving..." : "Save Site Changes"}
            </button>
          </div>

          {(statusMessage || errorMessage) && (
            <div className="mt-5 grid gap-3">
              {statusMessage && (
                <p className="rounded-[8px] border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">
                  {statusMessage}
                </p>
              )}
              {errorMessage && (
                <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </section>

        <div className="mt-5 flex flex-wrap gap-2">
          <TabButton
            label="Hub"
            isActive={activeTab === "hub"}
            onClick={() => setActiveTab("hub")}
          />
          <TabButton
            label="Schedule"
            isActive={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
          />
          <TabButton
            label="Rooms"
            isActive={activeTab === "rooms"}
            onClick={() => setActiveTab("rooms")}
          />
          <TabButton
            label="Store"
            isActive={activeTab === "store"}
            onClick={() => setActiveTab("store")}
          />
        </div>

        <section className="mt-5 rounded-[8px] border border-white/10 bg-[#050811] p-5 sm:p-7">
          {activeTab === "hub" && (
            <HubEditor content={content} onChange={setContent} />
          )}
          {activeTab === "schedule" && (
            <ScheduleEditor content={content} onChange={setContent} />
          )}
          {activeTab === "rooms" && (
            <RoomsEditor content={content} onChange={setContent} />
          )}
          {activeTab === "store" && (
            <StoreEditor content={content} onChange={setContent} />
          )}
        </section>
      </div>
    </main>
  );
}

function HubEditor({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  return (
    <div className="grid gap-6">
      <EditorSection
        eyebrow="Hub"
        title="Hero"
        body="This controls the first big section on /hub."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Banner Image URL"
            value={content.hero.bannerUrl}
            onChange={(value) =>
              onChange({
                ...content,
                hero: { ...content.hero, bannerUrl: value },
              })
            }
          />
          <TextField
            label="Eyebrow"
            value={content.hero.eyebrow}
            onChange={(value) =>
              onChange({ ...content, hero: { ...content.hero, eyebrow: value } })
            }
          />
          <TextField
            label="Title"
            value={content.hero.title}
            onChange={(value) =>
              onChange({ ...content, hero: { ...content.hero, title: value } })
            }
          />
          <TextField
            label="Primary Button"
            value={content.hero.primaryButtonText}
            onChange={(value) =>
              onChange({
                ...content,
                hero: { ...content.hero, primaryButtonText: value },
              })
            }
          />
          <TextField
            label="Schedule Button"
            value={content.hero.secondaryButtonText}
            onChange={(value) =>
              onChange({
                ...content,
                hero: { ...content.hero, secondaryButtonText: value },
              })
            }
          />
          <TextField
            label="Store Button"
            value={content.hero.storeButtonText}
            onChange={(value) =>
              onChange({
                ...content,
                hero: { ...content.hero, storeButtonText: value },
              })
            }
          />
        </div>
        <TextArea
          label="Hero Body"
          value={content.hero.body}
          onChange={(value) =>
            onChange({ ...content, hero: { ...content.hero, body: value } })
          }
        />
      </EditorSection>

      <EditorSection
        eyebrow="Hub"
        title="Section Headers"
        body="Small labels used across the hub page. Member tier and points are automatic for the logged-in viewer."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(content.sections).map(([key, value]) => (
            <TextField
              key={key}
              label={formatFieldLabel(key)}
              value={value}
              onChange={(nextValue) =>
                onChange({
                  ...content,
                  sections: { ...content.sections, [key]: nextValue },
                })
              }
            />
          ))}
        </div>
      </EditorSection>
    </div>
  );
}

function ScheduleEditor({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  function updateEvent(index: number, updates: Partial<EditableEventItem>) {
    onChange({
      ...content,
      events: content.events.map((event, eventIndex) =>
        eventIndex === index ? { ...event, ...updates } : event
      ),
    });
  }

  function removeEvent(index: number) {
    onChange({
      ...content,
      events: content.events.filter((event, eventIndex) => eventIndex !== index),
    });
  }

  function addEvent() {
    onChange({
      ...content,
      events: [
        ...content.events,
        {
          id: `event-${Date.now()}`,
          title: "New Event",
          date: "TBD",
          time: "TBD",
          location: "The Forest",
        },
      ],
    });
  }

  return (
    <EditorSection
      eyebrow="Schedule"
      title="Upcoming Signals"
      body="These cards appear on the hub and schedule pages."
    >
      <div className="grid gap-4">
        {content.events.map((event, index) => (
          <EditableCard
            key={event.id}
            title={event.title || "Untitled event"}
            onRemove={() => removeEvent(index)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Title"
                value={event.title}
                onChange={(value) => updateEvent(index, { title: value })}
              />
              <TextField
                label="Date"
                value={event.date}
                onChange={(value) => updateEvent(index, { date: value })}
              />
              <TextField
                label="Time"
                value={event.time}
                onChange={(value) => updateEvent(index, { time: value })}
              />
              <TextField
                label="Location"
                value={event.location}
                onChange={(value) => updateEvent(index, { location: value })}
              />
            </div>
          </EditableCard>
        ))}
      </div>
      <button
        type="button"
        onClick={addEvent}
        className="rounded-full border border-blue-400/35 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200"
      >
        Add Schedule Item
      </button>
    </EditorSection>
  );
}

function RoomsEditor({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  function updateRoom(index: number, updates: Partial<EditableChatRoom>) {
    onChange({
      ...content,
      chatRooms: content.chatRooms.map((room, roomIndex) =>
        roomIndex === index ? { ...room, ...updates } : room
      ),
    });
  }

  function removeRoom(index: number) {
    onChange({
      ...content,
      chatRooms: content.chatRooms.filter((room, roomIndex) => roomIndex !== index),
    });
  }

  function addRoom() {
    onChange({
      ...content,
      chatRooms: [
        ...content.chatRooms,
        {
          id: `room-${Date.now()}`,
          name: "New Room",
          description: "A MuseHub community room.",
        },
      ],
    });
  }

  return (
    <EditorSection
      eyebrow="Chat"
      title="Community Rooms"
      body="These rooms appear in the bottom chat dock across MuseHub."
    >
      <div className="grid gap-4">
        {content.chatRooms.map((room, index) => (
          <EditableCard
            key={room.id}
            title={room.name || "Untitled room"}
            onRemove={() => removeRoom(index)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Room ID"
                value={room.id}
                onChange={(value) => updateRoom(index, { id: value })}
              />
              <TextField
                label="Room Name"
                value={room.name}
                onChange={(value) => updateRoom(index, { name: value })}
              />
            </div>
            <TextArea
              label="Description"
              value={room.description}
              onChange={(value) => updateRoom(index, { description: value })}
            />
          </EditableCard>
        ))}
      </div>
      <button
        type="button"
        onClick={addRoom}
        className="rounded-full border border-blue-400/35 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200"
      >
        Add Room
      </button>
    </EditorSection>
  );
}

function StoreEditor({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  function updateDrop(index: number, updates: Partial<EditableStoreDrop>) {
    onChange({
      ...content,
      storeDrops: content.storeDrops.map((drop, dropIndex) =>
        dropIndex === index ? { ...drop, ...updates } : drop
      ),
    });
  }

  function removeDrop(index: number) {
    onChange({
      ...content,
      storeDrops: content.storeDrops.filter((drop, dropIndex) => dropIndex !== index),
    });
  }

  function addDrop() {
    onChange({
      ...content,
      storeDrops: [
        ...content.storeDrops,
        {
          id: `drop-${Date.now()}`,
          title: "New Store Item",
          status: "Planned",
          price: "External",
          description: "",
          imageUrl: "/images/store-placeholder.svg",
          externalUrl: "https://twitch.tv/musemallow",
        },
      ],
    });
  }

  return (
    <EditorSection
      eyebrow="Store"
      title="External Store Cards"
      body="MuseHub only displays these items. Checkout stays on the linked site."
    >
      <div className="grid gap-4">
        {content.storeDrops.map((drop, index) => (
          <EditableCard
            key={drop.id}
            title={drop.title || "Untitled item"}
            onRemove={() => removeDrop(index)}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Title"
                value={drop.title}
                onChange={(value) => updateDrop(index, { title: value })}
              />
              <TextField
                label="Status"
                value={drop.status}
                onChange={(value) => updateDrop(index, { status: value })}
              />
              <TextField
                label="Price / Label"
                value={drop.price}
                onChange={(value) => updateDrop(index, { price: value })}
              />
              <TextField
                label="External Link"
                value={drop.externalUrl}
                onChange={(value) => updateDrop(index, { externalUrl: value })}
              />
              <TextField
                label="Image URL"
                value={drop.imageUrl}
                onChange={(value) => updateDrop(index, { imageUrl: value })}
              />
            </div>
            <TextArea
              label="Description"
              value={drop.description}
              onChange={(value) => updateDrop(index, { description: value })}
            />
          </EditableCard>
        ))}
      </div>
      <button
        type="button"
        onClick={addDrop}
        className="rounded-full border border-blue-400/35 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200"
      >
        Add Store Item
      </button>
    </EditorSection>
  );
}

function EditorSection({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-blue-300/75">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400">{body}</p>
      </div>
      {children}
    </section>
  );
}

function EditableCard({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[8px] border border-white/10 bg-black/35 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-red-400/35 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-200"
        >
          Delete
        </button>
      </div>
      <div className="grid gap-4">{children}</div>
    </article>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
        isActive
          ? "border-blue-300/45 bg-blue-500/15 text-blue-100"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-blue-400/30 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-400/45"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </span>
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-400/45"
      />
    </label>
  );
}

function AdminAccessMessage({
  body,
  title = "Site Editor",
}: {
  body: string;
  title?: string;
}) {
  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/hub"
          className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100"
        >
          Back to Hub
        </Link>
        <section className="mt-8 rounded-[8px] border border-blue-400/20 bg-[#050811] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-300/75">
            Owner Console
          </p>
          <h1 className="mt-3 text-3xl font-black text-white">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">{body}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="hub-nav-link" href="/login">
              Login
            </Link>
            <Link className="hub-nav-link" href="/profile">
              Profile
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatFieldLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}
