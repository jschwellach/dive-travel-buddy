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

const loadFavoritesFromStorage = (userId: string): FavoriteDestination[] => {
  try {
    const savedFavorites = localStorage.getItem(`favorites_${userId}`);
    if (savedFavorites) {
      return JSON.parse(savedFavorites);
    }
  } catch (error) {
    console.error("Error loading favorites:", error);
  }
  return [];
};

const saveFavoritesToStorage = (
  userId: string,
  favorites: FavoriteDestination[]
): void => {
  try {
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
};

export const useFavoriteDestinations = (): UseFavoriteDestinationsReturn => {
  const userId = generateUserId();
  const [favorites, setFavorites] = useState<FavoriteDestination[]>(() =>
    loadFavoritesFromStorage(userId)
  );

  useEffect(() => {
    // Save favorites to localStorage whenever they change
    saveFavoritesToStorage(userId, favorites);
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

      setFavorites((prev) => {
        // Prevent duplicates
        if (prev.some((f) => f.title === title)) {
          return prev;
        }
        return [...prev, newFavorite];
      });
      return newFavorite;
    },
    [userId]
  );

  const removeFromFavorites = useCallback((id: number): void => {
    if (typeof id !== "number") {
      console.error("Invalid ID provided to removeFromFavorites:", id);
      return;
    }
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
