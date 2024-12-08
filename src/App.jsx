import { useState, useEffect } from "react";
import { useOpenAI } from "./hooks/useOpenAI";
import { useRecommendationHistory } from "./hooks/useRecommendationHistory";
import "./App.css";

function App() {
  const [preferences, setPreferences] = useState({
    experienceLevel: "",
    interests: [],
    season: "",
  });

  const { isLoading, error, streamedResponse, getRecommendations } =
    useOpenAI();
  const { history, addToHistory, clearHistory } = useRecommendationHistory();

  // Update history when streamedResponse changes
  useEffect(() => {
    if (streamedResponse && streamedResponse.trim() !== "" && !isLoading) {
      addToHistory({ ...preferences }, streamedResponse);
    }
  }, [streamedResponse, isLoading, preferences, addToHistory]);

  const experienceLevels = {
    Beginner: "New to diving or have a few open water dives",
    Intermediate: "50+ dives and comfortable with various conditions",
    Advanced: "100+ dives with technical diving experience",
  };

  const handlePreferenceChange = (type, value) => {
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

  const handleSubmit = async () => {
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
          <div className="recommendation-content">
            {streamedResponse.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
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
                </div>
                <div className="history-recommendation">
                  {item.recommendation.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
