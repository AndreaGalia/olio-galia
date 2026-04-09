interface CookieSectionProps {
  number: string;
  title: string;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function CookieSection({
  number,
  title,
  isActive,
  onToggle,
  children,
}: CookieSectionProps) {
  return (
    <div className="border-t border-olive/20">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-6 cursor-pointer text-left group"
      >
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.2em] uppercase text-black/40 mb-1.5">
            {number}
          </p>
          <p className="text-sm text-black/80 leading-relaxed group-hover:text-black transition-colors duration-200">
            {title}
          </p>
        </div>
        <span className="text-black/50 text-lg leading-none mt-1 flex-shrink-0 select-none">
          {isActive ? '−' : '+'}
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-[1200px]' : 'max-h-0'}`}>
        <div className="text-sm text-black/70 leading-relaxed pb-6 pr-10">
          {children}
        </div>
      </div>
    </div>
  );
}
