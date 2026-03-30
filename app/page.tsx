export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">

      {/* Glow background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#00ffff22,transparent_60%)]" />

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-center">
        Musemallow
      </h1>

      <p className="mt-2 text-cyan-400 tracking-widest uppercase text-sm">
        Signal Hub
      </p>

      {/* Card */}
      <div className="mt-10 w-full max-w-md rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 shadow-[0_0_30px_#00ffff22]">

        <h2 className="text-xl font-semibold text-cyan-300">
          Welcome, Wanderer
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          You’ve entered the Musemallow network.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/10 py-2 text-cyan-300 hover:bg-cyan-500/20 transition">
            Enter Signal Feed
          </button>

          <button className="w-full rounded-xl border border-blue-400/40 bg-blue-500/10 py-2 text-blue-300 hover:bg-blue-500/20 transition">
            Audio Logs
          </button>

          <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-gray-300 hover:bg-white/10 transition">
            Profile
          </button>
        </div>

      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-gray-600">
        musemallow.app
      </p>

    </main>
  );
}