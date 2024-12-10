import { useState, useEffect } from "react";
import { useInitialRecommendations } from "./hooks/useInitialRecommendations";
import { useOpenAI } from "./hooks/useOpenAI";
import { useRecommendationHistory } from "./hooks/useRecommendationHistory";
import { useFavoriteDestinations } from "./hooks/useFavoriteDestinations";
import "./App.css";
import { RecommendationCard } from "./components/RecommendationCard";
import "./components/RecommendationCard.css";

import { DivePreferences, ProcessedResponse } from './types/diving';
import { monthOptions } from './config/seasons';
import { AdditionalPreferences } from "./components/AdditionalPreferences";

interface ExperienceLevels {
  [key: string]: string;
}

function App() {
  const [preferences, setPreferences] = useState<DivePreferences>({
    experienceLevel: "",
    interests: [],
    season: [],
    waterTemperature: [],
    visibility: [],
    currentStrength: [],
    maxDepth: [],
    regions: []
  });

  const { isLoading: isOpenAILoading, error, streamedResponse, getRecommendations } =
    useOpenAI();
  const { history, addToHistory, clearHistory } = useRecommendationHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavoriteDestinations();
  const { isLoading: isCacheLoading, cachedRecommendations } = useInitialRecommendations(getRecommendations);

  const isLoading = isOpenAILoading || isCacheLoading;
  const displayedResponse = streamedResponse || cachedRecommendations;

  // Update history when streamedResponse changes
  useEffect(() => {
    if (streamedResponse && streamedResponse.trim() !== "" && !isOpenAILoading) {
      addToHistory({ ...preferences }, streamedResponse);
    }
  }, [streamedResponse, isOpenAILoading, preferences, addToHistory]);

  // Update cache when new recommendations are received
  useEffect(() => {
    if (streamedResponse && !isOpenAILoading) {
      localStorage.setItem('initialRecommendations', JSON.stringify({
        recommendations: streamedResponse,
        timestamp: Date.now()
      }));
    }
  }, [streamedResponse, isOpenAILoading]);

  const experienceLevels: ExperienceLevels = {
    "Beginner": "No diving certification. Want to do OpenWater course)",
    "Open Water": "Basic certification (PADI/SSI Open Water Diver or equivalent)",
    "Advanced": "Advanced certification (PADI/SSI Advanced Open Water or equivalent)",
    "Rescue": "Rescue Diver certification (PADI/SSI Rescue Diver or equivalent)",
    "Professional": "Professional level (Divemaster/Instructor or equivalent)",
    "Technical": "Technical diving certification (TDI/PADI Tec certifications)"
  };

  const handlePreferenceChange = (type: keyof DivePreferences, value: string | string[]): void => {
    setPreferences((prev) => {
      if (Array.isArray(prev[type])) {
        if (Array.isArray(value)) {
          return { ...prev, [type]: value };
        }
        const currentArray = prev[type] as string[];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];
        return { ...prev, [type]: newArray };
      }
      return { ...prev, [type]: value };
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !preferences.experienceLevel ||
      preferences.interests.length === 0 ||
      preferences.season.length === 0
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

  const processLocations = (text: string): ProcessedResponse => {
    // Split the text by "---" markers
    const sections = text.split('---').map(section => section.trim());
    
    // Extract title from the first section (after ##)
    const title = sections[0]?.replace(/^##\s*/, '').trim() || '';
    
    // Extract locations from middle sections (those starting with ###)
    const locations = sections
      .filter(section => section.startsWith('### '))
      .map(section => {
        // Extract location title (after the number)
        const titleMatch = section.match(/### \d+\.\s*([^\n]+)/);
        const locationTitle = titleMatch ? titleMatch[1].trim() : '';
        
        // Get content after the title
        const content = section
          .replace(/### \d+\.\s*[^\n]+/, '') // Remove the title line
          .trim()
          .split('\n')
          .map(line => line.trim()) // Clean up each line
          .filter(line => line.length > 0) // Remove empty lines
          .join('\n');
        
        return {
          title: locationTitle,
          content: content
        };
      })
      .filter(location => location.title && location.content);

    // Extract summary from the last section
    const summary = sections[sections.length - 1]?.replace(/^(#*|\*).?Summary(\**)?:?/, '').trim() || '';
    

    return {
      title,
      locations,
      summary
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
          <div className="button-group season-group">
            {Object.entries(monthOptions).map(([months, description]) => (
              <button
                key={months}
                className={preferences.season.includes(months) ? "active" : ""}
                onClick={() => handlePreferenceChange("season", months)}
                data-tooltip={description}
              >
                {months}
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

      {displayedResponse && displayedResponse.trim() !== "" && (
        <div className="recommendations">
          <div className="recommendations-header">
            <h2>{processLocations(displayedResponse).title}</h2>
          </div>
          <div className="recommendation-grid">
            {processLocations(displayedResponse).locations.map((location, index) => (
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
          {processLocations(displayedResponse).summary && (
            <div className="recommendations-summary">
              <h3>Summary</h3>
              <p>{processLocations(displayedResponse).summary}</p>
            </div>
          )}
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
                    <strong>Season:</strong> {item.preferences.season.join(", ")}
                  </p>
                  {item.preferences.waterTemperature.length > 0 && (
                    <p>
                      <strong>Water Temperature:</strong>{" "}
                      {item.preferences.waterTemperature.join(", ")}
                    </p>
                  )}
                  {item.preferences.visibility.length > 0 && (
                    <p>
                      <strong>Visibility:</strong>{" "}
                      {item.preferences.visibility.join(", ")}
                    </p>
                  )}
                  {item.preferences.currentStrength.length > 0 && (
                    <p>
                      <strong>Current:</strong>{" "}
                      {item.preferences.currentStrength.join(", ")}
                    </p>
                  )}
                  {item.preferences.maxDepth.length > 0 && (
                    <p>
                      <strong>Max Depth:</strong>{" "}
                      {item.preferences.maxDepth.join(", ")}
                    </p>
                  )}
                  {item.preferences.regions.length > 0 && (
                    <p>
                      <strong>Regions:</strong>{" "}
                      {item.preferences.regions.join(", ")}
                    </p>
                  )}
                </div>
                <div className="recommendations-header">
                  <h3>{processLocations(item.recommendation).title}</h3>
                </div>
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
                {processLocations(item.recommendation).summary && (
                  <div className="recommendations-summary">
                    <h3>Summary</h3>
                    <p>{processLocations(item.recommendation).summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
