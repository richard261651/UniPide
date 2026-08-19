'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { ProductItem } from '@/types';

interface FavoritesContextType {
  favoriteIds: Set<string>;
  favoriteProducts: ProductItem[];
  loading: boolean;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteProducts, setFavoriteProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavoriteProducts([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(new Set(data.favoriteProductIds || []));
        setFavoriteProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error al cargar favoritos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    // Optimistic UI update
    const isCurrentlyFav = favoriteIds.has(productId);
    const newSet = new Set(favoriteIds);
    if (isCurrentlyFav) {
      newSet.delete(productId);
    } else {
      newSet.add(productId);
    }
    setFavoriteIds(newSet);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        // Rollback on error
        fetchFavorites();
        return false;
      }

      const data = await res.json();
      fetchFavorites();
      return Boolean(data.isFavorite);
    } catch (err) {
      console.error('Error al alternar favorito:', err);
      fetchFavorites();
      return false;
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteIds.has(productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteProducts,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe ser usado dentro de un FavoritesProvider');
  }
  return context;
}
