"use client";
import { useState, useRef, useEffect } from "react";

interface Props {
  initials: string;
  size?: string;
}

export default function AvatarUpload({ initials, size = "w-24 h-24 md:w-28 md:h-28" }: Props) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (d.avatar) setAvatar(d.avatar); })
      .catch(() => {});
  }, []);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB."); return; }
    setError("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;

      // Resize to max 256x256 using canvas
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = 256;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const resized = canvas.toDataURL("image/jpeg", 0.85);

        setUploading(true);
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: resized }),
        });
        const data = await res.json();
        setUploading(false);
        if (!res.ok) { setError(data.error || "Upload failed."); return; }
        setAvatar(resized);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative shrink-0 group">
      <div
        className={`${size} rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-orange-500/30 cursor-pointer`}
        onClick={() => inputRef.current?.click()}
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white">
            {initials}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          {uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Online dot */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-950" />

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}
