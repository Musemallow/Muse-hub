import Image from "next/image";
import { Post } from "../types/post";
import { ProfilePermissions } from "../types/profile";

type Props = {
  post: Post;
  onPublish?: (post: Post) => void;
  onDeleteDraft?: (postId: string) => void;
  isBusy?: boolean;
  permissions?: ProfilePermissions;
};

export default function PostCard({
  post,
  onPublish,
  onDeleteDraft,
  isBusy = false,
  permissions,
}: Props) {
  const canComment = permissions?.canComment ?? false;

  return (
    <div
      style={{
        background: "#0b0b0f",
        border: "1px solid rgba(80, 140, 255, 0.14)",
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        color: "#fff",
        boxShadow: "0 0 24px rgba(0, 80, 255, 0.08)",
      }}
    >
      <div
        style={{
          marginBottom: 10,
          fontSize: 14,
          opacity: 0.9,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>{post.authorName}</strong> - {post.createdAt}
        </div>

        {post.isDraft && (
          <span
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              background: "rgba(80, 140, 255, 0.12)",
              border: "1px solid rgba(80, 140, 255, 0.25)",
              color: "#9fc2ff",
            }}
          >
            Draft
          </span>
        )}
      </div>

      {post.caption && (
        <p
          style={{
            margin: 0,
            marginBottom: 12,
            lineHeight: 1.5,
            fontSize: 15,
          }}
        >
          {post.caption}
        </p>
      )}

      {post.images.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {post.images.map((img) => (
            <div
              key={img.id}
              style={{
                position: "relative",
                width: "100%",
                minHeight: 260,
                aspectRatio: "4 / 3",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <Image
                src={img.uri}
                alt="Post image"
                fill
                unoptimized
                sizes="(max-width: 800px) 100vw, 760px"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}

      {post.videos.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {post.videos.map((vid) => (
            <div
              key={vid.id}
              style={{
                padding: 12,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              {vid.uri ? (
                <video
                  src={vid.uri}
                  controls
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    marginBottom: 10,
                    background: "#000",
                  }}
                />
              ) : null}

              <div>{vid.title || "Video"}</div>
            </div>
          ))}
        </div>
      )}

      {post.audios.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {post.audios.map((aud) => (
            <div
              key={aud.id}
              style={{
                padding: 12,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              {aud.uri ? (
                <audio
                  src={aud.uri}
                  controls
                  style={{
                    width: "100%",
                    marginBottom: 10,
                  }}
                />
              ) : null}

              <div>
                Audio: {aud.title || "Audio"} ({aud.duration || "--:--"})
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          fontSize: 14,
          opacity: 0.7,
        }}
      >
        Likes {post.likeCount} - Comments {post.commentCount}
      </div>

      {canComment && (
        <div
          style={{
            marginTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 14,
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: 12,
              marginBottom: 8,
              color: "rgba(255,255,255,0.62)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Comment
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <input
              type="text"
              placeholder="Add a comment"
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                outline: "none",
                padding: "10px 12px",
              }}
            />

            {permissions?.canCommentWithGifs && (
              <button type="button" style={commentToolButtonStyle}>
                GIF
              </button>
            )}

            {permissions?.canCommentWithImages && (
              <button type="button" style={commentToolButtonStyle}>
                Image
              </button>
            )}
          </div>
        </div>
      )}

      {post.isDraft && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onPublish?.(post)}
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(80, 140, 255, 0.28)",
              background: "rgba(80, 140, 255, 0.14)",
              color: "#fff",
              fontSize: "14px",
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {isBusy ? "Working..." : "Publish"}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDeleteDraft?.(post.id)}
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              fontSize: "14px",
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {isBusy ? "Working..." : "Delete Draft"}
          </button>
        </div>
      )}
    </div>
  );
}

const commentToolButtonStyle: React.CSSProperties = {
  borderRadius: "12px",
  border: "1px solid rgba(80, 140, 255, 0.22)",
  background: "rgba(80, 140, 255, 0.1)",
  color: "#dbeafe",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  padding: "10px 12px",
};
