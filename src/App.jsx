import { useState } from 'react'
import './App.css'

function App() {
  const [preferences, setPreferences] = useState({
    experience: '',
    interest: '',
    season: ''
  })

  const handlePreferenceChange = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

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
            {['Beginner', 'Intermediate', 'Advanced'].map(level => (
              <button
                key={level}
                className={preferences.experience === level ? 'active' : ''}
                onClick={() => handlePreferenceChange('experience', level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="preference-card">
          <h3>Diving Interest</h3>
          <div className="button-group">
            {['Coral Reefs', 'Wreck Diving', 'Marine Life', 'Cave Diving'].map(interest => (
              <button
                key={interest}
                className={preferences.interest === interest ? 'active' : ''}
                onClick={() => handlePreferenceChange('interest', interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div className="preference-card">
          <h3>Travel Season</h3>
          <div className="button-group">
            {['Spring', 'Summer', 'Fall', 'Winter'].map(season => (
              <button
                key={season}
                className={preferences.season === season ? 'active' : ''}
                onClick={() => handlePreferenceChange('season', season)}
              >
                {season}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        className="generate-button"
        onClick={() => {
          if (!preferences.experience || !preferences.interest || !preferences.season) {
            alert('Please select all preferences')
            return
          }
          alert('Generating recommendation...')
        }}
      >
        Find My Perfect Destination
      </button>
    </div>
  )
}

export default App
