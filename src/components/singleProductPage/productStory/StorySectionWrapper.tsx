interface StorySectionWrapperProps {
  index: number;
  title: string;
  children: React.ReactNode;
}

/**
 * Numbered editorial section wrapper.
 * First section has no top border (the caller provides a page-level separator).
 * Subsequent sections get a `border-t border-black/10` to visually separate them.
 */
export default function StorySectionWrapper({ index, title, children }: StorySectionWrapperProps) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <div className={`py-10 lg:py-14 ${index > 0 ? 'border-t border-black/10' : ''}`}>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-[11px] tracking-[0.2em] text-black/25 tabular-nums select-none shrink-0">
          {number}
        </span>
        <h2 className="text-xs tracking-widest uppercase text-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}
