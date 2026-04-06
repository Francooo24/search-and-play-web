"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function getAge(birthdate: string) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeGroup(age: number) {
  if (age <= 12) return "kids";
  if (age <= 17) return "teen";
  return "adult";
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    player_name: "", email: "", password: "", confirm: "", birthdate: "", country: "",
    show_kids: false, show_teen: false, show_adult: false,
  });
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [otpPending, setOtpPending]     = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp]                   = useState("");
  const [otpError, setOtpError]         = useState("");
  const [otpLoading, setOtpLoading]     = useState(false);
  const [otpSuccess, setOtpSuccess]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading]   = useState(false);
  const [resendMsg, setResendMsg]           = useState("");

  const age      = form.birthdate.length === 10 ? getAge(form.birthdate) : null;
  const ageGroup = age !== null && age >= 6 ? getAgeGroup(age) : null;
  const ageError = age !== null && age < 6 ? "You must be at least 6 years old to register." : null;
  const pwMatch  = form.confirm.length === 0 ? null : form.password === form.confirm;

  const strength = form.password.length === 0 ? 0
    : form.password.length < 4 ? 1
    : form.password.length < 8 ? 2
    : form.password.length < 12 ? 3 : 4;
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-green-500"][strength];
  const strengthW     = ["0%", "25%", "50%", "75%", "100%"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwMatch === false) return;
    setLoading(true); setError("");
    const res = await fetch("/api/signup_process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_name:      form.player_name,
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirm,
        birthdate:        form.birthdate,
        country:          form.country,
        show_kids:        form.show_kids,
        show_teen:        form.show_teen,
        show_adult:       form.show_adult,
      }),
    });
    const data = await res.json().catch(() => ({ error: "Server error. Please try again." }));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "An error occurred.");
      return;
    }
    if (data.otp_pending) {
      setPendingEmail(data.pending_email);
      setOtpPending(true);
      return;
    }
    router.push("/");
  };

  const handleResend = async () => {
    setResendLoading(true); setResendMsg(""); setOtpError("");
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });
    const data = await res.json();
    setResendLoading(false);
    if (!res.ok) { setResendMsg(data.error || "Failed to resend."); return; }
    setResendMsg("New code sent! Check your inbox.");
    setOtp("");
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 1000);
  };

  const today = new Date().toISOString().split("T")[0];

  // ── OTP Verify State ──
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true); setOtpError("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, otp }),
    });
    const data = await res.json().catch(() => ({ error: "Server error. Please try again." }));
    setOtpLoading(false);
    if (!res.ok) { setOtpError(data.error || "Invalid OTP."); return; }
    setOtpSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (otpPending) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
          {otpSuccess ? (
            <>
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
              <p className="text-gray-400 text-sm">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Check Your Email</h1>
              <p className="text-gray-400 text-sm mb-1">We sent a 6-digit OTP to:</p>
              <p className="text-orange-400 font-semibold mb-8">{pendingEmail}</p>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP"
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition"
                  required
                />
                {otpError && <p className="text-red-400 text-sm">{otpError}</p>}
                <p className="text-gray-500 text-xs">Code expires in 10 minutes.</p>
                <button type="submit" disabled={otpLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold shadow-xl hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {otpLoading ? "Verifying..." : "Verify & Create Account"}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {resendMsg && (
                    <p className={`text-xs mb-2 ${resendMsg.includes("sent") ? "text-green-400" : "text-red-400"}`}>{resendMsg}</p>
                  )}
                  <button type="button" onClick={handleResend}
                    disabled={resendCooldown > 0 || resendLoading}
                    className="text-sm text-orange-400 hover:text-orange-300 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold">
                    {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-sm text-gray-500">
                Wrong email?{" "}
                <button onClick={() => { setOtpPending(false); setOtp(""); setOtpError(""); }}
                  className="text-orange-400 hover:text-orange-300 font-semibold transition">Sign up again</button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[10px] flex items-center justify-center z-50" onClick={() => setError("")}>
          <div className="glass-card border-l-[5px] border-l-orange-500 rounded-3xl p-10 max-w-md w-[92%] text-center" onClick={e => e.stopPropagation()}>
            <svg className="w-20 h-20 mx-auto mb-6 text-orange-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-4">Sign Up Error</h2>
            <p className="text-gray-300 mb-8">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setError("")} className="flex-1 border-2 border-orange-500 text-white py-3.5 rounded-xl font-semibold hover:bg-orange-500/10 transition">Try Again</button>
              <Link href="/login" className="flex-1 bg-gradient-to-r from-orange-600 to-amber-700 text-white py-3.5 rounded-xl font-semibold text-center hover:from-orange-700 hover:to-amber-800 transition">Sign In</Link>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center" style={{ animation: "fadeInUp 0.8s ease-out" }}>
        <svg className="w-16 h-16 mx-auto mb-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Create Account</h1>
        <p className="text-lg text-gray-300 mb-10">Start your vocabulary journey</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">

          {/* Birthdate */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <input type="date" required max={today}
              value={form.birthdate} onChange={e => setForm({ ...form, birthdate: e.target.value })}
              className="w-full pl-12 pr-5 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
          </div>

          {/* Age Group Preview */}
          {ageError && (
            <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2">
              ❌ {ageError}
            </div>
          )}
          {ageGroup && !ageError && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Your Age Group</p>
              <div className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                ageGroup === "kids"  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                ageGroup === "teen"  ? "bg-green-500/10 border-green-500/30 text-green-400" :
                                       "bg-orange-500/10 border-orange-500/30 text-orange-400"
              }`}>
                {ageGroup === "kids" ? "🧒 Kids (Ages 6–12)" :
                 ageGroup === "teen" ? "🧑 Teen (Ages 13–17)" :
                                      "🔞 Adult (Ages 18+)"}
              </div>
            </div>
          )}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input type="text" placeholder="Player Name" required value={form.player_name} onChange={e => setForm({ ...form, player_name: e.target.value })}
              className="w-full pl-12 pr-5 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
          </div>

          {/* Country */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /></svg>
            </div>
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
              className="w-full pl-12 pr-5 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition appearance-none">
              <option value="" className="bg-[#1a1a2e]">🌍 Select Country (optional)</option>
              <option value="PH" className="bg-[#1a1a2e]">🇵🇭 Philippines</option>
              <option value="US" className="bg-[#1a1a2e]">🇺🇸 United States</option>
              <option value="GB" className="bg-[#1a1a2e]">🇬🇧 United Kingdom</option>
              <option value="AU" className="bg-[#1a1a2e]">🇦🇺 Australia</option>
              <option value="CA" className="bg-[#1a1a2e]">🇨🇦 Canada</option>
              <option value="GR" className="bg-[#1a1a2e]">🇬🇷 Greece</option>
              <option value="DE" className="bg-[#1a1a2e]">🇩🇪 Germany</option>
              <option value="FR" className="bg-[#1a1a2e]">🇫🇷 France</option>
              <option value="JP" className="bg-[#1a1a2e]">🇯🇵 Japan</option>
              <option value="KR" className="bg-[#1a1a2e]">🇰🇷 South Korea</option>
              <option value="IN" className="bg-[#1a1a2e]">🇮🇳 India</option>
              <option value="SG" className="bg-[#1a1a2e]">🇸🇬 Singapore</option>
              <option value="MY" className="bg-[#1a1a2e]">🇲🇾 Malaysia</option>
              <option value="ID" className="bg-[#1a1a2e]">🇮🇩 Indonesia</option>
              <option value="TH" className="bg-[#1a1a2e]">🇹🇭 Thailand</option>
              <option value="VN" className="bg-[#1a1a2e]">🇻🇳 Vietnam</option>
              <option value="BR" className="bg-[#1a1a2e]">🇧🇷 Brazil</option>
              <option value="MX" className="bg-[#1a1a2e]">🇲🇽 Mexico</option>
              <option value="ZA" className="bg-[#1a1a2e]">🇿🇦 South Africa</option>
              <option value="NG" className="bg-[#1a1a2e]">🇳🇬 Nigeria</option>
            </select>
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <input type="email" placeholder="Email Address" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full pl-12 pr-5 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input type={showPw ? "text" : "password"} placeholder="Password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
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

          {/* Strength Bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: strengthW }} />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 pointer-events-none">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input type={showCPw ? "text" : "password"} placeholder="Confirm Password" required value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
              className="w-full pl-12 pr-12 py-4 text-base rounded-xl bg-white/5 border border-white/12 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/30 transition" />
            <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 opacity-70 hover:opacity-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showCPw
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
          </div>

          {pwMatch !== null && (
            <p className={`text-sm ${pwMatch ? "text-green-400" : "text-red-400"}`}>
              {pwMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          <p className="text-xs text-gray-400">Password must be at least 8 characters</p>

          {/* Extra Games Options */}
          {ageGroup && !ageError && (
            <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 space-y-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Also show games from other age groups?</p>
              {ageGroup !== "kids" && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.show_kids} onChange={e => setForm({ ...form, show_kids: e.target.checked })} className="w-4 h-4 accent-blue-500 cursor-pointer" />
                  <span className="text-sm text-blue-300 group-hover:text-blue-200 transition">🧒 Kids Games <span className="text-gray-500">(Ages 6–12)</span></span>
                </label>
              )}
              {ageGroup !== "teen" && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.show_teen} onChange={e => setForm({ ...form, show_teen: e.target.checked })} className="w-4 h-4 accent-green-500 cursor-pointer" />
                  <span className="text-sm text-green-300 group-hover:text-green-200 transition">🧑 Teen Games <span className="text-gray-500">(Ages 13–17)</span></span>
                </label>
              )}
              {ageGroup !== "adult" && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form.show_adult} onChange={e => setForm({ ...form, show_adult: e.target.checked })} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                  <span className="text-sm text-orange-300 group-hover:text-orange-200 transition">🔞 Adult Games <span className="text-gray-500">(Ages 18+)</span></span>
                </label>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || pwMatch === false || !!ageError}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 text-lg rounded-xl font-semibold shadow-xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed mt-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-base text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-400 hover:text-orange-300 hover:underline font-semibold transition">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
