import { redirect } from "next/navigation";

export default function GreekResultPage({ searchParams }: { searchParams: any }) {
  const word = searchParams?.word ?? "";
  redirect(word ? `/search?word=${encodeURIComponent(word)}` : "/");
}
