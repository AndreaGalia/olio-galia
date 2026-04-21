import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function CartBreadcrumb() {
  const { t } = useT();
  return (
    <nav className="flex items-center gap-2 text-xs tracking-wider">
      <Link href="/" className="text-black hover:text-olive transition-colors uppercase">{t.cartPage.breadcrumb.home}</Link>
      <span className="text-black/30">/</span>
      <span className="text-black uppercase">{t.cartPage.breadcrumb.cart}</span>
    </nav>
  );
}
