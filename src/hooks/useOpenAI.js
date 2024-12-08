import { useState, useCallback } from "react";
import { createStreamingCompletion, OpenAIErrorTypes } from "../config/openai";

/**
 * Custom hook for managing OpenAI API interactions
 * @returns {Object} Hook methods and state
 */
export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamedResponse, setStreamedResponse] = useState("");

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setStreamedResponse("");
  }, []);

  /**
   * Get travel recommendations based on user preferences
   * @param {Object} preferences User's diving preferences
   * @returns {Promise<void>}
   */
  const getRecommendations = useCallback(
    async (preferences) => {
      reset();
      setIsLoading(true);

      const prompt = `As a diving expert, please recommend the best diving destinations based on these preferences:
      Experience Level: ${preferences.experienceLevel}
      Interests: ${preferences.interests.join(", ")}
      Travel Season: ${preferences.season}
      
      Please provide detailed recommendations including:
      - Specific dive sites
      - Best time to visit
      - Marine life to expect
      - Required certification level
      - Any special considerations
    `;

      try {
        let fullResponse = "";

        await createStreamingCompletion(
          prompt,
          (chunk) => {
            fullResponse += chunk;
            setStreamedResponse(fullResponse);
          },
          (error) => {
            let errorMessage =
              "An error occurred while getting recommendations.";

            switch (error.type) {
              case OpenAIErrorTypes.INVALID_API_KEY:
                errorMessage =
                  "Invalid API key. Please check your configuration.";
                break;
              case OpenAIErrorTypes.RATE_LIMIT:
                errorMessage = "Rate limit exceeded. Please try again later.";
                break;
              case OpenAIErrorTypes.SERVER_ERROR:
                errorMessage =
                  "OpenAI service is currently unavailable. Please try again later.";
                break;
              default:
                errorMessage = error.message || errorMessage;
            }

            setError(errorMessage);
            setIsLoading(false);
            return null;
          },
          () => {
            setIsLoading(false);
          }
        );

        return fullResponse;
      } catch (error) {
        setError("Failed to get recommendations. Please try again.");
        setIsLoading(false);
        return null;
      }
    },
    [reset]
  );

  return {
    isLoading,
    error,
    streamedResponse,
    getRecommendations,
    reset,
  };
}
