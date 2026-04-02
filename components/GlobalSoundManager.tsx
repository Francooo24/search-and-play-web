"use client";
import { useEffect } from "react";

function playTone(type: "correct" | "wrong" | "saved") {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "correct") {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.frequency.setValueAtTime(784, ctx.currentTime);
      osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {}
}

export default function GlobalSoundManager() {
  useEffect(() => {
    // Score saved chime
    const onScoreSaved = (e: Event) => {
      const { result } = (e as CustomEvent).detail;
      if (result?.saved) playTone("saved");
    };

    // Answer correct/wrong sounds from games using useSound hook
    const onAnswerResult = (e: Event) => {
      const { type } = (e as CustomEvent).detail;
      if (type === "correct" || type === "wrong") playTone(type);
    };

    window.addEventListener("score-saved", onScoreSaved);
    window.addEventListener("answer-result", onAnswerResult);
    return () => {
      window.removeEventListener("score-saved", onScoreSaved);
      window.removeEventListener("answer-result", onAnswerResult);
    };
  }, []);

  return null;
}
