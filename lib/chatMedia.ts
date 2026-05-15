import { ChannelMessage } from "../data/discussionThreads";
import { getSupabaseClient } from "./supabase";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadChatImage(file: File): Promise<ChannelMessage["attachment"]> {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Use a JPG, PNG, WEBP, or GIF image.");
  }

  const uploadFile = file.type === "image/gif" ? file : await resizeChatImage(file);
  if (uploadFile.size > 10 * 1024 * 1024) {
    throw new Error("Chat images must be 10 MB or smaller.");
  }

  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Log in before uploading chat images.");
  }

  const extension = getSafeExtension(uploadFile);
  const path = `${user.id}/chat-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("chat-attachments")
    .upload(path, uploadFile, {
      cacheControl: "3600",
      contentType: uploadFile.type,
    });

  if (error) {
    throw new Error(getStorageErrorMessage(error.message));
  }

  const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);

  return {
    type: uploadFile.type === "image/gif" ? "gif" : "image",
    label: file.name,
    url: data.publicUrl,
  };
}

async function resizeChatImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const maxHeight = 1600;
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
  return `${cleanName || "chat-image"}.${extension}`;
}

function getSafeExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "webp";
}

function getStorageErrorMessage(message: string) {
  if (message.toLowerCase().includes("bucket not found")) {
    return "Storage is not ready yet. Run supabase/storage.sql again to create the chat-attachments bucket.";
  }

  return message;
}
