import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1
        className="text-6xl md:text-8xl font-black text-white mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        4<span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">0</span>4
      </h1>
      <p className="text-xl font-semibold text-white mb-2">Page Not Found</p>
      <p className="text-gray-500 text-sm max-w-sm mb-10">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition shadow-lg"
        >
          🏠 Go Home
        </Link>
        <Link
          href="/games"
          className="bg-white/8 hover:bg-white/15 border border-white/15 text-gray-300 font-semibold px-6 py-3 rounded-xl transition"
        >
          🎮 Browse Games
        </Link>
      </div>
    </div>
  );
}
