import { Profile, ProfilePermissions } from "../types/profile";

export function getProfilePermissions(profile: Profile): ProfilePermissions {
  const isOwner = profile.isCreator;
  const isStaff = isOwner || profile.role === "admin" || profile.role === "moderator";

  return {
    canPost: isOwner,
    canMessage: isOwner,
    canComment: true,
    canCommentWithImages: true,
    canCommentWithGifs: true,
    canModerate: isStaff,
  };
}
