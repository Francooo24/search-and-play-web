import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import LogSearch from "@/components/LogSearch";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";

async function fetchDefinition(word: string) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { cache: "no-store" });
    if (res.status === 404) return null;
    const data = await res.json();
    if (data?.title === "No Definitions Found") return null;
    return data;
  } catch { return null; }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ word?: string }> | { word?: string };
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const word = ((params?.word ?? "") as string).trim();
  if (!word) redirect("/");

  const session = await getServerSession(authOptions);
  let isSaved = false;
  if (session) {
    const userId = (session.user as any).id;
    const { rows } = await pool.query(
      "SELECT id FROM favorite_words WHERE user_id = $1 AND word = $2 LIMIT 1",
      [userId, word]
    );
    isSaved = rows.length > 0;
  }

  const definition = await fetchDefinition(word);
  const phonetic = definition?.[0]?.phonetic ?? "";
  const origin   = definition?.[0]?.origin ?? "";

  return (
    <>
      <LogSearch word={word} />
      <SearchClient
        word={word}
        definition={definition}
        phonetic={phonetic}
        origin={origin}
        isSaved={isSaved}
        isLoggedIn={!!session}
      />
    </>
  );
}
