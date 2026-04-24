import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-gray-800/50" style={{ background: "radial-gradient(ellipse at bottom, #171721 0%, #0d0d14 65%, #000000 100%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">
              Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">&</span> Play
            </h3>
          </div>
          <p className="text-slate-400 text-sm mb-6">Learn English, one word at a time.</p>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs" suppressHydrationWarning>&copy; {new Date().getFullYear()} Search and Play. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs">
              {[
                { label: "Dictionary",  href: "/" },
                { label: "Games",       href: "/games" },
                { label: "Leaderboard", href: "/leaderboard" },
              ].map((l, i, arr) => (
                <span key={l.href} className="flex items-center gap-6">
                  <Link href={l.href} className="text-slate-500 hover:text-orange-400 transition-colors">{l.label}</Link>
                  {i < arr.length - 1 && <span className="text-slate-700">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
