/**
 * OpenAI API configuration and utility functions
 */

// Check if API key is available
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    "OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file."
  );
}

// API configuration
const API_CONFIG = {
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
};

// Error types
export const OpenAIErrorTypes = {
  INVALID_API_KEY: "invalid_api_key",
  RATE_LIMIT: "rate_limit_exceeded",
  INVALID_REQUEST: "invalid_request",
  SERVER_ERROR: "server_error",
  NETWORK_ERROR: "network_error",
  CONFIG_ERROR: "configuration_error",
} as const;

export type OpenAIErrorType =
  (typeof OpenAIErrorTypes)[keyof typeof OpenAIErrorTypes];

export interface OpenAIError extends Error {
  type: OpenAIErrorType;
}

export type ChunkCallback = (chunk: string) => void;
export type ErrorCallback = (error: OpenAIError) => void;
export type CompleteCallback = () => void;

/**
 * Creates a streaming chat completion request
 */
export async function createStreamingCompletion(
  prompt: string,
  onChunk: ChunkCallback,
  onError: ErrorCallback,
  onComplete: CompleteCallback
): Promise<void> {
  if (!prompt) {
    onError({
      type: OpenAIErrorTypes.INVALID_REQUEST,
      message: "Prompt is required",
      name: "Error",
    });
    return;
  }

  if (!OPENAI_API_KEY) {
    onError({
      type: OpenAIErrorTypes.CONFIG_ERROR,
      message:
        "OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.",
      name: "Error",
    });
    return;
  }

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/chat/completions`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let isDone = false;

    while (!isDone) {
      const { done, value } = await reader.read();

      if (done) {
        isDone = true;
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Process complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line.startsWith("data: ")) {
          if (line === "data: [DONE]") {
            isDone = true;
            break;
          }
          try {
            const jsonData = JSON.parse(line.slice(6));
            const content = jsonData.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (parseError) {
            console.warn("Failed to parse streaming response:", parseError);
          }
        }
      }

      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];
    }

    // Ensure we process any remaining content in the buffer
    if (buffer.trim()) {
      const lines = buffer.split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (
          trimmedLine.startsWith("data: ") &&
          trimmedLine !== "data: [DONE]"
        ) {
          try {
            const jsonData = JSON.parse(trimmedLine.slice(6));
            const content = jsonData.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (parseError) {
            console.warn("Failed to parse remaining response:", parseError);
          }
        }
      }
    }

    // Always call onComplete when we're done
    onComplete();
  } catch (error) {
    onError(error as OpenAIError);
  } finally {
    // Ensure the reader is properly closed if it exists
    if (reader) {
      try {
        await reader.cancel();
      } catch (error) {
        console.warn("Error closing reader:", error);
      }
    }
    // Make sure onComplete is called even if there was an error
    onComplete();
  }
}

/**
 * Handles API errors and returns appropriate error objects
 */
async function handleApiError(response: Response): Promise<OpenAIError> {
  const error = new Error() as OpenAIError;

  try {
    const data = await response.json();
    error.message = data.error?.message || "Unknown error occurred";

    switch (response.status) {
      case 401:
        error.type = OpenAIErrorTypes.INVALID_API_KEY;
        break;
      case 429:
        error.type = OpenAIErrorTypes.RATE_LIMIT;
        break;
      case 400:
        error.type = OpenAIErrorTypes.INVALID_REQUEST;
        break;
      case 500:
        error.type = OpenAIErrorTypes.SERVER_ERROR;
        break;
      default:
        error.type = OpenAIErrorTypes.NETWORK_ERROR;
    }
  } catch {
    error.message = "Failed to parse error response";
    error.type = OpenAIErrorTypes.NETWORK_ERROR;
  }

  return error;
}

export default {
  API_CONFIG,
  createStreamingCompletion,
  OpenAIErrorTypes,
};
