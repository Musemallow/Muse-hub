export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Muse Hub</h1>
      <p>Starter home page.</p>
      <a href="/feed" style={{ color: "#00eaff" }}>
        Go to Feed
      </a>
    </main>
  );
}