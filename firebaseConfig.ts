
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

//
// CRITICAL: PLEASE READ AND UPDATE THIS CONFIGURATION!
//
// The values below MUST be replaced with your actual Firebase project's configuration.
// If these are incorrect, or if your Firebase project is not set up correctly,
// Firestore and Authentication WILL NOT WORK.
//
// Common issues leading to "Could not reach Cloud Firestore backend":
// 1. Incorrect apiKey, authDomain, projectId, etc.
// 2. Firestore Database not created in your Firebase project (Build > Firestore Database > Create database).
// 3. API Key restrictions in Google Cloud Console preventing access (check HTTP referrers & enabled APIs for the key).
// 4. Firestore Security Rules not deployed or misconfigured.
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };

// Instructions for the user (reiterated from before):
// 1. Go to your Firebase project console (https://console.firebase.google.com/).
// 2. In Project settings (gear icon near "Project Overview"), find your web app's Firebase SDK snippet.
// 3. Copy the config object values (apiKey, authDomain, etc.) into the firebaseConfig object above.
// 4. Ensure you have enabled in your Firebase project:
//    - Firebase Authentication (Build > Authentication > Sign-in method): Enable Email/Password and Google.
//    - Firestore Database (Build > Firestore Database > Create database): Start in test mode for development if prompted, then select a region.
// 5. Set up Firestore Security Rules. An example 'firestore.rules' file is now provided. Deploy them via the Firebase console (Build > Firestore Database > Rules tab).
