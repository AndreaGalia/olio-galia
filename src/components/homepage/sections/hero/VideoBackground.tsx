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

      {/* Filtro verde leggero */}
      <div className="absolute inset-0 bg-olive/20" />
    </div>
  );
}
