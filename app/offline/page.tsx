"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="text-6xl mb-6">📡</div>
      <h1 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
        You&apos;re Offline
      </h1>
      <p className="text-gray-500 text-sm max-w-xs mb-8">
        No internet connection. Check your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition"
      >
        Try Again
      </button>
    </div>
  );
}
