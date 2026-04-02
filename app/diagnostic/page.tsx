"use client";
import { useState } from "react";
import Link from "next/link";

interface Result { ok: boolean; detail: string; }

const LABELS: Record<string, string> = {
  "1_session":          "User Session",
  "2_django":           "Django Backend",
  "3_mysql":            "MySQL Database",
  "4_leaderboard_table":"Leaderboard Table",
  "5_user_scores":      "Your Scores in DB",
  "6_score_submit":     "Score Submission",
  "7_stats_api":        "Stats API",
  "8_email":            "Email Delivery",
};

export default function DiagnosticPage() {
  const [results, setResults] = useState<Record<string, Result> | null>(null);
  const [allOk, setAllOk]     = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [denied, setDenied]   = useState(false);

  async function runTest() {
    setLoading(true); setDenied(false);
    try {
      const res  = await fetch("/api/diagnostic");
      if (res.status === 403) { setDenied(true); setLoading(false); return; }
      const data = await res.json();

      // Also check email delivery
      const emailRes  = await fetch("/api/diagnostic/email-test");
      const emailData = await emailRes.json();
      data.results["8_email"] = {
        ok: emailData.ok,
        detail: emailData.ok ? emailData.message : emailData.error,
      };

      setResults(data.results);
      setAllOk(data.allOk && emailData.ok);
    } catch {
      setResults({ error: { ok: false, detail: "Failed to reach diagnostic API" } });
      setAllOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 min-h-screen">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2">System Check</p>
          <h1 className="text-4xl font-black text-white mb-2">End-to-End Diagnostic</h1>
          <p className="text-gray-500 text-sm">Tests the full score → profile → leaderboard flow</p>
        </div>

        <button
          onClick={runTest}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 rounded-2xl transition mb-6 disabled:opacity-50 text-lg"
        >
          {loading ? "Running tests..." : "▶ Run Diagnostic"}
        </button>

        {denied && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl p-4 text-center font-semibold mb-4">
            🔒 Admin access required. Log in as admin to run diagnostics.
          </div>
        )}

        {results && (
          <>
            <div className={`rounded-2xl p-4 mb-6 text-center font-black text-lg border ${
              allOk
                ? "bg-green-500/15 border-green-500/30 text-green-400"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}>
              {allOk ? "✅ All systems operational" : "⚠️ Some checks failed — see details below"}
            </div>

            <div className="space-y-3">
              {Object.entries(results).map(([key, r]) => (
                <div key={key} className={`rounded-xl p-4 border flex items-start gap-3 ${
                  r.ok
                    ? "bg-green-500/8 border-green-500/20"
                    : "bg-red-500/8 border-red-500/20"
                }`}>
                  <span className="text-xl flex-shrink-0">{r.ok ? "✅" : "❌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${r.ok ? "text-green-300" : "text-red-300"}`}>
                      {LABELS[key] ?? key}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {allOk && (
              <div className="mt-6 bg-[#0f0f18] border border-white/8 rounded-2xl p-5 text-center">
                <p className="text-white font-bold mb-3">Everything is working! Check these pages:</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/profile" className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-500/30 transition">
                    👤 Profile
                  </Link>
                  <Link href="/stats" className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-500/30 transition">
                    📊 Stats
                  </Link>
                  <Link href="/leaderboard" className="bg-orange-500/20 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-500/30 transition">
                    🏆 Leaderboard
                  </Link>
                </div>
              </div>
            )}

            {!allOk && (
              <div className="mt-6 bg-[#0f0f18] border border-white/8 rounded-2xl p-5">
                <p className="text-white font-bold mb-2">How to fix:</p>
                <ul className="space-y-1 text-sm text-gray-400">
                  {!results["1_session"]?.ok && <li>🔒 <Link href="/login" className="text-orange-400 underline">Sign in</Link> then run the test again</li>}
                  {!results["2_django"]?.ok && <li>🐍 Start Django: <code className="bg-white/10 px-1 rounded">cd backend && python manage.py runserver 8000</code></li>}
                  {!results["3_mysql"]?.ok && <li>🗄️ Start MySQL via XAMPP Control Panel</li>}
                  {!results["8_email"]?.ok && <li>📧 Check <code className="bg-white/10 px-1 rounded">EMAIL_USER</code> and <code className="bg-white/10 px-1 rounded">EMAIL_PASS</code> in <code className="bg-white/10 px-1 rounded">web/.env.local</code>. Use a Gmail App Password, not your regular password.</li>}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
