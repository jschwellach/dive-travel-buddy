import { useState, useEffect, useCallback } from "react";

const generateUserId = () => {
  const existingId = localStorage.getItem("diveUserID");
  if (existingId) return existingId;

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("diveUserID", newId);
  return newId;
};

export const useRecommendationHistory = () => {
  const [history, setHistory] = useState([]);
  const userId = generateUserId();

  useEffect(() => {
    // Load history from localStorage on component mount
    const savedHistory = localStorage.getItem(`recommendations_${userId}`);
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [userId]);

  const addToHistory = useCallback(
    (preferences, recommendation) => {
      const newHistoryItem = {
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

  const clearHistory = useCallback(() => {
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
