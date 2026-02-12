import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://oliogalia.it';

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/products/${slug}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  const productName = product?.name || 'Prodotto';

  return {
    title: `Abbonamento - ${productName} | OLIO GALIA`,
    description: `Abbonati a ${productName} e ricevilo a casa tua con regolarità. Spedizione inclusa.`,
  };
}

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
