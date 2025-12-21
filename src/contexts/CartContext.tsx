"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ShippingZone } from "@/types/shipping";

type CartItem = {
  id: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getItemQuantity: (id: string) => number;
  selectedShippingZone: ShippingZone | null;
  setSelectedShippingZone: (zone: ShippingZone | null) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedShippingZone, setSelectedShippingZone] = useState<ShippingZone | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carica dal localStorage solo sul client
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedZone = localStorage.getItem("selectedShippingZone");

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        setCart([]);
      }
    }

    if (storedZone) {
      try {
        setSelectedShippingZone(JSON.parse(storedZone));
      } catch (error) {
        setSelectedShippingZone(null);
      }
    }

    setIsLoaded(true);
  }, []);

  // Salva sul localStorage quando il carrello cambia
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Salva sul localStorage quando la zona di spedizione cambia
  useEffect(() => {
    if (isLoaded) {
      if (selectedShippingZone) {
        localStorage.setItem("selectedShippingZone", JSON.stringify(selectedShippingZone));
      } else {
        localStorage.removeItem("selectedShippingZone");
      }
    }
  }, [selectedShippingZone, isLoaded]);

  // Reset zona di spedizione quando il carrello diventa vuoto
  useEffect(() => {
    if (cart.length === 0) {
      setSelectedShippingZone(null);
    }
  }, [cart.length]);

  // Memoizza tutte le funzioni con useCallback
  const addToCart = useCallback((id: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { id, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart((prev) => 
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const getTotalItems = useCallback((): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getItemQuantity = useCallback((id: string): number => {
    const item = cart.find((item) => item.id === id);
    return item ? item.quantity : 0;
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getItemQuantity,
      selectedShippingZone,
      setSelectedShippingZone
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};