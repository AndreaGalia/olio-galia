"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/products";
import TorinoModalHeader from "./modals/TorinoModalHeader";
import TorinoInfoSections from "./modals/TorinoInfoSections";
import TorinoCartSummary from "./modals/TorinoCartSummary";
import TorinoForm from "./modals/TorinoForm";

interface TorinoFormData {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phone: string;
  province: string;
  cart?: { id: string; quantity: number }[];
}

interface TorinoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TorinoFormData) => void;
  cart: { id: string; quantity: number }[];
  products: Product[];
  isLoading?: boolean;
}


export default function TorinoCheckoutModal({
  isOpen,
  onClose,
  onSubmit,
  cart,
  products,
  isLoading = false,
}: TorinoCheckoutModalProps) {

  // Blocca lo scroll del body quando la modale è aperta (funziona anche su mobile)
  useEffect(() => {
    if (isOpen) {
      // Salva la posizione corrente dello scroll
      const scrollY = window.scrollY;
      
      // Applica gli stili per bloccare lo scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      // Ripristina la posizione originale
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      
      // Riporta lo scroll alla posizione originale
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup per ripristinare lo scroll quando il componente viene smontato
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
            <TorinoModalHeader onClose={onClose} isLoading={isLoading} />

            <TorinoInfoSections />

            <TorinoCartSummary cart={cart} products={products} />

            <TorinoForm 
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