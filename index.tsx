
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import directly for the check, though it's not ideal for direct config access here.
// A better way would be an environment variable check, but for this context, direct import is simpler.

// The check for placeholder Firebase configuration is now handled inside App.tsx
// to provide a better user experience with a dedicated error page.

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