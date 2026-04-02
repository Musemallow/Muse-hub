import { Post } from "../types/post";

type Props = {
  post: Post;
  onPublish?: (post: Post) => void;
  onDeleteDraft?: (postId: string) => void;
  isBusy?: boolean;
};

export default function PostCard({
  post,
  onPublish,
  onDeleteDraft,
  isBusy = false,
}: Props) {
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
          <strong>{post.authorName}</strong> • {post.createdAt}
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
            <img
              key={img.id}
              src={img.uri}
              alt="Post image"
              style={{
                width: "100%",
                borderRadius: 12,
                marginBottom: 8,
              }}
            />
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
                🎧 {aud.title || "Audio"} ({aud.duration || "--:--"})
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
        ♥ {post.likeCount} • 💬 {post.commentCount}
      </div>

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