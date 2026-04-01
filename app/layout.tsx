import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <Image
          src="/muse.png"
          alt="Muse logo"
          width={1600}
          height={900}
          style={{
            width: "100%",
            maxWidth: "700px",
            height: "auto",
          }}
          priority
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 700,
            }}
          >
            Welcome to The Forest
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "16px",
              opacity: 0.8,
            }}
          >
            Network Reconnected
          </p>

          <Link
            href="/feed"
            style={{
              marginTop: "8px",
              padding: "12px 20px",
              borderRadius: "10px",
              background: "#111",
              border: "1px solid #222",
              fontSize: "16px",
            }}
          >
            Enter Feed
          </Link>
        </div>
      </div>
    </main>
  );
}