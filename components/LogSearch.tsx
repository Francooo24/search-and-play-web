"use client";
import { useEffect } from "react";

export default function LogSearch({ word }: { word: string }) {
  useEffect(() => {
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    }).catch(() => {});
  }, [word]);

  return null;
}
