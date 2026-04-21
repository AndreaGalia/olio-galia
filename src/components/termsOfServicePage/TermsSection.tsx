interface TermsSectionProps {
  number: string;
  title: string;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function TermsSection({
  number,
  title,
  isActive,
  onToggle,
  children,
}: TermsSectionProps) {
  return (
    <div className="border-t border-olive/20">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-6 cursor-pointer text-left group"
      >
        <div className="flex-1">
          <p className="font-serif termina-11 tracking-[0.2em] uppercase text-black mb-1.5">
            {number}
          </p>
          <p className="garamond-13 group-hover:text-black transition-colors duration-200">
            {title}
          </p>
        </div>
        <span className="text-black text-lg leading-none mt-1 flex-shrink-0 select-none">
          {isActive ? '−' : '+'}
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-[1200px]' : 'max-h-0'}`}>
        <div className="garamond-13 pb-6 pr-10">
          {children}
        </div>
      </div>
    </div>
  );
}
