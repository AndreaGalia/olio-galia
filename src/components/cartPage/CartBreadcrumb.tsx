import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function CartBreadcrumb() {
  const { t } = useT();

  return (
    <div className="bg-white/50 py-4">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-black hover:text-olive transition-colors">
            {t.cartPage.breadcrumb.home}
          </Link>
          <span className="text-black/50">→</span>
          <span className="text-black font-medium">
            {t.cartPage.breadcrumb.cart}
          </span>
        </nav>
      </div>
    </div>
  );
}