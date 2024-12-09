import { useState, useEffect, useCallback } from "react";
import { DivePreferences } from "../types/diving";

interface HistoryItem {
  id: number;
  preferences: DivePreferences;
  recommendation: string;
  timestamp: string;
  userId: string;
}

interface UseRecommendationHistoryReturn {
  history: HistoryItem[];
  addToHistory: (
    preferences: DivePreferences,
    recommendation: string
  ) => HistoryItem;
  clearHistory: () => void;
  userId: string;
}

const generateUserId = (): string => {
  const existingId = localStorage.getItem("diveUserID");
  if (existingId) return existingId;

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("diveUserID", newId);
  return newId;
};

export const useRecommendationHistory = (): UseRecommendationHistoryReturn => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const userId = generateUserId();

  useEffect(() => {
    // Load history from localStorage on component mount
    const savedHistory = localStorage.getItem(`recommendations_${userId}`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [userId]);

  const addToHistory = useCallback(
    (preferences: DivePreferences, recommendation: string): HistoryItem => {
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        preferences,
        recommendation,
        timestamp: new Date().toLocaleString(),
        userId,
      };

      setHistory((prevHistory) => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        localStorage.setItem(
          `recommendations_${userId}`,
          JSON.stringify(updatedHistory)
        );
        return updatedHistory;
      });

      return newHistoryItem;
    },
    [userId]
  );

  const clearHistory = useCallback((): void => {
    setHistory([]);
    localStorage.removeItem(`recommendations_${userId}`);
  }, [userId]);

  return {
    history,
    addToHistory,
    clearHistory,
    userId,
  };
};
