/**
 * @license MIT
 * @author Janos Schwellach <jschwellach@gmail.com>
 * @copyright Copyright (c) 2024 Janos Schwellach
 * 
 * This file is part of the diving recommendation engine that provides
 * personalized dive site suggestions based on user preferences.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
