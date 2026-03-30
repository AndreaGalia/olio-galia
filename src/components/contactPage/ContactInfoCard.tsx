interface ContactInfoCardProps {
  title: string;
  value: string;
  description: string;
  onClick?: () => void;
}

export default function ContactInfoCard({ title, value, description, onClick }: ContactInfoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-t border-olive/20 py-6 flex items-start justify-between gap-8 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <span className="text-[11px] tracking-[0.2em] uppercase text-black/40 shrink-0 pt-0.5">{title}</span>
      <div className="text-right">
        <p className="text-sm text-black group-hover:text-olive transition-colors duration-200">{value}</p>
        {description && (
          <p className="text-xs text-black/40 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
