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
    <div>
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
            <div className="checkbox-group">
              {Object.entries(waterTemperatureOptions).map(([temp, description]) => (
                <div key={temp} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`temp-${temp}`}
                    checked={preferences.waterTemperature === temp}
                    onChange={() => onPreferenceChange("waterTemperature", preferences.waterTemperature === temp ? "" : temp)}
                  />
                  <label htmlFor={`temp-${temp}`} title={description}>{temp}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Visibility</h4>
            <div className="checkbox-group">
              {Object.entries(visibilityOptions).map(([vis, description]) => (
                <div key={vis} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`vis-${vis}`}
                    checked={preferences.visibility === vis}
                    onChange={() => onPreferenceChange("visibility", preferences.visibility === vis ? "" : vis)}
                  />
                  <label htmlFor={`vis-${vis}`} title={description}>{vis}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Current Strength</h4>
            <div className="checkbox-group">
              {Object.entries(currentStrengthOptions).map(([current, description]) => (
                <div key={current} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`current-${current}`}
                    checked={preferences.currentStrength === current}
                    onChange={() => onPreferenceChange("currentStrength", preferences.currentStrength === current ? "" : current)}
                  />
                  <label htmlFor={`current-${current}`} title={description}>{current}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Maximum Depth</h4>
            <div className="checkbox-group">
              {Object.entries(maxDepthOptions).map(([depth, description]) => (
                <div key={depth} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`depth-${depth}`}
                    checked={preferences.maxDepth === depth}
                    onChange={() => onPreferenceChange("maxDepth", preferences.maxDepth === depth ? "" : depth)}
                  />
                  <label htmlFor={`depth-${depth}`} title={description}>{depth}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};