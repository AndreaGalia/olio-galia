export function JustifiedWord({ text, className, gap }: { text: string; className?: string; gap?: string }) {
  const justify = gap ? `justify-center ${gap}` : 'justify-between';
  return (
    <div className={`flex w-full ${justify} ${className ?? ''}`}>
      {text.split('').map((char, i) => (
        <span key={i}>{char}</span>
      ))}
    </div>
  );
}
