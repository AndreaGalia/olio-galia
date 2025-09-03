// components/FAQ/BackgroundDecorations.tsx
export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-20 right-12 w-32 h-32 rounded-full bg-olive"></div>
      <div className="absolute bottom-32 left-8 w-24 h-24 rounded-full bg-salvia"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-nocciola"></div>
      <div className="absolute bottom-1/4 right-1/3 w-20 h-20 rounded-full bg-olive/60"></div>
    </div>
  );
}