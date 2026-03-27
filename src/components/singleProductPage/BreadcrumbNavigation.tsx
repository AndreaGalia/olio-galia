import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface BreadcrumbNavigationProps {
  productName: string;
}

export default function BreadcrumbNavigation({ productName }: BreadcrumbNavigationProps) {
  const { t } = useT();

  return (
    <nav className="flex items-center gap-2 text-xs tracking-wider">
      <Link href="/" className="text-black/40 hover:text-olive transition-colors uppercase">
        {t.productDetailPage.breadcrumb.home}
      </Link>
      <span className="text-black/30">/</span>
      <Link href="/products" className="text-black/40 hover:text-olive transition-colors uppercase">
        {t.productDetailPage.breadcrumb.products}
      </Link>
      <span className="text-black/30">/</span>
      <span className="text-black/70 uppercase truncate max-w-[120px] sm:max-w-none">{productName}</span>
    </nav>
  );
}