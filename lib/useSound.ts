import { useCallback } from "react";

function playTone(type: "correct" | "wrong") {
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
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {}
}

export function useSound() {
  const play = useCallback((type: "correct" | "wrong") => {
    playTone(type);
    // Dispatch global event so GlobalSoundManager also knows
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("answer-result", { detail: { type } }));
    }
  }, []);

  return {
    playCorrect: () => play("correct"),
    playWrong:   () => play("wrong"),
  };
}

// Standalone functions for games that don't use the hook
export function playCorrectSound() { playTone("correct"); }
export function playWrongSound()   { playTone("wrong"); }
