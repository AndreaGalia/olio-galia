"use client";

import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useT } from "@/hooks/useT";
import {
  VisaMonoIcon,
  MastercardMonoIcon,
  MaestroMonoIcon,
  AmericanExpressMonoIcon,
} from "react-svg-credit-card-payment-icons";

// The package renders dark (#393939) icons — invert to white, then reduce opacity
// to blend naturally with the olive background as soft beige
const monoStyle: React.CSSProperties = {
  filter: "brightness(0) invert(1)",
  opacity: 0.65,
};

// ─── Custom icons (not covered by the package) ────────────────────────────────

const ApplePayIcon = () => (
  <div className="flex items-center gap-1.5">
    {/* Apple logo — MIT-licensed path from Simple Icons */}
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-auto">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
    <span className="text-[12px] font-medium">Pay</span>
  </div>
);

const GooglePayIcon = () => (
  <div className="flex items-center gap-1.5">
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-auto">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="10"
        y="14.5"
        fontSize="9.5"
        fontWeight="bold"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        G
      </text>
    </svg>
    <span className="text-[12px] font-medium">Pay</span>
  </div>
);

const SepaIcon = () => (
  <div className="flex items-center gap-1.5">
    {/* 12-dot EU-style stars circle */}
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={10 + 7 * Math.cos(rad)}
            cy={10 + 7 * Math.sin(rad)}
            r="1.2"
          />
        );
      })}
    </svg>
    <span className="text-[11px] font-bold tracking-[0.18em]">SEPA</span>
  </div>
);

const StripeIcon = () => (
  <div className="flex items-center gap-1.5">
    {/* Stripe "S" mark — MIT-licensed path from Simple Icons */}
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-auto">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
    <span className="text-[11px] tracking-[0.15em] uppercase">Stripe</span>
  </div>
);

// ─── Payment methods list ─────────────────────────────────────────────────────

const paymentMethods = [
  {
    id: "visa",
    label: "Visa",
    Icon: () => <VisaMonoIcon width={52} style={monoStyle} />,
  },
  {
    id: "mastercard",
    label: "Mastercard",
    Icon: () => <MastercardMonoIcon width={48} style={monoStyle} />,
  },
  {
    id: "maestro",
    label: "Maestro",
    Icon: () => <MaestroMonoIcon width={48} style={monoStyle} />,
  },
  {
    id: "amex",
    label: "American Express",
    Icon: () => <AmericanExpressMonoIcon width={52} style={monoStyle} />,
  },
  { id: "applepay",  label: "Apple Pay",       Icon: ApplePayIcon },
  { id: "googlepay", label: "Google Pay",      Icon: GooglePayIcon },
  { id: "sepa",      label: "SEPA",            Icon: SepaIcon },
  { id: "stripe",    label: "Stripe",          Icon: StripeIcon },
];

// Triplicate so Embla always has enough slides to fill the viewport seamlessly
const slides = [...paymentMethods, ...paymentMethods, ...paymentMethods];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentMethodsStrip() {
  const { t } = useT();

  const autoplay = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
    [autoplay.current]
  );

  return (
    <div className="border-t border-beige/20 py-6">
      <div className="space-y-4">

        {/* Label */}
        <div className="flex items-center justify-center gap-2">
          <svg
            className="w-3 h-3 text-beige/40"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-beige/40 text-[10px] tracking-[0.3em] uppercase">
            {t.footer.payment.title}
          </span>
        </div>

        {/* Embla carousel
            Gap technique: negative margin on the container + padding on each
            slide wrapper — this is Embla's recommended approach for loop mode,
            ensuring the gap is preserved at the loop seam on all screen sizes. */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-3 flex items-center">
            {slides.map(({ id, label, Icon }, index) => (
              <div key={`${id}-${index}`} className="pl-3 flex-none">
                <div
                  title={label}
                  className="flex items-center justify-center bg-beige/10 border border-beige/20 rounded px-4 py-2.5 text-beige/65 hover:text-beige/90 hover:bg-beige/[0.16] hover:border-beige/35 transition-all duration-300 h-11 min-w-[96px] cursor-grab active:cursor-grabbing select-none"
                >
                  <Icon />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
