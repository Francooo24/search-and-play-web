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
    <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
      <div
        className="glass-card border-l-[5px] border-l-orange-500 rounded-[1.75rem] p-12 max-w-[480px] w-[92%] text-center"
        style={{ animation: "fadeInUp 0.8s ease-out" }}
      >
        {/* Lock Icon */}
        <div className="w-[90px] h-[90px] mx-auto mb-8 bg-orange-500/10 rounded-full flex items-center justify-center border-2 border-orange-500/25 shadow-[0_0_30px_rgba(249,115,22,0.25)]">
          <svg
            className="w-12 h-12 text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sign In Required
        </h1>
        <p className="text-lg text-gray-300 mb-10 max-w-md mx-auto">
          You need to be signed in to access this page and save your progress.
        </p>

        {/* Sign In Button */}
        <Link
          href={`/login${fromParam}`}
          className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white px-12 py-5 rounded-2xl text-xl font-semibold shadow-xl hover:from-orange-600 hover:to-amber-600 hover:-translate-y-1 transition"
        >
          Sign In Now
        </Link>

        {/* Sign Up Link */}
        <p className="mt-8 text-base text-gray-400">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="text-orange-400 hover:text-orange-300 font-semibold transition hover:underline"
          >
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
