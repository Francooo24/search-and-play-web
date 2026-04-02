"use client";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-black">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-black text-white mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={reset}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
