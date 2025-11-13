
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!   CRITICAL ACTION REQUIRED   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
//          YOU MUST REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR
//          ACTUAL FIREBASE PROJECT CONFIGURATION.
//
//          FAILURE TO DO SO WILL PREVENT THE APP FROM CONNECTING TO ANY
//          DATABASE, AND DATA WILL NOT BE SAVED.
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

const firebaseConfig = {
  apiKey: "AIzaSyDUNFxBWKfa1DySUcfq-XSFwtm578FgLOk",
  authDomain: "kaash-d3ed8.firebaseapp.com",
  projectId: "kaash-d3ed8",
  storageBucket: "kaash-d3ed8.firebasestorage.app",
  messagingSenderId: "95728040571",
  appId: "1:95728040571:web:6e3e5937a9f1cdc84f00de",
  measurementId: "G-WS9GMLW5XB"
};

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  FIRESTORE SECURITY RULES  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
//          AFTER CONFIGURING YOUR PROJECT, YOU MUST SET UP FIRESTORE SECURITY RULES.
//          WITHOUT CORRECT RULES, ALL ATTEMPTS TO SAVE DATA (like credit cards) WILL FAIL.
//
//          HOW TO SET YOUR SECURITY RULES:
//          1. Go to your Firebase project console.
//          2. Navigate to Build > Firestore Database.
//          3. Click on the "Rules" tab at the top.
//          4. Replace the existing content with the rules below.
//          5. Click "Publish".
//
//          COPY AND PASTE THE FOLLOWING RULES INTO THE FIREBASE CONSOLE:
//
//  rules_version = '2';
//  service cloud.firestore {
//    match /databases/{database}/documents {
//      // Allow users to read and write only their own data.
//      // The user's data is stored in a document path that includes their UID.
//      match /users/{userId}/{document=**} {
//        allow read, write: if request.auth != null && request.auth.uid == userId;
//      }
//    }
//  }
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// This flag will be used by the main App component to render an error screen
// if the developer hasn't replaced the placeholder config.


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);


export { app, auth, db, firebaseConfig };

// AFTER UPDATING THE CONFIG ABOVE AND VERIFYING FIREBASE PROJECT SETUP:
// ALSO ENSURE IN YOUR FIREBASE PROJECT (Firebase Console):
// - Firestore Database IS CREATED AND A REGION IS SELECTED.
// - Authentication Methods (e.g., Email/Password, Google) ARE ENABLED.
//
// If the error persists AFTER TRIPLE-CHECKING the config and project setup,
// check your internet connection and any browser extensions that might block Firebase.