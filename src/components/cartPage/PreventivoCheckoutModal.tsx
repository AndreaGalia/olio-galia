"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/products";
import TorinoCartSummary from "./modals/TorinoCartSummary";
import PreventivoForm from "./modals/PreventivoForm";

interface PreventivoFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  cap: string;
  province: string;
  email: string;
  phone: string;
  notes?: string;
  cart?: { id: string; quantity: number }[];
}

interface PreventivoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PreventivoFormData) => void;
  cart: { id: string; quantity: number }[];
  products: Product[];
  isLoading?: boolean;
}

export default function PreventivoCheckoutModal({
  isOpen,
  onClose,
  onSubmit,
  cart,
  products,
  isLoading = false,
}: PreventivoCheckoutModalProps) {

  // Blocca lo scroll del body quando la modale è aperta
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-beige shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-nocciola/20 relative"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="mb-6 pb-6 border-b-2 border-olive/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-serif text-olive mb-2">
                    Richiedi Preventivo
                  </h2>
                  <p className="text-nocciola text-sm sm:text-base">
                    Compila il form per ricevere un preventivo personalizzato
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="text-nocciola hover:text-olive transition-colors p-2 -mr-2"
                    aria-label="Chiudi"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-olive/5 border border-olive/10 p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-olive mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-nocciola">
                    <p className="font-medium text-olive mb-1">Spedizione in tutta Italia e Europa</p>
                    <p>Riceverai via email un preventivo dettagliato con i costi di spedizione per la tua zona entro 24 ore.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Riepilogo Carrello */}
            <TorinoCartSummary cart={cart} products={products} />

            {/* Form */}
            <PreventivoForm
              onSubmit={onSubmit}
              cart={cart}
              isLoading={isLoading}
              onCancel={onClose}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
