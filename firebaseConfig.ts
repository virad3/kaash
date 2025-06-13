
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// CRITICAL: YOU MUST REPLACE THE PLACEHOLDER VALUES BELOW WITH YOUR ACTUAL FIREBASE PROJECT CONFIGURATION.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
// IF YOU DO NOT REPLACE THESE VALUES, YOUR APPLICATION WILL NOT CONNECT TO FIREBASE.
// THIS IS THE CAUSE OF THE "Could not reach Cloud Firestore backend" ERROR.
//
// HOW TO GET YOUR CONFIGURATION:
// 1. Go to your Firebase project console: https://console.firebase.google.com/
// 2. Select your project.
// 3. Click the gear icon (Project settings) next to "Project Overview".
// 4. In the "General" tab, scroll down to the "Your apps" section.
// 5. If you haven't registered a web app, click "Add app" and choose the web icon (</>). Follow instructions.
// 6. Click on your web app's name.
// 7. Scroll to the "SDK setup and configuration" section and select "Config".
// 8. Copy the `firebaseConfig` object values provided there.
// 9. Paste them below, replacing EACH "REPLACE..." string with your project's actual value.
//
// ALSO ENSURE IN YOUR FIREBASE PROJECT (Firebase Console):
// - Firestore Database IS CREATED: (Build > Firestore Database > Create database -> Start in TEST MODE for development).
// - Authentication Methods ARE ENABLED: (Build > Authentication > Sign-in method > Enable Email/Password and Google).
//
const firebaseConfig = {
  apiKey: "AIzaSyDUNFxBWKfa1DySUcfq-XSFwtm578FgLOk",
  authDomain: "kaash-d3ed8.firebaseapp.com",
  projectId: "kaash-d3ed8",
  storageBucket: "kaash-d3ed8.firebasestorage.app",
  messagingSenderId: "95728040571",
  appId: "1:95728040571:web:6e3e5937a9f1cdc84f00de",
  measurementId: "G-WS9GMLW5XB"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export { auth, db, googleProvider };

// AFTER UPDATING THE CONFIG ABOVE AND VERIFYING FIREBASE PROJECT SETUP:
// Ensure your Firestore Security Rules are set up.
// A 'firestore.rules' file has been provided and should be deployed to your project.
// You can deploy these rules via:
// Firebase Console > Build > Firestore Database > Rules tab > Paste rules & Publish.
// OR using Firebase CLI: `firebase deploy --only firestore:rules`
//
// If the error persists AFTER TRIPLE-CHECKING the config and project setup,
// check your internet connection and any browser extensions that might block Firebase.