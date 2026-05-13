import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface WaitingListBadgeProps {
  slug: string;
}

// Bottone sotto la card: rimanda alla pagina prodotto per iscriversi alla lista
export default function WaitingListBadge({ slug }: WaitingListBadgeProps) {
  const { t } = useT();
  const wl = t.waitingList;

  return (
    <Link
      href={`/products/${slug}`}
      className="block w-full mt-2 py-2.5 text-center font-serif termina-card tracking-[1px] sm:tracking-[3.4px] uppercase whitespace-nowrap cursor-pointer transition-all duration-200 border border-olive/40 bg-transparent text-black/60 hover:border-olive hover:text-black"
    >
      {wl.form.submitButton}
    </Link>
  );
}
