// components/PreventivoCheckoutButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PreventivoCheckoutModal from "./PreventivoCheckoutModal";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useT } from "@/hooks/useT";

export default function PreventivoCheckoutButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { translate } = useT();

  // Hook per salvare il form
  const { isLoading, error, success, submitForm, reset, data: responseData } = useFormSubmit();

  // Carrello e prodotti
  const { cart, getTotalItems, clearCart } = useCart();
  const { products } = useProducts();
  const totalItems = getTotalItems();

  // Gestisci il successo e reindirizza
  useEffect(() => {
    if (success && responseData?.orderId) {
      // Svuota il carrello
      clearCart();

      // Prima fai il redirect
      router.push(`/conferma-ordine?orderId=${responseData.orderId}`);

      // Poi chiudi la modale con un piccolo delay per evitare il flash
      setTimeout(() => {
        setIsOpen(false);
        reset();
      }, 600);
    }
  }, [success, responseData, router, reset, clearCart]);

  // Gestisci errori
  useEffect(() => {
    if (error) {
      alert(`❌ ${error}`);
    }
  }, [error]);

  const handleSubmit = async (formData: any) => {
    try {
      // Salva su MongoDB usando la stessa API di Torino
      await submitForm({
        ...formData,
        type: 'italia_delivery', // Tipo diverso per distinguere
      });
    } catch (err) {
      // Errore gestito dall'hook
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    reset(); // Reset dello stato del form
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={totalItems === 0}
        className="w-full py-4 bg-olive text-beige font-serif termina-11 tracking-[0.25em] uppercase transition-all duration-300 cursor-pointer hover:bg-sabbia hover:text-olive border border-olive disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Richiedi Preventivo
      </button>

      <PreventivoCheckoutModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        cart={cart}
        products={products}
        isLoading={isLoading}
      />
    </>
  );
}
