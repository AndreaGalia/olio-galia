import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function NotFoundState() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-homepage-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-serif text-olive mb-4">{t.productDetailPage.notFound.title}</h1>
        <Link 
          href="/products" 
          className="px-6 py-3 bg-olive text-beige rounded-full hover:bg-olive/80 transition-colors inline-block"
        >
          {t.productDetailPage.notFound.button}
        </Link>
      </div>
    </div>
  );
}