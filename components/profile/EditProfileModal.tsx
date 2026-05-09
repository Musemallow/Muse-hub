"use client";

import { useEffect, useState } from "react";
import { uploadProfileMedia } from "../../lib/profileMedia";
import { Profile, SocialLinks } from "../../types/profile";

type EditProfileModalProps = {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => Promise<boolean>;
};

const socialFields: {
  key: keyof SocialLinks;
  label: string;
  placeholder: string;
}[] = [
  { key: "twitch", label: "Twitch", placeholder: "username" },
  { key: "x", label: "X", placeholder: "username" },
  { key: "bsky", label: "BSKY", placeholder: "username.bsky.social" },
  { key: "instagram", label: "Instagram", placeholder: "username" },
  { key: "youtube", label: "YouTube", placeholder: "@username" },
  { key: "discord", label: "Discord", placeholder: "username" },
];

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
  const [formData, setFormData] = useState<Profile>({
    ...profile,
    socialLinks: profile.socialLinks ?? {},
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingField, setUploadingField] = useState<"avatar" | "banner" | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof Profile>(field: K, value: Profile[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateSocialLink(field: keyof SocialLinks, value: string) {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks ?? {}),
        [field]: value,
      },
    }));
  }

  async function handleSave() {
    setErrorMessage("");
    setIsSaving(true);

    try {
      const didSave = await onSave(formData);

      if (didSave) {
        onClose();
      } else {
        setErrorMessage("Unable to save these profile changes yet.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMediaUpload(
    file: File | undefined,
    kind: "avatar" | "banner"
  ) {
    if (!file) return;

    setErrorMessage("");
    setUploadingField(kind);

    try {
      const publicUrl = await uploadProfileMedia(file, kind);
      updateField(kind === "avatar" ? "avatarUrl" : "bannerUrl", publicUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to upload image."
      );
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
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

        <div className="max-h-[78vh] overflow-y-auto px-5 py-5 sm:px-6">
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
                placeholder="username"
                maxLength={32}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FileField
                label="Profile Picture"
                isUploading={uploadingField === "avatar"}
                onChange={(file) => handleMediaUpload(file, "avatar")}
              />
              <FileField
                label="Banner"
                isUploading={uploadingField === "banner"}
                onChange={(file) => handleMediaUpload(file, "banner")}
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

            <div className="grid gap-5 md:grid-cols-2">
              <ProfileField
                label="Birthdate"
                type="date"
                value={formData.birthdate ?? ""}
                onChange={(value) => updateField("birthdate", value)}
                placeholder=""
              />
              <label className="flex items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-white">
                    Show Birthdate
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    Display it on your profile.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(formData.showBirthdate)}
                  onChange={(event) =>
                    updateField("showBirthdate", event.target.checked)
                  }
                  className="h-5 w-5 accent-blue-500"
                />
              </label>
            </div>

            <div className="rounded-[8px] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                Social Links
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {socialFields.map((field) => (
                  <ProfileField
                    key={field.key}
                    label={field.label}
                    value={formData.socialLinks?.[field.key] ?? ""}
                    onChange={(value) => updateSocialLink(field.key, value)}
                    placeholder={field.placeholder}
                    maxLength={120}
                  />
                ))}
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-[8px] border border-red-400/40 bg-red-500/10 p-3 text-sm leading-6 text-red-100">
                {errorMessage}
              </p>
            )}
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
            disabled={isSaving || Boolean(uploadingField)}
            className="rounded-full border border-blue-400/40 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:border-blue-200 hover:bg-blue-500/20 hover:text-white"
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-400/40"
        placeholder={placeholder}
      />
    </label>
  );
}

function FileField({
  label,
  isUploading,
  onChange,
}: {
  label: string;
  isUploading: boolean;
  onChange: (file: File | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">
        {label}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={isUploading}
        onChange={(event) => onChange(event.target.files?.[0])}
        className="w-full rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-blue-500/15 file:px-4 file:py-2 file:text-sm file:font-bold file:text-blue-100 disabled:cursor-not-allowed disabled:text-zinc-600"
      />
      <p className="mt-2 text-xs text-zinc-500">
        {isUploading ? "Uploading..." : "JPG, PNG, WEBP, or GIF. Large images resize automatically."}
      </p>
    </label>
  );
}
