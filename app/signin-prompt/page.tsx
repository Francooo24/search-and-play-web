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
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 overflow-y-auto scrollbar-hide">
      <style>{`footer { display: none !important; } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center">

        {/* Left — Card */}
        <div
          className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-6 w-full md:max-w-[400px] text-center"
          style={{ animation: "fadeInUp 0.8s ease-out" }}
        >
          <div className="mb-4">
            <svg className="w-10 h-10 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign In Required
          </h1>
          <p className="text-base text-gray-300 mb-5">
            You need to be signed in to access this page and save your progress.
          </p>

          <Link
            href={`/login${fromParam}`}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 text-base rounded-xl font-semibold shadow-xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition"
          >
            Sign In Now
          </Link>

          <p className="mt-4 text-sm text-gray-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition hover:underline">
              Create one here
            </Link>
          </p>
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
