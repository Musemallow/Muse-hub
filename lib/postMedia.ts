import { PostMediaItem, PostMediaKind } from "../types/content";
import { getSupabaseClient } from "./supabase";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
]);

export async function uploadPostMedia(file: File, kind: PostMediaKind) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("That file type is not supported for posts.");
  }

  const maxSize = getMaxSize(kind);
  const uploadFile =
    kind === "image" ? await resizePostImage(file) : file;

  if (uploadFile.size > maxSize) {
    throw new Error(`${file.name} is too large for ${kind} uploads.`);
  }

  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Log in before uploading post media.");
  }

  const extension = getSafeExtension(uploadFile);
  const path = `${user.id}/${kind}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("post-media").upload(path, uploadFile, {
    cacheControl: "3600",
    contentType: uploadFile.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("post-media").getPublicUrl(path);

  return {
    id: crypto.randomUUID(),
    kind,
    url: data.publicUrl,
    name: file.name,
    contentType: uploadFile.type,
  } satisfies PostMediaItem;
}

async function resizePostImage(file: File) {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const maxWidth = 1920;
  const maxHeight = 1920;
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

function getMaxSize(kind: PostMediaKind) {
  if (kind === "image") return 10 * 1024 * 1024;
  if (kind === "video") return 200 * 1024 * 1024;
  return 50 * 1024 * 1024;
}

function getSafeExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "video/mp4") return "mp4";
  if (file.type === "video/webm") return "webm";
  if (file.type === "audio/mpeg") return "mp3";
  if (file.type === "audio/mp4") return "m4a";
  if (file.type === "audio/wav") return "wav";
  if (file.type === "audio/webm") return "webm";
  if (file.type === "audio/ogg") return "ogg";
  return file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

function replaceExtension(fileName: string, extension: string) {
  const cleanName = fileName.replace(/\.[^.]+$/, "");
  return `${cleanName || "post-image"}.${extension}`;
}
