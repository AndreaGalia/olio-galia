import ProductReviewsSummaryCard from './ProductReviewsSummaryCard';

interface ProductDetailsCardsProps {
  productSlug: string;
}

export default function ProductDetailsCards({
  productSlug
}: ProductDetailsCardsProps) {
  return (
    <div className="mb-16">
      <ProductReviewsSummaryCard productSlug={productSlug} />
    </div>
  );
}