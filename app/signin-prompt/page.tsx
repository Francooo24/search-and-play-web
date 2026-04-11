import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign In Required • Search & Play",
};

export default async function SignInPromptPage({
  searchParams,
}: {
  searchParams: { from?: string };
}) {
  const session = await getServerSession(authOptions);
  const from = (searchParams.from ?? "").toString();
  if (session) redirect(from || "/");

  const fromParam = from ? `?from=${encodeURIComponent(from)}` : "";

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-4 relative z-10 overflow-y-auto scrollbar-hide">
      <style>{`footer { display: none !important; } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start pt-4">

        {/* Left — Card */}
        <div
          className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-8 w-full md:max-w-[420px] text-center"
          style={{ animation: "fadeInUp 0.8s ease-out" }}
        >
          {/* Animated lock icon with glow ring */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            Members Only
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign In Required
          </h1>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            You need to be signed in to access this page and save your progress.
          </p>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[
              { icon: "🎮", label: "50+ Games" },
              { icon: "📖", label: "Dictionary" },
              { icon: "🏆", label: "Leaderboard" },
            ].map((perk) => (
              <div key={perk.label} className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-1 flex flex-col items-center gap-1">
                <span className="text-lg">{perk.icon}</span>
                <span className="text-xs text-gray-400 font-medium">{perk.label}</span>
              </div>
            ))}
          </div>

          <Link
            href={`/login${fromParam}`}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 text-base rounded-xl font-semibold shadow-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In Now
          </Link>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            href="/signup"
            className="w-full border border-white/15 text-gray-300 py-2.5 text-sm rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-orange-500/50 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create an Account
          </Link>
        </div>

        {/* Right — Quotes */}
        <div className="hidden md:flex flex-col justify-center items-start flex-1 px-6 py-12 pl-16 text-left">
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-700 rounded-xl flex items-center justify-center shadow-xl mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">&</span> Play</h2>
            <p className="text-gray-500 text-sm">English Dictionary &amp; Word Games</p>
          </div>
          <div className="space-y-6">
            {[
              { quote: "Search a word, master it, then play your way to fluency.", author: "Search & Play" },
              { quote: "Every word you search is a step closer to becoming a better version of yourself.", author: "Search & Play" },
              { quote: "Learn the word. Play the game. Own the language.", author: "Search & Play" },
            ].map((q, i) => (
              <div key={i} className="border-l-2 border-orange-500/40 pl-4">
                <p className="text-gray-300 text-sm italic leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
                <p className="text-orange-400/70 text-xs font-semibold mt-1">— {q.author}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
