"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
      <p className="text-gray-500 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition text-sm"
      >
        Try Again
      </button>
    </div>
  );
}
