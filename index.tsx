
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import directly for the check, though it's not ideal for direct config access here.
// A better way would be an environment variable check, but for this context, direct import is simpler.

// Placeholder check based on the known default value in the provided firebaseConfig.ts
const PLACEHOLDER_API_KEY = "AIzaSyDUNFxBWKfa1DySUcfq-XSFwtm578FgLOk";
const PLACEHOLDER_PROJECT_ID = "kaash-d3ed8";

// This check is a bit of a hack as we can't easily import firebaseConfig's content
// without potentially causing issues if it's not set up.
// We'll rely on the warning within firebaseConfig.ts itself as it's more direct.
// However, adding a generic reminder here too.

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