import { Profile, ProfilePermissions } from "../types/profile";

export function getProfilePermissions(profile: Profile): ProfilePermissions {
  const isOwner = profile.isCreator;

  return {
    canPost: isOwner,
    canMessage: isOwner,
    canComment: true,
    canCommentWithImages: true,
    canCommentWithGifs: true,
  };
}
