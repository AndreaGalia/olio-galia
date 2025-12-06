// components/sections/hero/VideoBackground.tsx
"use client";

interface VideoBackgroundProps {
  videoUrl?: string;
}

export function VideoBackground({ videoUrl }: VideoBackgroundProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Video placeholder - inserisci qui il tuo video */}
      {videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        // Placeholder fino a quando non carichi il video
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-olive via-salvia to-nocciola" />
      )}

      {/* Overlay gradiente per leggibilità testo */}
      <div className="absolute inset-0 bg-gradient-to-b from-olive/80 via-olive/60 to-olive/80" />

      {/* Vignette effect per focus centrale */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(85,107,47,0.4)_100%)]" />
    </div>
  );
}
