import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import { initializeMockData } from '@/utils/storage';
import './index.css'

// Initialize mock data before the app renders
initializeMockData();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
