/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

import { useState, useCallback, useEffect } from "react";
import {
  createStreamingCompletion,
  OpenAIErrorTypes,
  OpenAIError,
} from "../config/openai";
import { DivePreferences } from "../types/diving";
import { logger } from "../utils/logger";

interface UseOpenAIReturn {
  isLoading: boolean;
  error: string | null;
  streamedResponse: string | undefined;
  getRecommendations: (preferences: DivePreferences) => Promise<void>;
  getAdditionalInfo: (title: string, content: string) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing OpenAI API interactions
 */
export function useOpenAI(): UseOpenAIReturn {
  // Enable debug mode for the logger
  useEffect(() => {
    logger.setDebugMode(true);
  }, []);
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

  const logApiResponse = useCallback(
    (
      system: string,
      prompt: string,
      preferences: DivePreferences,
      response: string,
      error?: string
    ) => {
      const debugData = {
        timestamp: new Date().toLocaleString(),
        system,
        prompt,
        preferences,
        response,
      };
      if (error) {
        logger.error("OpenAI", "API Response Error", { ...debugData, error });
      } else {
        logger.debug("OpenAI", "API Response Success", debugData);
      }
    },
    []
  );

  const getAdditionalInfo = useCallback(
    async (title: string, content: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setStreamedResponse("");

      const system = `You are a diving expert that provides detailed additional information about diving destinations.`;

      const prompt = `Based on the following diving destination information, please provide additional details that would be helpful for divers:

      Title: ${title}

      Current Information:
      ${content}

      Please include additional information about:
      - Local diving regulations and requirements
      - Typical visibility conditions
      - Common weather patterns
      - Local dive operators and facilities
      - Transportation and logistics
      - Accommodation options
      - Best diving spots in the area
      - Alternative diving sites nearby
      - Local marine life seasonal patterns
      - Safety considerations and emergency facilities
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
              "An error occurred while getting additional information.";

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
            logger.error("OpenAI", "API Error", {
              error,
              message: errorMessage,
            });
            logApiResponse(
              system,
              prompt,
              {} as DivePreferences,
              "",
              errorMessage
            );
          },
          () => {
            setIsLoading(false);
            logApiResponse(system, prompt, {} as DivePreferences, fullResponse);
          }
        );
      } catch (error) {
        const errorMessage =
          "Failed to get additional information. Please try again.";
        setError(errorMessage);
        logger.error("OpenAI", errorMessage);
        setIsLoading(false);
      }
    },
    [logApiResponse]
  );

  /**
   * Get travel recommendations based on user preferences
   */
  const getRecommendations = useCallback(
    async (preferences: DivePreferences): Promise<void> => {
      reset();
      logger.debug(
        "OpenAI",
        "Starting new recommendation request",
        preferences
      );
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
      Travel Season: ${preferences.season.join(", ")}
      ${
        preferences.regions.length > 0
          ? `Region: ${preferences.regions.join(", ")}`
          : ""
      }
      ${
        preferences.waterTemperature.length > 0
          ? `Water Temperature: ${preferences.waterTemperature.join(", ")}`
          : ""
      }
      ${
        preferences.visibility.length > 0
          ? `Visibility: ${preferences.visibility.join(", ")}`
          : ""
      }
      ${
        preferences.currentStrength.length > 0
          ? `Current Strength: ${preferences.currentStrength.join(", ")}`
          : ""
      }
      ${
        preferences.maxDepth.length > 0
          ? `Max Depth: ${preferences.maxDepth.join(", ")}`
          : ""
      }
      
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
            logger.error("OpenAI", "API Error", {
              error,
              message: errorMessage,
            });
            logApiResponse(system, prompt, preferences, "", errorMessage);
          },
          () => {
            setIsLoading(false);
            logApiResponse(system, prompt, preferences, fullResponse);
          }
        );
      } catch (error) {
        const errorMessage = "Failed to get recommendations. Please try again.";
        setError(errorMessage);
        logger.error("OpenAI", errorMessage);
        setIsLoading(false);
      }
    },
    [reset]
  );

  return {
    isLoading,
    error,
    streamedResponse,
    getRecommendations,
    getAdditionalInfo,
    reset,
  };
}
