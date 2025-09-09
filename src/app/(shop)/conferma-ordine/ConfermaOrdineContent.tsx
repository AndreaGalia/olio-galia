// app/conferma-ordine/ConfermaOrdineContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useClearCart } from "@/hooks/useCartCleanup";
import OrderHero from "@/components/orderConfirmation/OrderHero";
import OrderNumber from "@/components/orderConfirmation/OrderNumber";
import NextSteps from "@/components/orderConfirmation/NextSteps";
import WhatsAppContact from "@/components/orderConfirmation/WhatsAppContact";
import NavigationButtons from "@/components/orderConfirmation/NavigationButtons";
import OrderFooter from "@/components/orderConfirmation/OrderFooter";

export default function ConfermaOrdineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>("");
  
  // Hook per pulire il carrello
  const clearCartCompletely = useClearCart();

  useEffect(() => {
    const id = searchParams.get("orderId");
    if (id) {
      setOrderId(id);
      // Pulisci il carrello quando l'ordine è confermato
      clearCartCompletely();
    } else {
      // Se non c'è orderId, reindirizza alla home
      router.push("/");
    }
  }, [searchParams, router]); // Rimuovi clearCartCompletely dalle dipendenze


  if (!orderId) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-olive border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige via-sabbia/20 to-beige py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-nocciola/20"
        >
          <OrderHero orderId={orderId} />

          <div className="p-8">
            <OrderNumber orderId={orderId} />

            <NextSteps />

            <WhatsAppContact orderId={orderId} />

            <NavigationButtons />
          </div>
        </motion.div>

        <OrderFooter />
      </div>
    </div>
  );
}