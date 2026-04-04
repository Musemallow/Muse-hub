import Link from "next/link";
import ProfileHeader from "../../../components/ProfileHeader";
import { mockProfile } from "../../../data/mockProfile";

export default function ProfilePage() {
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
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <Link
            href="/"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(80, 140, 255, 0.18)",
              background: "#0b0b0f",
              color: "#fff",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Home
          </Link>

          <Link
            href="/feed"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(80, 140, 255, 0.18)",
              background: "#0b0b0f",
              color: "#fff",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Feed
          </Link>

          <Link
            href="/create"
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(80, 140, 255, 0.18)",
              background: "#0b0b0f",
              color: "#fff",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Create Post
          </Link>
        </div>

        <ProfileHeader profile={mockProfile} />

        <div
          style={{
            marginTop: 20,
            background: "#0b0b0f",
            border: "1px solid rgba(80, 140, 255, 0.14)",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <h2
            style={{
              margin: "0 0 10px 0",
              fontSize: 20,
            }}
          >
            Creator Space
          </h2>

          <p
            style={{
              margin: 0,
              lineHeight: 1.6,
              fontSize: 15,
              opacity: 0.82,
            }}
          >
            This is the profile page.
          </p>
        </div>
      </div>
    </main>
  );
}