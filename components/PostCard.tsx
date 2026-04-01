import { Post } from "../types/post";

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        color: "#fff",
        border: "1px solid #1f1f1f",
      }}
    >
      <div style={{ marginBottom: 8, fontSize: 13 }}>
        <strong>{post.authorName}</strong> • {post.createdAt}
      </div>

      {post.caption && (
        <p
          style={{
            margin: 0,
            marginBottom: 8,
            lineHeight: 1.4,
            fontSize: 13,
          }}
        >
          {post.caption}
        </p>
      )}

      {post.images.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {post.images.map((img) => (
            <img
              key={img.id}
              src={img.uri}
              alt="Post image"
              style={{
                width: "100%",
                borderRadius: 8,
                marginBottom: 6,
                display: "block",
              }}
            />
          ))}
        </div>
      )}

      {post.videos.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {post.videos.map((vid) => (
            <div
              key={vid.id}
              style={{
                padding: 8,
                background: "#222",
                borderRadius: 8,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              🎬 {vid.title || "Video"}
            </div>
          ))}
        </div>
      )}

      {post.audios.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {post.audios.map((aud) => (
            <div
              key={aud.id}
              style={{
                padding: 8,
                background: "#222",
                borderRadius: 8,
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              🎧 {aud.title || "Audio"} ({aud.duration || "--:--"})
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, opacity: 0.7, fontSize: 12 }}>
        ♥ {post.likeCount} • 💬 {post.commentCount}
      </div>
    </div>
  );
}