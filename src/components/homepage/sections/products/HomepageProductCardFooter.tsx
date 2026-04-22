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
      {/* Mobile: nome sopra, prezzo sotto — sm+: nome e prezzo sulla stessa riga */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 pb-2 gap-0.5 sm:gap-2">
        <span className="font-serif termina-11 tracking-[1px] sm:tracking-[3.4px] uppercase text-black line-clamp-2 sm:whitespace-nowrap sm:truncate">
          {product.name}
        </span>
        <span className="font-serif termina-11 tracking-[2.5px] sm:tracking-[3.4px] uppercase text-black whitespace-nowrap sm:flex-shrink-0">
          {priceDisplay}
        </span>
      </div>

      {/* Linea separatore */}
      <div className="border-t border-olive/20" />
    </>
  );
}
