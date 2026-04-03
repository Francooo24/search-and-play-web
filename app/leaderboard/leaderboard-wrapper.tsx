"use client";
import dynamic from "next/dynamic";

const LeaderboardClient = dynamic(() => import("./leaderboard-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
    </div>
  ),
});

export default function LeaderboardWrapper() {
  return <LeaderboardClient />;
}
