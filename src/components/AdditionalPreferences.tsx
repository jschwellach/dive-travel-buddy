import React, { useState } from 'react';
import { DivePreferences } from '../types/diving';
import { waterTemperatureOptions, visibilityOptions, currentStrengthOptions, maxDepthOptions, regionOptions } from '../types/diving';

interface AdditionalPreferencesProps {
  preferences: DivePreferences;
  onPreferenceChange: (type: keyof DivePreferences, value: string | string[]) => void;
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
            <div className="button-group">
              {Object.entries(waterTemperatureOptions).map(([temp, description]) => (
                <button
                  key={temp}
                  className={preferences.waterTemperature.includes(temp) ? "active" : ""}
                  onClick={() => {
                    const newValues = preferences.waterTemperature.includes(temp)
                      ? preferences.waterTemperature.filter(t => t !== temp)
                      : [...preferences.waterTemperature, temp];
                    onPreferenceChange("waterTemperature", newValues);
                  }}
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
                  className={preferences.visibility.includes(vis) ? "active" : ""}
                  onClick={() => {
                    const newValues = preferences.visibility.includes(vis)
                      ? preferences.visibility.filter(v => v !== vis)
                      : [...preferences.visibility, vis];
                    onPreferenceChange("visibility", newValues);
                  }}
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
                  className={preferences.currentStrength.includes(current) ? "active" : ""}
                  onClick={() => {
                    const newValues = preferences.currentStrength.includes(current)
                      ? preferences.currentStrength.filter(c => c !== current)
                      : [...preferences.currentStrength, current];
                    onPreferenceChange("currentStrength", newValues);
                  }}
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
                  className={preferences.maxDepth.includes(depth) ? "active" : ""}
                  onClick={() => {
                    const newValues = preferences.maxDepth.includes(depth)
                      ? preferences.maxDepth.filter(d => d !== depth)
                      : [...preferences.maxDepth, depth];
                    onPreferenceChange("maxDepth", newValues);
                  }}
                  data-tooltip={description}
                >
                  {depth}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-group">
            <h4>Preferred Regions</h4>
            <div className="button-group">
              {Object.entries(regionOptions).map(([region, description]) => (
                <button
                  key={region}
                  className={preferences.regions.includes(region) ? "active" : ""}
                  onClick={() => {
                    const newValues = preferences.regions.includes(region)
                      ? preferences.regions.filter(r => r !== region)
                      : [...preferences.regions, region];
                    onPreferenceChange("regions", newValues);
                  }}
                  data-tooltip={description}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};