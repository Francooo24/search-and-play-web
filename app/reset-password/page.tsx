"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.push("/forgot-password");
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess(true);
  };

  if (success) return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
      <div className="glass-card border-l-[5px] border-l-green-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <svg className="w-16 h-16 mx-auto mb-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Password Reset!</h1>
        <p className="text-gray-300 mb-8">Your password has been updated successfully.</p>
        <Link href="/login" className="w-full block bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 text-lg rounded-xl font-semibold shadow-xl hover:from-orange-600 hover:to-amber-600 transition text-center">
          Back to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
      <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <div className="mb-6">
          <svg className="w-12 h-12 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Reset Password</h1>
        <p className="text-gray-300 mb-6">Enter your new password below.</p>

        {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* New Password */}
          <div className="relative">
            <input type={showPw ? "text" : "password"} placeholder="New Password (min. 8 chars)" required value={password} onChange={e => setPassword(e.target.value)}
              className={`w-full pl-5 pr-12 py-4 text-base rounded-xl bg-white/5 border text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition ${
                password.length === 0 ? "border-white/12 focus:border-orange-500 focus:ring-orange-500/30"
                : password.length >= 8 ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/20"
                : "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              }`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 hover:opacity-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPw
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
            {password.length > 0 && (
              <p className={`text-xs mt-1.5 ml-1 ${password.length >= 8 ? "text-green-400" : "text-red-400"}`}>
                {password.length >= 8 ? "✓ Strong enough" : `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input type={showPw ? "text" : "password"} placeholder="Confirm New Password" required value={confirm} onChange={e => setConfirm(e.target.value)}
              className={`w-full px-5 py-4 text-base rounded-xl bg-white/5 border text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition ${
                confirm.length === 0 ? "border-white/12 focus:border-orange-500 focus:ring-orange-500/30"
                : confirm === password ? "border-green-500/60 focus:border-green-500 focus:ring-green-500/20"
                : "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              }`} />
            {confirm.length > 0 && (
              <p className={`text-xs mt-1.5 ml-1 ${confirm === password ? "text-green-400" : "text-red-400"}`}>
                {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 text-lg rounded-xl font-semibold shadow-xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-base text-gray-400 text-center">
          <Link href="/forgot-password" className="text-orange-400 hover:text-orange-300 font-semibold transition">← Request new link</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
