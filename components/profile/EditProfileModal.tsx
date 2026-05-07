"use client";

import { useEffect, useState } from "react";
import { Profile } from "../../types/profile";

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

  return <EditProfileForm profile={profile} onClose={onClose} onSave={onSave} />;
}

function EditProfileForm({
  profile,
  onClose,
  onSave,
}: Omit<EditProfileModalProps, "isOpen">) {
  const [formData, setFormData] = useState<Profile>(profile);

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
      <div className="w-full max-w-2xl overflow-hidden rounded-[8px] border border-blue-400/20 bg-[#050811] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
        <div className="border-b border-blue-400/10 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-blue-300/75">
                Profile Editor
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Edit Profile
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-blue-400/30 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <ProfileField
                label="Display Name"
                value={formData.displayName}
                onChange={(value) => updateField("displayName", value)}
                placeholder="MuseMallow"
                maxLength={80}
              />
              <ProfileField
                label="Username"
                value={formData.username}
                onChange={(value) => updateField("username", value)}
                placeholder="musemallow"
                maxLength={32}
              />
            </div>

            <ProfileField
              label="Status"
              value={formData.status}
              onChange={(value) => updateField("status", value)}
              placeholder="Local forest spirit, definitely not a cryptid."
              maxLength={160}
            />

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
                Bio
              </span>
              <textarea
                value={formData.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                maxLength={1000}
                rows={5}
                className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-400/40"
                placeholder="Write something about yourself..."
              />
            </label>

            <ProfileField
              label="Social Handle"
              value={formData.socialHandle ?? ""}
              onChange={(value) => updateField("socialHandle", value)}
              placeholder="musemallow"
              maxLength={80}
            />

            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
                Membership
              </span>
              <select
                value={formData.membership.tier}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    membership: {
                      ...prev.membership,
                      tier: event.target.value as Profile["membership"]["tier"],
                    },
                  }))
                }
                className="w-full rounded-[8px] border border-white/10 bg-[#0b1020] px-4 py-3 text-white outline-none transition focus:border-blue-400/40"
              >
                <option value="free">Free Member</option>
                <option value="premium">Premium Member</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-blue-400/10 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-blue-400/20 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200 hover:bg-blue-500/20 hover:text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </span>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-400/40"
        placeholder={placeholder}
      />
    </label>
  );
}
