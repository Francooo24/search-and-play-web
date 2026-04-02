"use client";
import { useState, useEffect } from "react";

type Props = {
  text: string;
  lang: string;
  label: string;
};

declare const responsiveVoice: any;

export default function AudioButton({ text, lang, label }: Props) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis)
      window.speechSynthesis.getVoices();
  }, []);

  function speakWithWebSpeech() {
    if (typeof window === "undefined" || !window.speechSynthesis) { setPlaying(false); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = lang === "el" ? "el-GR" : "en-US";
    utter.rate  = 0.9;
    utter.onstart = () => setPlaying(true);
    utter.onend   = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find(v => v.lang === (lang === "el" ? "el-GR" : "en-US")) ??
        voices.find(v => v.lang.startsWith(lang === "el" ? "el" : "en"));
      if (match) utter.voice = match;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length > 0) doSpeak();
    else window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  }

  function speakWithResponsiveVoice() {
    if (typeof responsiveVoice === "undefined" || !responsiveVoice.voiceSupport()) {
      speakWithWebSpeech();
      return;
    }
    const voice = lang === "el" ? "Greek Female" : "UK English Female";
    responsiveVoice.speak(text, voice, {
      onend:   () => setPlaying(false),
      onerror: () => { setPlaying(false); speakWithWebSpeech(); },
    });
  }

  async function speak() {
    if (playing) return;
    setPlaying(true);
    // Primary: Server TTS proxy (Google tw-ob) — works for Greek without any CDN
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`);
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      if (!blob.size) throw new Error("Empty audio");
      const url   = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); setPlaying(false); };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setPlaying(false);
        speakWithResponsiveVoice();
      };
      await audio.play();
    } catch {
      setPlaying(false);
      // Fallback: ResponsiveVoice → Web Speech API
      speakWithResponsiveVoice();
    }
  }

  return (
    <button
      onClick={speak}
      disabled={playing}
      className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-orange-500/20 text-amber-300 text-sm transition disabled:opacity-50"
    >
      {playing ? "⏳" : "🔊"} {label}
    </button>
  );
}
