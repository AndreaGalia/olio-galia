import Image from "next/image";
import { Product } from "@/types/products";
import { useT } from "@/hooks/useT";

interface HomepageProductCardImageProps {
  product: Product;
  isOutOfStock: boolean;
  isWaitingList?: boolean;
}

export default function HomepageProductCardImage({ product, isOutOfStock, isWaitingList }: HomepageProductCardImageProps) {
  const { t } = useT();
  const wl = t.waitingList;

  return (
    <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
      <Image
        src={product.images[0]}
        alt={product.name}
        fill
        className={`object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
          isOutOfStock && !isWaitingList ? "grayscale opacity-50" : ""
        }`}
        sizes="(max-width: 640px) 85vw, (max-width: 1200px) 45vw, 31vw"
      />

      {/* Waiting list: overlay fisso — stesso stile sold out */}
      {isWaitingList && (
        <div className="absolute inset-0 flex items-center justify-center bg-olive/70">
          <span className="font-serif termina-11 text-beige tracking-[3.4px] uppercase">
            {wl.badge}
          </span>
        </div>
      )}

      {/* Sold out: overlay sempre visibile */}
      {isOutOfStock && !isWaitingList && (
        <div className="absolute inset-0 flex items-center justify-center bg-olive/70">
          <span className="font-serif termina-11 text-beige tracking-[3.4px] uppercase">
            Sold Out
          </span>
        </div>
      )}
    </div>
  );
}
