interface PrivacySectionProps {
  number: string;
  title: string;
  content: string;
  list?: string[];
  isActive: boolean;
  onToggle: () => void;
}

export default function PrivacySection({
  number,
  title,
  content,
  list,
  isActive,
  onToggle,
}: PrivacySectionProps) {
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

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="garamond-13 pb-6 pr-10 space-y-3">
          <p>{content}</p>
          {list && list.length > 0 && (
            <ul className="space-y-1.5 mt-2">
              {list.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
