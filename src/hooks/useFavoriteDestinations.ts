import { useState, useEffect, useCallback } from "react";

interface FavoriteDestination {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  userId: string;
}

interface UseFavoriteDestinationsReturn {
  favorites: FavoriteDestination[];
  addToFavorites: (title: string, content: string) => FavoriteDestination;
  removeFromFavorites: (id: number) => void;
  isFavorite: (title: string) => boolean;
  userId: string;
}

const generateUserId = (): string => {
  const existingId = localStorage.getItem("diveUserID");
  if (existingId) return existingId;

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("diveUserID", newId);
  return newId;
};

export const useFavoriteDestinations = (): UseFavoriteDestinationsReturn => {
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);
  const userId = generateUserId();

  useEffect(() => {
    // Load favorites from localStorage on component mount
    const savedFavorites = localStorage.getItem(`favorites_${userId}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [userId]);

  useEffect(() => {
    // Save favorites to localStorage whenever they change
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
  }, [favorites, userId]);

  const addToFavorites = useCallback(
    (title: string, content: string): FavoriteDestination => {
      const newFavorite: FavoriteDestination = {
        id: Date.now(),
        title,
        content,
        timestamp: new Date().toLocaleString(),
        userId,
      };

      setFavorites((prev) => [...prev, newFavorite]);
      return newFavorite;
    },
    [userId]
  );

  const removeFromFavorites = useCallback((id: number): void => {
    setFavorites((prev) => prev.filter((favorite) => favorite.id !== id));
  }, []);

  const isFavorite = useCallback(
    (title: string): boolean => {
      return favorites.some((favorite) => favorite.title === title);
    },
    [favorites]
  );

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    userId,
  };
};