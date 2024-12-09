import React, { useState } from 'react';
import { DivePreferences } from '../types/diving';
import { waterTemperatureOptions, visibilityOptions, currentStrengthOptions, maxDepthOptions } from '../types/diving';

interface AdditionalPreferencesProps {
  preferences: DivePreferences;
  onPreferenceChange: (type: keyof DivePreferences, value: string) => void;
}

export const AdditionalPreferences: React.FC<AdditionalPreferencesProps> = ({
  preferences,
  onPreferenceChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="preference-card">
      <div 
        className="additional-preferences-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <h3>Additional Preferences {isExpanded ? '▼' : '▶'}</h3>
      </div>
      
      {isExpanded && (
        <div className="additional-preferences-content">
          <div className="preference-group">
            <h4>Water Temperature</h4>
            <div className="button-group">
              {Object.entries(waterTemperatureOptions).map(([temp, description]) => (
                <button
                  key={temp}
                  className={preferences.waterTemperature === temp ? "active" : ""}
                  onClick={() => onPreferenceChange("waterTemperature", temp)}
                  data-tooltip={description}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Visibility</h4>
            <div className="button-group">
              {Object.entries(visibilityOptions).map(([vis, description]) => (
                <button
                  key={vis}
                  className={preferences.visibility === vis ? "active" : ""}
                  onClick={() => onPreferenceChange("visibility", vis)}
                  data-tooltip={description}
                >
                  {vis}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Current Strength</h4>
            <div className="button-group">
              {Object.entries(currentStrengthOptions).map(([current, description]) => (
                <button
                  key={current}
                  className={preferences.currentStrength === current ? "active" : ""}
                  onClick={() => onPreferenceChange("currentStrength", current)}
                  data-tooltip={description}
                >
                  {current}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Maximum Depth</h4>
            <div className="button-group">
              {Object.entries(maxDepthOptions).map(([depth, description]) => (
                <button
                  key={depth}
                  className={preferences.maxDepth === depth ? "active" : ""}
                  onClick={() => onPreferenceChange("maxDepth", depth)}
                  data-tooltip={description}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};