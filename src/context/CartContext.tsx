'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ProductItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductItem, cantidad?: number, notas?: string) => { success: boolean; requiresReset?: boolean; currentBusinessName?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  businessId: string | null;
  businessName: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'uninorte_marketplace_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde LocalStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Error leyendo carrito:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar en LocalStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error guardando carrito:', e);
      }
    }
  }, [items, isLoaded]);

  const businessId = items.length > 0 ? items[0].product.businessId : null;
  const businessName = items.length > 0 ? items[0].product.business?.nombre || 'Emprendimiento' : null;

  const addItem = (product: ProductItem, cantidad: number = 1, notas?: string) => {
    // Verificar si el carrito tiene productos de otro negocio
    if (items.length > 0 && items[0].product.businessId !== product.businessId) {
      return {
        success: false,
        requiresReset: true,
        currentBusinessName: items[0].product.business?.nombre || 'otro negocio',
      };
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].cantidad += cantidad;
        if (notas) updated[existingIndex].notas = notas;
        return updated;
      } else {
        return [...prevItems, { product, cantidad, notas }];
      }
    });

    return { success: true };
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

  const subtotal = items.reduce((sum, item) => {
    const precioEfectivo =
      item.product.esOferta && item.product.precioOferta
        ? item.product.precioOferta
        : item.product.precio;
    return sum + precioEfectivo * item.cantidad;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        businessId,
        businessName,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
}
