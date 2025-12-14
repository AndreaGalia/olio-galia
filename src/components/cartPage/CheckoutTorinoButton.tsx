// components/CheckoutTorinoButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TorinoCheckoutModal from "./TorinoCheckoutModal";
import CheckoutButton from "./CheckoutButton";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useT } from "@/hooks/useT";

interface CheckoutTorinoButtonProps {
  minimal?: boolean;
}

export default function CheckoutTorinoButton({ minimal = false }: CheckoutTorinoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { translate } = useT();
  
  // Hook per salvare il form
  const { isLoading, error, success, submitForm, reset, data: responseData } = useFormSubmit();

  // Carrello e prodotti
  const { cart, getTotalItems } = useCart();
  const { products } = useProducts();
  const totalItems = getTotalItems();

// Gestisci il successo e reindirizza
useEffect(() => {
  if (success && responseData?.orderId) {
    // Prima fai il redirect
    router.push(`/conferma-ordine?orderId=${responseData.orderId}`);
    
    // Poi chiudi la modale con un piccolo delay per evitare il flash
    setTimeout(() => {
      setIsOpen(false);
      reset();
    }, 600); // 100ms di delay
  }
}, [success, responseData, router, reset]);

  // Gestisci errori
  useEffect(() => {
    if (error) {
      alert(`❌ ${translate('torinoCheckout.modal.errors.submitError', { error })}`);
    }
  }, [error, translate]);

  const handleSubmit = async (formData: any) => {
    
    
    try {
      // Salva su MongoDB e ottieni l'ID dell'ordine
      await submitForm(formData);
    } catch (err) {
      
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    reset(); // Reset dello stato del form
  };

  return (
    <>
      <CheckoutButton
        onClick={() => setIsOpen(true)}
        totalItems={totalItems}
        disabled={totalItems === 0}
        minimal={minimal}
      />

      <TorinoCheckoutModal
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