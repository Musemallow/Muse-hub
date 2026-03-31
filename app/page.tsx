export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center px-4">


      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,#00ffff33,transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,transparent,rgba(0,255,255,0.05),transparent)]" />

      <h1 className="text-5xl font-bold tracking-wide text-white drop-shadow-[0_0_10px_#00ffff]">
        Musemallow
      </h1>

      <p className="mt-2 text-cyan-400 tracking-[0.3em] uppercase text-sm">
        Signal Hub
      </p>


      <div className="mt-10 w-full max-w-md rounded-2xl border border-cyan-400/40 bg-black/70 backdrop-blur-md p-6 shadow-[0_0_40px_#00ffff33]">

        <h2 className="text-xl font-semibold text-cyan-300">
          Welcome, Wanderer
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          You’ve entered the Musemallow network.
        </p>


        <div className="mt-6 flex flex-col gap-4">

          <button className="w-full rounded-xl border border-cyan-400/60 bg-cyan-500/10 py-3 text-cyan-300 shadow-[0_0_20px_#00ffff44] hover:bg-cyan-500/20 hover:shadow-[0_0_30px_#00ffffaa] transition">
            Enter Signal Feed
          </button>

          <button className="w-full rounded-xl border border-blue-500/60 bg-blue-500/10 py-3 text-blue-300 shadow-[0_0_20px_#0066ff44] hover:bg-blue-500/20 hover:shadow-[0_0_30px_#0066ffaa] transition">
            Audio Logs
          </button>

          <button className="w-full rounded-xl border border-white/20 bg-white/5 py-3 text-gray-300 hover:bg-white/10 transition">
            Profile
          </button>

        </div>

      </div>

      <p className="mt-10 text-xs text-cyan-600 tracking-widest">
        musemallow.app
      </p>

    </main>
  );
}