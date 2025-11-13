
import { initializeApp, getApps, getApp } from "firebase/app";
import "firebase/auth"; // Import for side-effects to register auth service
import "firebase/firestore"; // Import for side-effects to register firestore service

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!   CRITICAL ACTION REQUIRED   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
//          YOU MUST REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR
//          ACTUAL FIREBASE PROJECT CONFIGURATION.
//
//          FAILURE TO DO SO WILL RESULT IN THE ERROR:
//          "Could not reach Cloud Firestore backend. Connection failed..."
//
//          HOW TO GET YOUR CONFIGURATION:
//          1. Go to your Firebase project console: https://console.firebase.google.com/
//          2. Select your project.
//          3. Click the gear icon (Project settings) next to "Project Overview".
//          4. In the "General" tab, scroll down to the "Your apps" section.
//          5. If you haven't registered a web app, click "Add app" and choose the web icon (</>).
//          6. Click on your web app's name.
//          7. Scroll to the "SDK setup and configuration" section and select "Config".
//          8. Copy the `firebaseConfig` object values.
//          9. Paste them below, replacing EACH "REPLACE_THIS_WITH_YOUR_..." string.
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const firebaseConfig = {
  apiKey: "AIzaSyDUNFxBWKfa1DySUcfq-XSFwtm578FgLOk",
  authDomain: "kaash-d3ed8.firebaseapp.com",
  projectId: "kaash-d3ed8",
  storageBucket: "kaash-d3ed8.firebasestorage.app",
  messagingSenderId: "95728040571",
  appId: "1:95728040571:web:6e3e5937a9f1cdc84f00de",
  measurementId: "G-WS9GMLW5XB"
};

// Log a warning if the API key looks like the default placeholder
// if (firebaseConfig.apiKey === "AIzaSyDUNFxBWKfa1DySUcfq-XSFwtm578FgLOk" || firebaseConfig.projectId === "kaash-d3ed8" ) {
//   console.warn(
//     "%cIMPORTANT: Firebase configuration in 'firebaseConfig.ts' might be using placeholder values. " +
//     "Please replace them with your actual Firebase project credentials to connect to Firestore. " +
//     "Refer to the comments in 'firebaseConfig.ts' for instructions.",
//     "color: red; font-size: 14px; font-weight: bold;"
//   );
// }


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app, firebaseConfig };

// AFTER UPDATING THE CONFIG ABOVE AND VERIFYING FIREBASE PROJECT SETUP:
// Ensure your Firestore Security Rules are set up.
// You can deploy rules via Firebase Console > Build > Firestore Database > Rules tab.
//
// ALSO ENSURE IN YOUR FIREBASE PROJECT (Firebase Console):
// - Firestore Database IS CREATED AND A REGION IS SELECTED.
// - Authentication Methods (e.g., Email/Password, Google) ARE ENABLED.
//
// If the error persists AFTER TRIPLE-CHECKING the config and project setup,
// check your internet connection and any browser extensions that might block Firebase.