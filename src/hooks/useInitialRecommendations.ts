/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

import { useState, useEffect } from "react";
import { DivePreferences } from "../types/diving";

const CACHE_KEY = "initialRecommendations";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedData {
  recommendations: string;
  timestamp: number;
}

export function useInitialRecommendations(
  getRecommendations: (preferences: DivePreferences) => Promise<void>
) {
  const [isLoading, setIsLoading] = useState(true);
  const [cachedRecommendations, setCachedRecommendations] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadInitialRecommendations = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);

      if (cachedData) {
        const { recommendations, timestamp } = JSON.parse(
          cachedData
        ) as CachedData;
        const now = Date.now();

        // Check if cache is still valid (less than 24 hours old)
        if (now - timestamp < CACHE_EXPIRY) {
          // Use cached recommendations
          setCachedRecommendations(recommendations);
          setIsLoading(false);
          return;
        }
        // Clear expired cache
        localStorage.removeItem(CACHE_KEY);
      }

      // Generate new initial recommendations
      const initialPreferences = {
        experienceLevel: "Open Water",
        interests: ["Coral Reefs", "Marine Life"],
        season: ["Jun-Aug"],
        waterTemperature: [],
        visibility: [],
        currentStrength: [],
        maxDepth: [],
        regions: [],
      };

      try {
        await getRecommendations(initialPreferences);
      } catch (error) {
        console.error("Error generating initial recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialRecommendations();
  }, [getRecommendations]);

  return { isLoading, cachedRecommendations };
}
