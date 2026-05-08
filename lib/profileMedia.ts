import { getSupabaseClient } from "./supabase";

export type ProfileMediaKind = "avatar" | "banner";

const bucketByKind: Record<ProfileMediaKind, string> = {
  avatar: "avatars",
  banner: "banners",
};

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadProfileMedia(file: File, kind: ProfileMediaKind) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF image.");
  }

  const maxSize = kind === "avatar" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
  const uploadFile = await resizeProfileImage(file, kind);

  if (uploadFile.size > maxSize) {
    throw new Error(
      kind === "avatar"
        ? "Profile pictures must be 2 MB or smaller."
        : "Banners must be 5 MB or smaller."
    );
  }

  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Log in before uploading profile media.");
  }

  const extension = getSafeExtension(uploadFile);
  const path = `${user.id}/${kind}-${Date.now()}.${extension}`;
  const bucket = bucketByKind[kind];

  const { error } = await supabase.storage.from(bucket).upload(path, uploadFile, {
    cacheControl: "3600",
    contentType: uploadFile.type,
    upsert: true,
  });

  if (error) {
    throw new Error(getStorageErrorMessage(error.message, bucket));
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function resizeProfileImage(file: File, kind: ProfileMediaKind) {
  if (file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxWidth = kind === "avatar" ? 512 : 1920;
  const maxHeight = kind === "avatar" ? 512 : 840;
  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.86);
  });

  if (!blob) return file;

  return new File([blob], replaceExtension(file.name, "webp"), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

function replaceExtension(fileName: string, extension: string) {
  const cleanName = fileName.replace(/\.[^.]+$/, "");
  return `${cleanName || "profile-image"}.${extension}`;
}

function getSafeExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";

  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  return nameExtension?.replace(/[^a-z0-9]/g, "") || "png";
}

function getStorageErrorMessage(message: string, bucket: string) {
  if (message.toLowerCase().includes("bucket not found")) {
    return `Storage is not ready yet. Run supabase/storage.sql in Supabase to create the ${bucket} bucket.`;
  }

  return message;
}
