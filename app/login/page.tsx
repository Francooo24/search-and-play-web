"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error); }
    else {
      window.location.href = from || "/";
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-4 relative z-10 overflow-y-auto scrollbar-hide">
      <style>{`footer { display: none !important; } .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[10px] flex items-center justify-center z-50" onClick={() => setError("")}>
          <div className="glass-card border-l-4 border-l-red-500 rounded-3xl p-10 max-w-md w-[92%] text-center" onClick={e => e.stopPropagation()}>
            <svg className="w-20 h-20 mx-auto mb-6 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Login Failed</h2>
            <p className="text-gray-300 mb-8">{error}</p>
            <button onClick={() => setError("")} className="w-full bg-gradient-to-r from-orange-600 to-amber-700 text-white py-3.5 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-800 transition">Try Again</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start pt-4">

        {/* Left side — Quotes */}
        <div className="hidden md:flex flex-col justify-center items-center flex-1 px-6 py-12 text-center">
          <div className="mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-700 rounded-xl flex items-center justify-center shadow-xl mb-6">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">&</span> Play</h2>
            <p className="text-gray-500 text-sm">English Dictionary & Word Games</p>
          </div>

          <div className="space-y-6">
            {[
              { quote: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
              { quote: "One word can change the world.", author: "Unknown" },
              { quote: "Words are, of course, the most powerful drug used by mankind.", author: "Rudyard Kipling" },
            ].map((q, i) => (
              <div key={i} className="border-l-2 border-orange-500/40 pl-4 text-left">
                <p className="text-gray-300 text-sm italic leading-relaxed">&ldquo;{q.quote}&rdquo;</p>
                <p className="text-orange-400/70 text-xs font-semibold mt-1">— {q.author}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side — Login form */}
        <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-6 w-full md:max-w-[380px] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <div className="mb-6">
          <svg className="w-12 h-12 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome Back</h1>
        <p className="text-lg text-gray-300 mb-6">Sign in to continue your learning journey</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Email */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-5 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input type={showPw ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 hover:opacity-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPw
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
          </div>

          <div className="text-right -mt-2">
            <Link href="/forgot-password" className="text-sm text-orange-400 hover:text-orange-300 transition">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 text-lg rounded-xl font-semibold shadow-xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-base text-gray-400 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition">Create one here</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
