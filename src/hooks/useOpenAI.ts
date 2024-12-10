import { useState, useCallback } from "react";
import {
  createStreamingCompletion,
  OpenAIErrorTypes,
  OpenAIError,
} from "../config/openai";

interface DivePreferences {
  experienceLevel: string;
  interests: string[];
  season: string;
}

interface DebugInfo {
  timestamp: string;
  system: string;
  prompt: string;
  preferences: DivePreferences;
  response: string;
  error?: string;
}

interface UseOpenAIReturn {
  isLoading: boolean;
  error: string | null;
  streamedResponse: string;
  debugInfo: DebugInfo[];
  getRecommendations: (preferences: DivePreferences) => Promise<string | null>;
  reset: () => void;
}

/**
 * Custom hook for managing OpenAI API interactions
 */
export function useOpenAI(): UseOpenAIReturn {
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedResponse, setStreamedResponse] = useState<string>("");

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setStreamedResponse("");
  }, []);

  const addDebugEntry = useCallback(
    (
      system: string,
      prompt: string,
      preferences: DivePreferences,
      response: string,
      error?: string
    ) => {
      const timestamp = new Date().toLocaleString();
      setDebugInfo((prev) => [
        ...prev,
        { timestamp, system, prompt, preferences, response, error },
      ]);
    },
    []
  );

  /**
   * Get travel recommendations based on user preferences
   */
  const getRecommendations = useCallback(
    async (preferences: DivePreferences): Promise<string | null> => {
      reset();
      setIsLoading(true);

      const system = `You are a diving expert that recommends best diving destinations. Your answers are in Markdown with the following format:
      ---
      ## <Title>
      ---
      ### 1. <Dive Location>
      <Details as list>
      ---
      ### 2. <Dive Location>
      <Details as list>
      ---
      ...
      ---
      <Summary>
      `;

      const prompt = `As a diving expert, please recommend the best diving destinations based on these preferences:
      Experience Level: ${preferences.experienceLevel}
      Interests: ${preferences.interests.join(", ")}
      Travel Season: ${preferences.season}
      
      Please provide detailed recommendations including:
      - Specific dive sites
      - Best time to visit
      - Marine life to expect
      - Required certification level
      - Depth range of the dives
      - Water temperature
      - Any special considerations

      If Beginner is selected, make sure you connect the user with some Dive Centers.
    `;

      try {
        let fullResponse = "";

        await createStreamingCompletion(
          system,
          prompt,
          (chunk) => {
            fullResponse += chunk;
            setStreamedResponse(fullResponse);
          },
          (error: OpenAIError) => {
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
            console.error("OpenAI API error:", error);
            addDebugEntry(system, prompt, preferences, "", errorMessage);
            setIsLoading(false);
            return null;
          },
          () => {
            setIsLoading(false);
          }
        );

        addDebugEntry(system, prompt, preferences, fullResponse);
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
    debugInfo,
    isLoading,
    error,
    streamedResponse,
    getRecommendations,
    reset,
  };
}
