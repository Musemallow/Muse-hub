"use client";

import { ChangeEvent, useMemo, useState } from "react";
import Link from "next/link";

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

export default function CreatePage() {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<LocalImage[]>([]);
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [audios, setAudios] = useState<LocalAudio[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  const canPost = useMemo(() => {
    return (
      caption.trim().length > 0 ||
      images.length > 0 ||
      videos.length > 0 ||
      audios.length > 0
    );
  }, [caption, images, videos, audios]);

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFiles = Array.from(fileList);

    const remainingSlots = Math.max(0, 4 - images.length);
    const acceptedFiles = selectedFiles.slice(0, remainingSlots);

    const newImages: LocalImage[] = acceptedFiles.map((file) => ({
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    if (selectedFiles.length > remainingSlots) {
      setStatusMessage("Only up to 4 images allowed for now.");
    } else {
      setStatusMessage("");
    }

    event.target.value = "";
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    if (videos.length >= 1) {
      setStatusMessage("Only 1 video allowed for now.");
      event.target.value = "";
      return;
    }

    const newVideo: LocalVideo = {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };

    setVideos([newVideo]);
    setStatusMessage("");
    event.target.value = "";
  }

  function handleAudioChange(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    if (audios.length >= 1) {
      setStatusMessage("Only 1 audio file allowed for now.");
      event.target.value = "";
      return;
    }

    const newAudio: LocalAudio = {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
    };

    setAudios([newAudio]);
    setStatusMessage("");
    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function removeVideo(id: string) {
    setVideos((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function removeAudio(id: string) {
    setAudios((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }

  function handlePost() {
    if (!canPost) return;

    const draftPost = {
      caption,
      images: images.map((item) => ({
        name: item.file.name,
        type: item.file.type,
      })),
      videos: videos.map((item) => ({
        name: item.file.name,
        type: item.file.type,
      })),
      audios: audios.map((item) => ({
        name: item.file.name,
        type: item.file.type,
      })),
    };

    console.log("Draft post created:", draftPost);

    setStatusMessage("Draft post created locally. Feed wiring comes next.");

    images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    videos.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    audios.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    setCaption("");
    setImages([]);
    setVideos([]);
    setAudios([]);
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
            marginBottom: "20px",
            gap: "12px",
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
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <label
              style={pickerButtonStyle}
            >
              + Image
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>

            <label
              style={pickerButtonStyle}
            >
              + Video
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: "none" }}
              />
            </label>

            <label
              style={pickerButtonStyle}
            >
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
              Create Local Draft
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