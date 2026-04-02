"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { addDraftPost } from "../../data/draftPosts";
import { DraftPost } from "../../types/createPost";

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type LocalVideo = {
  id: string;
  file: File;
  previewUrl: string;
};

type LocalAudio = {
  id: string;
  file: File;
  previewUrl: string;
};

const MAX_IMAGE_COUNT = 4;
const MAX_VIDEO_COUNT = 1;
const MAX_AUDIO_COUNT = 1;

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50 MB

export default function CreatePage() {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [audios, setAudios] = useState<LocalAudio[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const canPost = useMemo(() => {
    return (
      !isPosting &&
      (caption.trim().length > 0 ||
        images.length > 0 ||
        videos.length > 0 ||
        audios.length > 0)
    );
  }, [caption, images, videos, audios, isPosting]);

  useEffect(() => {
    return () => {
      images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      videos.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      audios.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [images, videos, audios]);

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function revokePreviewUrl(url: string) {
    URL.revokeObjectURL(url);
  }

  function validateFileType(
    file: File,
    prefix: "image/" | "video/" | "audio/"
  ) {
    return file.type.startsWith(prefix);
  }

  function validateFileSize(file: File, maxBytes: number) {
    return file.size <= maxBytes;
  }

  function formatMb(bytes: number) {
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  function buildImageItem(file: File): LocalImage {
    return {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  function buildVideoItem(file: File): LocalVideo {
    return {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  function buildAudioItem(file: File): LocalAudio {
    return {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFiles = Array.from(fileList);
    const remainingSlots = Math.max(0, MAX_IMAGE_COUNT - images.length);

    if (remainingSlots === 0) {
      setStatusMessage(`Only up to ${MAX_IMAGE_COUNT} images allowed for now.`);
      event.target.value = "";
      return;
    }

    const acceptedFiles: File[] = [];
    let message = "";

    for (const file of selectedFiles) {
      if (acceptedFiles.length >= remainingSlots) {
        message = `Only up to ${MAX_IMAGE_COUNT} images allowed for now.`;
        break;
      }

      if (!validateFileType(file, "image/")) {
        message = `"${file.name}" is not a valid image file.`;
        continue;
      }

      if (!validateFileSize(file, MAX_IMAGE_SIZE)) {
        message = `"${file.name}" is too large. Max image size is ${formatMb(
          MAX_IMAGE_SIZE
        )}.`;
        continue;
      }

      acceptedFiles.push(file);
    }

    const newImages = acceptedFiles.map(buildImageItem);
    setImages((prev) => [...prev, ...newImages]);
    setStatusMessage(message);
    event.target.value = "";
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    if (videos.length >= MAX_VIDEO_COUNT) {
      setStatusMessage(`Only ${MAX_VIDEO_COUNT} video allowed for now.`);
      event.target.value = "";
      return;
    }

    if (!validateFileType(file, "video/")) {
      setStatusMessage(`"${file.name}" is not a valid video file.`);
      event.target.value = "";
      return;
    }

    if (!validateFileSize(file, MAX_VIDEO_SIZE)) {
      setStatusMessage(
        `"${file.name}" is too large. Max video size is ${formatMb(
          MAX_VIDEO_SIZE
        )}.`
      );
      event.target.value = "";
      return;
    }

    setVideos([buildVideoItem(file)]);
    setStatusMessage("");
    event.target.value = "";
  }

  function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    if (audios.length >= MAX_AUDIO_COUNT) {
      setStatusMessage(`Only ${MAX_AUDIO_COUNT} audio file allowed for now.`);
      event.target.value = "";
      return;
    }

    if (!validateFileType(file, "audio/")) {
      setStatusMessage(`"${file.name}" is not a valid audio file.`);
      event.target.value = "";
      return;
    }

    if (!validateFileSize(file, MAX_AUDIO_SIZE)) {
      setStatusMessage(
        `"${file.name}" is too large. Max audio size is ${formatMb(
          MAX_AUDIO_SIZE
        )}.`
      );
      event.target.value = "";
      return;
    }

    setAudios([buildAudioItem(file)]);
    setStatusMessage("");
    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) revokePreviewUrl(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function removeVideo(id: string) {
    setVideos((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) revokePreviewUrl(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function removeAudio(id: string) {
    setAudios((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) revokePreviewUrl(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function clearComposer() {
    images.forEach((item) => revokePreviewUrl(item.previewUrl));
    videos.forEach((item) => revokePreviewUrl(item.previewUrl));
    audios.forEach((item) => revokePreviewUrl(item.previewUrl));

    setCaption("");
    setImages([]);
    setVideos([]);
    setAudios([]);
  }

  function handlePost() {
    if (!canPost) return;

    setIsPosting(true);

    const draftPost: DraftPost = {
      id: makeId(),
      caption: caption.trim(),
      images: images.map((item) => ({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
      })),
      videos: videos.map((item) => ({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
      })),
      audios: audios.map((item) => ({
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
      })),
      createdAt: new Date().toISOString(),
    };

    console.log("Draft post created:", draftPost);
    addDraftPost(draftPost);

    clearComposer();
    setStatusMessage("Draft saved locally.");
    setIsPosting(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "28px 16px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "760px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              Create Post
            </h1>
            <p
              style={{
                margin: "6px 0 0 0",
                opacity: 0.7,
                fontSize: "14px",
              }}
            >
              Mixed media composer
            </p>
          </div>

          <Link
            href="/feed"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(80, 140, 255, 0.18)",
              background: "#0b0b0f",
              color: "#fff",
              fontSize: "14px",
            }}
          >
            Back to Feed
          </Link>
        </div>

        <div
          style={{
            background: "#0b0b0f",
            border: "1px solid rgba(80, 140, 255, 0.14)",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 0 24px rgba(0, 80, 255, 0.08)",
          }}
        >
          <label
            htmlFor="caption"
            style={{
              display: "block",
              marginBottom: 10,
              fontSize: 14,
              opacity: 0.85,
            }}
          >
            Caption
          </label>

          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What do you want to share?"
            maxLength={2000}
            style={{
              width: "100%",
              minHeight: "130px",
              resize: "vertical",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
              color: "#fff",
              outline: "none",
              marginBottom: "16px",
              fontSize: "15px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                opacity: 0.65,
              }}
            >
              {caption.length}/2000
            </div>

            <div
              style={{
                fontSize: "13px",
                opacity: 0.65,
              }}
            >
              {images.length}/{MAX_IMAGE_COUNT} images • {videos.length}/
              {MAX_VIDEO_COUNT} video • {audios.length}/{MAX_AUDIO_COUNT} audio
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <label style={pickerButtonStyle}>
              + Image
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>

            <label style={pickerButtonStyle}>
              + Video
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: "none" }}
              />
            </label>

            <label style={pickerButtonStyle}>
              + Audio
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {statusMessage && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "rgba(59,130,246,0.10)",
                border: "1px solid rgba(59,130,246,0.22)",
                fontSize: "14px",
              }}
            >
              {statusMessage}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                }}
              >
                Image Preview
              </h2>

              {images.length === 0 ? (
                <EmptyBlock text="No images selected." />
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {images.map((image) => (
                    <div key={image.id} style={previewCardStyle}>
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        style={{
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          marginBottom: "10px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "13px",
                          marginBottom: "10px",
                          wordBreak: "break-word",
                          opacity: 0.9,
                        }}
                      >
                        {image.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        style={removeButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                }}
              >
                Video Preview
              </h2>

              {videos.length === 0 ? (
                <EmptyBlock text="No video selected." />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {videos.map((video) => (
                    <div key={video.id} style={previewCardStyle}>
                      <video
                        src={video.previewUrl}
                        controls
                        style={{
                          width: "100%",
                          maxHeight: "360px",
                          borderRadius: "12px",
                          marginBottom: "10px",
                          background: "#000",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "13px",
                          marginBottom: "10px",
                          wordBreak: "break-word",
                          opacity: 0.9,
                        }}
                      >
                        {video.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        style={removeButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                }}
              >
                Audio Preview
              </h2>

              {audios.length === 0 ? (
                <EmptyBlock text="No audio selected." />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {audios.map((audio) => (
                    <div key={audio.id} style={previewCardStyle}>
                      <audio
                        src={audio.previewUrl}
                        controls
                        style={{
                          width: "100%",
                          marginBottom: "10px",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "13px",
                          marginBottom: "10px",
                          wordBreak: "break-word",
                          opacity: 0.9,
                        }}
                      >
                        {audio.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAudio(audio.id)}
                        style={removeButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              disabled={!canPost}
              onClick={handlePost}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                border: canPost
                  ? "1px solid rgba(96, 165, 250, 0.45)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: canPost
                  ? "rgba(59,130,246,0.16)"
                  : "rgba(255,255,255,0.04)",
                color: canPost ? "#dbeafe" : "rgba(255,255,255,0.45)",
                cursor: canPost ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {isPosting ? "Creating..." : "Create Local Draft"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: "14px",
        opacity: 0.7,
      }}
    >
      {text}
    </div>
  );
}

const pickerButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(80, 140, 255, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
};

const previewCardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "14px",
  padding: "12px",
};

const removeButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};