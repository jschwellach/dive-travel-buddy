import { useState, useEffect } from "react";
import { useOpenAI } from "./hooks/useOpenAI";
import { useRecommendationHistory } from "./hooks/useRecommendationHistory";
import { useFavoriteDestinations } from "./hooks/useFavoriteDestinations";
import "./App.css";
import { RecommendationCard } from "./components/RecommendationCard";
import { DebugPanel } from "./components/DebugPanel";
import "./components/RecommendationCard.css";

import { DivePreferences} from './types/diving';
import { AdditionalPreferences } from "./components/AdditionalPreferences";

interface ExperienceLevels {
  [key: string]: string;
}

function App() {
  const [preferences, setPreferences] = useState<DivePreferences>({
    experienceLevel: "",
    interests: [],
    season: "",
    waterTemperature: "",
    visibility: "",
    currentStrength: "",
    maxDepth: ""
  });

  const { isLoading, error, streamedResponse, debugInfo, getRecommendations } =
    useOpenAI();
  const { history, addToHistory, clearHistory } = useRecommendationHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoriteDestinations();

  // Update history when streamedResponse changes
  useEffect(() => {
    if (streamedResponse && streamedResponse.trim() !== "" && !isLoading) {
      addToHistory({ ...preferences }, streamedResponse);
    }
  }, [streamedResponse, isLoading, preferences, addToHistory]);

  const experienceLevels: ExperienceLevels = {
    "Open Water": "Basic certification (PADI/SSI Open Water Diver or equivalent)",
    "Advanced": "Advanced certification (PADI/SSI Advanced Open Water or equivalent)",
    "Rescue": "Rescue Diver certification (PADI/SSI Rescue Diver or equivalent)",
    "Professional": "Professional level (Divemaster/Instructor or equivalent)",
    "Technical": "Technical diving certification (TDI/PADI Tec certifications)"
  };

  const handlePreferenceChange = (type: keyof DivePreferences, value: string): void => {
    setPreferences((prev) => {
      if (type === "interests") {
        const newInterests = prev.interests.includes(value)
          ? prev.interests.filter((i) => i !== value)
          : [...prev.interests, value];
        return { ...prev, interests: newInterests };
      }
      return { ...prev, [type]: value };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !preferences.experienceLevel ||
      preferences.interests.length === 0 ||
      !preferences.season
    ) {
      alert("Please select all preferences");
      return;
    }
    await getRecommendations(preferences);
  };

  const handleToggleFavorite = (title: string, content: string) => {
    const favorite = favorites.find(f => f.title === title);
    if (favorite) {
      removeFromFavorites(favorite.id);
    } else {
      addToFavorites(title, content);
    }
  };

  const extractSummary = (text: string): { summary: string, remainingText: string } => {
    const locationStart = text.match(/(?=###|\d+\.\s+(?:\*\*|[A-Z]))/m);
    if (!locationStart) {
      return { summary: "", remainingText: text };
    }
    const index = locationStart.index || 0;
    return {
      summary: text.slice(0, index).trim(),
      remainingText: text.slice(index)
    };
  };

  const processLocations = (text: string) => {
    const sections = text.split(/---\n*/);
    const filteredSections = sections.filter(section => section.trim());

    // The first non-empty section might be the main title and introduction
    let summary = '';
    let locations = [];

    for (let i = 0; i < filteredSections.length; i++) {
      const section = filteredSections[i];
      
      // If this is the first section and it starts with ##, it's the main summary
      if (i === 0 && section.trim().startsWith('##') && !section.trim().startsWith('###')) {
        summary = section.trim();
        continue;
      }

      // Process location sections (starting with ### for destination titles)
      const destinationMatch = section.match(/### \d+\. ([^\n]+)/);
      if (destinationMatch) {
        const title = destinationMatch[1].trim();
        // Remove the title line and trim any extra whitespace
        const content = section.replace(/### \d+\. [^\n]+\n?/, '').trim();
        
        // Only add if we have both title and content
        if (title && content) {
          locations.push({ title, content });
        }
      }
    }

    return {
      summary,
      locations: locations
    };
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Dive Travel Buddy</h1>
        <p>Find your perfect diving destination</p>
      </header>

      <div className="preferences">
        <div className="preference-card">
          <h3>Experience Level</h3>
          <div className="button-group">
            {Object.entries(experienceLevels).map(([level, description]) => (
              <button
                key={level}
                className={
                  preferences.experienceLevel === level ? "active" : ""
                }
                onClick={() => handlePreferenceChange("experienceLevel", level)}
                data-tooltip={description}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="preference-card">
          <h3>Diving Interests (Select Multiple)</h3>
          <div className="button-group">
            {["Coral Reefs", "Wreck Diving", "Marine Life", "Cave Diving"].map(
              (interest) => (
                <button
                  key={interest}
                  className={
                    preferences.interests.includes(interest) ? "active" : ""
                  }
                  onClick={() => handlePreferenceChange("interests", interest)}
                >
                  {interest}
                </button>
              )
            )}
          </div>
        </div>

        <div className="preference-card">
          <h3>Travel Season</h3>
          <div className="button-group">
            {["Spring", "Summer", "Fall", "Winter"].map((season) => (
              <button
                key={season}
                className={preferences.season === season ? "active" : ""}
                onClick={() => handlePreferenceChange("season", season)}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        <div className="preference-card additional-preferences">
          <AdditionalPreferences
            preferences={preferences}
            onPreferenceChange={handlePreferenceChange}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className={`generate-button ${isLoading ? "loading" : ""}`}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading
          ? "Finding Perfect Destinations..."
          : "Find My Perfect Destination"}
      </button>

      {streamedResponse && streamedResponse.trim() !== "" && (
        <div className="recommendations">
          <h2>Your Personalized Recommendations</h2>
          {processLocations(streamedResponse).summary && (
            <div className="recommendations-summary">
              {processLocations(streamedResponse).summary}
            </div>
          )}
          <div className="recommendation-grid">
            {processLocations(streamedResponse).locations.map((location, index) => (
              location.title && location.content && (
                <RecommendationCard
                  key={index}
                  title={location.title}
                  content={location.content}
                  isFavorite={isFavorite(location.title)}
                  onToggleFavorite={() => handleToggleFavorite(location.title, location.content)}
                />
              )
            ))}
          </div>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="favorites-section">
          <h2>Favorite Destinations</h2>
          <div className="recommendation-grid">
            {favorites.map((item) => (
              <RecommendationCard
                key={item.id}
                title={item.title}
                content={item.content}
                isFavorite={true}
                onToggleFavorite={() => removeFromFavorites(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="history-section">
          <div className="history-header">
            <h2>Previous Recommendations</h2>
            <button className="clear-history-button" onClick={clearHistory}>
              Clear History
            </button>
          </div>
          <div className="history-items">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-preferences">
                  <span className="history-timestamp">{item.timestamp}</span>
                  <p>
                    <strong>Experience:</strong>{" "}
                    {item.preferences.experienceLevel}
                  </p>
                  <p>
                    <strong>Interests:</strong>{" "}
                    {item.preferences.interests.join(", ")}
                  </p>
                  <p>
                    <strong>Season:</strong> {item.preferences.season}
                  </p>
                  {item.preferences.waterTemperature && (
                    <p>
                      <strong>Water Temperature:</strong>{" "}
                      {item.preferences.waterTemperature}
                    </p>
                  )}
                  {item.preferences.visibility && (
                    <p>
                      <strong>Visibility:</strong>{" "}
                      {item.preferences.visibility}
                    </p>
                  )}
                  {item.preferences.currentStrength && (
                    <p>
                      <strong>Current:</strong>{" "}
                      {item.preferences.currentStrength}
                    </p>
                  )}
                  {item.preferences.maxDepth && (
                    <p>
                      <strong>Max Depth:</strong>{" "}
                      {item.preferences.maxDepth}
                    </p>
                  )}
                </div>
                {processLocations(item.recommendation).summary && (
                  <div className="recommendations-summary">
                    {processLocations(item.recommendation).summary}
                  </div>
                )}
                <div className="recommendation-grid">
                  {processLocations(item.recommendation).locations.map((location, index) => (
                    location.title && location.content && (
                      <RecommendationCard
                        key={index}
                        title={location.title}
                        content={location.content}
                        isFavorite={isFavorite(location.title)}
                        onToggleFavorite={() => handleToggleFavorite(location.title, location.content)}
                      />
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DebugPanel debugInfo={debugInfo} />
    </div>
  );
}

export default App;
