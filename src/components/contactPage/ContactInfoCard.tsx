import { ReactNode } from 'react';

interface ContactInfoCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
  onClick?: () => void;
}

export default function ContactInfoCard({ icon, title, value, description, onClick }: ContactInfoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 py-6 border-b border-black/10 ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-olive group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-serif text-black">{title}</span>
      </div>
      <p className="text-sm font-semibold text-black font-sans pl-9">{value}</p>
    </div>
  );
}
