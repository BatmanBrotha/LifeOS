import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css'; // Import our global styles



const root = createRoot(document.getElementById('root'));

// Render the main App component inside StrictMode for extra checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
