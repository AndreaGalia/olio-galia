import { Product } from "@/types/products";
import { getPriceRange } from "@/utils/variantHelpers";

interface HomepageProductCardFooterProps {
  product: Product;
}

export default function HomepageProductCardFooter({ product }: HomepageProductCardFooterProps) {
  const priceRange = getPriceRange(product);

  const priceDisplay = priceRange.hasRange
    ? `da €${priceRange.min.toFixed(2)}`
    : `€${product.price}`;

  return (
    <>
      {/* Riga nome + prezzo */}
      <div className="flex justify-between items-center pt-3 pb-2 gap-2">
        <span className="font-serif termina-11 tracking-[1px] sm:tracking-[3.4px] uppercase text-black whitespace-nowrap truncate">
          {product.name}
        </span>
        <span className="font-serif termina-11 tracking-[2.5px] sm:tracking-[3.4px] uppercase text-black whitespace-nowrap flex-shrink-0">
          {priceDisplay}
        </span>
      </div>

      {/* Linea separatore */}
      <div className="border-t border-olive/20" />
    </>
  );
}
