import PostCard from "../../components/PostCard";
import { mockPosts } from "../../data/mockPosts";

export default function FeedPage() {
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
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            Feed
          </h1>

          <span
            style={{
              fontSize: "14px",
              opacity: 0.7,
            }}
          >
            MuseHub
          </span>
        </div>

        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}