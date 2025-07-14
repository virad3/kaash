
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// The check for placeholder Firebase configuration is now handled by Firebase itself,
// logging errors to the console if the configuration is invalid.

console.log(
  "%cKaash App Initializing... Reminder: If you encounter Firestore connection issues, " +
  "double-check your Firebase project configuration in 'firebaseConfig.ts' and ensure " +
  "Firestore is enabled with appropriate rules in your Firebase project console.",
  "color: orange; font-weight: bold;"
);


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);