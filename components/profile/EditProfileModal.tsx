"use client";

import { useEffect, useState } from "react";
import { Profile } from "../../data/mockProfile";

type EditProfileModalProps = {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => void;
};

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<Profile>(profile);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSave() {
    onSave(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#050811] shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <div className="border-b border-cyan-400/10 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                Profile Editor
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Edit Profile
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-cyan-400/30 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400">
                  Display Name
                </span>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40"
                  placeholder="MuseMallow"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400">
                  Username
                </span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40"
                  placeholder="musemallow"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400">
                Status
              </span>
              <input
                type="text"
                value={formData.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40"
                placeholder="Local forest spirit, definitely not a cryptid."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400">
                Bio
              </span>
              <textarea
                value={formData.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40"
                placeholder="Write something about yourself..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400">
                Discord
              </span>
              <input
                type="text"
                value={formData.discord ?? ""}
                onChange={(e) => updateField("discord", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-400/40"
                placeholder="musemallow"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-cyan-400/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-cyan-400/20 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}