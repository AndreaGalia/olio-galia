import Link from 'next/link';
import { useT } from '@/hooks/useT';

interface BreadcrumbNavigationProps {
  productName: string;
}

export default function BreadcrumbNavigation({ productName }: BreadcrumbNavigationProps) {
  const { t } = useT();

  return (
    <div className="bg-white/50 pt-8 pb-4">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-black hover:text-olive transition-colors">
            {t.productDetailPage.breadcrumb.home}
          </Link>
          <span className="text-black/50">→</span>
          <Link href="/products" className="text-black hover:text-olive transition-colors">
            {t.productDetailPage.breadcrumb.products}
          </Link>
          <span className="text-black/50">→</span>
          <span className="text-black font-medium">{productName}</span>
        </nav>
      </div>
    </div>
  );
}