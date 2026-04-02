"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep]         = useState<1 | 2 | 3>(1);
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const inputRefs               = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setStep(2);
    } catch {
      setLoading(false);
      setError("Failed to connect. Please try again.");
    }
  };

  // ── Step 2: Verify OTP ──
  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code."); return; }
    setLoading(true); setError("");
    const res  = await fetch("/api/forgot-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep(3);
  };

  // ── Step 3: Reset Password ──
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    const res  = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp.join(""), password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setSuccess(true);
  };

  // ── Step indicator ──
  const steps = ["Email", "Verify", "Password"];

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
      <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-10 max-w-[480px] w-[92%]" style={{ animation: "fadeInUp 0.8s ease-out" }}>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((label, i) => {
            const n       = i + 1;
            const active  = step === n;
            const done    = step > n;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    done   ? "bg-green-500 text-white" :
                    active ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30" :
                             "bg-white/10 text-gray-500"
                  }`}>
                    {done ? "✓" : n}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-orange-400" : done ? "text-green-400" : "text-gray-600"}`}>{label}</span>
                </div>
                {i < 2 && <div className={`w-12 h-px mb-5 mx-1 ${step > n ? "bg-green-500" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <svg className="w-11 h-11 mx-auto text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Forgot Password</h1>
              <p className="text-gray-400 text-sm mt-1">Enter your email to receive a verification code.</p>
            </div>
            {error && <p className="mb-4 text-red-400 text-sm text-center">{error}</p>}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold shadow-xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50">
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
            <p className="mt-5 text-sm text-gray-400 text-center">
              Remember your password?{" "}
              <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition">Sign in</Link>
            </p>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <svg className="w-11 h-11 mx-auto text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Enter Code</h1>
              <p className="text-gray-400 text-sm mt-1">We sent a 6-digit code to</p>
              <p className="text-orange-400 font-semibold text-sm">{email}</p>
            </div>
            {error && <p className="mb-4 text-red-400 text-sm text-center">{error}</p>}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/12 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition"
                  />
                ))}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold shadow-xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50">
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
            <div className="mt-5 flex items-center justify-between text-sm">
              <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); }} className="text-gray-400 hover:text-gray-300 transition">← Change email</button>
              <button onClick={handleSendOtp} disabled={loading} className="text-orange-400 hover:text-orange-300 font-semibold transition disabled:opacity-50">Resend code</button>
            </div>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <svg className="w-11 h-11 mx-auto text-orange-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>New Password</h1>
              <p className="text-gray-400 text-sm mt-1">Set a new password for your account.</p>
            </div>
            {error && <p className="mb-4 text-red-400 text-sm text-center">{error}</p>}
            <form onSubmit={handleReset} className="space-y-4">
              {/* Password */}
              <div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} placeholder="New Password (min. 8 chars)" required value={password} onChange={e => setPassword(e.target.value)}
                    className={`w-full pl-5 pr-12 py-4 rounded-xl bg-white/5 border text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition ${
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
                </div>
                {password.length > 0 && (
                  <p className={`text-xs mt-1.5 ml-1 ${password.length >= 8 ? "text-green-400" : "text-red-400"}`}>
                    {password.length >= 8 ? "✓ Strong enough" : `${8 - password.length} more character${8 - password.length !== 1 ? "s" : ""} needed`}
                  </p>
                )}
              </div>
              {/* Confirm */}
              <div>
                <input type={showPw ? "text" : "password"} placeholder="Confirm New Password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl bg-white/5 border text-white placeholder-gray-400 focus:outline-none focus:ring-4 transition ${
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold shadow-xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
