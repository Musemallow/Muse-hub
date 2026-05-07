"use client";

import { useState } from "react";
import EditProfileModal from "../../components/profile/EditProfileModal";
import ProfileView from "../../components/profile/ProfileView";
import { mockProfile } from "../../data/mockProfile";
import { Profile } from "../../types/profile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(mockProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function handleSaveProfile(updatedProfile: Profile) {
    setProfile(updatedProfile);
  }

  return (
    <>
      <ProfileView profile={profile} onEdit={() => setIsEditOpen(true)} />

      <EditProfileModal
        isOpen={isEditOpen}
        profile={profile}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}
