import { useState } from 'react';
import './DebugPanel.css';

interface DebugInfo {
  timestamp: string;
  system: string;
  prompt: string;
  preferences: any;
  response: string;
  error?: string;
}

interface DebugPanelProps {
  debugInfo: DebugInfo[];
}

export function DebugPanel({ debugInfo }: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`debug-panel ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="debug-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide Debug' : 'Show Debug'}
      </button>
      {isExpanded && (
        <div className="debug-content">
          <h3>API Debug Information</h3>
          <div className="debug-logs">
            {debugInfo.map((info, index) => (
              <div key={index} className="debug-entry">
                <div className="debug-timestamp">{info.timestamp}</div>
                <div className="debug-details">
                  <strong>System</strong>
                  <pre>{info.system}</pre>
                  <strong>Prompt</strong>
                  <pre>{info.prompt}</pre>
                  <strong>Preferences:</strong>
                  <pre>{JSON.stringify(info.preferences, null, 2)}</pre>
                  <strong>Response:</strong>
                  <pre>{info.response}</pre>
                  {info.error && (
                    <>
                      <strong>Error:</strong>
                      <pre className="debug-error">{info.error}</pre>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}