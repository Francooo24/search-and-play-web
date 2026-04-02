"use client";
import { useEffect } from "react";

export default function LogGame({ gameName }: { gameName: string }) {
  useEffect(() => {
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: `Played "${gameName}"` }),
    }).catch(() => {});
  }, [gameName]);

  return null;
}
