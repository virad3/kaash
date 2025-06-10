import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
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

// Instructions for the user:
// 1. Go to your Firebase project console (https://console.firebase.google.com/).
// 2. In Project settings (gear icon near "Project Overview"), find your web app's Firebase SDK snippet.
// 3. Copy the config object values (apiKey, authDomain, etc.) into the firebaseConfig object above.
// 4. Ensure you have enabled in your Firebase project:
//    - Firebase Authentication (Build > Authentication > Sign-in method): Enable Email/Password and Google.
//    - Firestore Database (Build > Firestore Database > Create database): Start in test mode for development if prompted.
// 5. Set up Firestore Security Rules. Example provided in the main response or use permissive rules for initial testing:
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read, write: if request.auth != null; // Basic rule: allow if user is authenticated
//        }
//      }
//    }
//    For user-specific data, use rules like:
//    match /users/{userId}/{document=**} {
//      allow read, write: if request.auth != null && request.auth.uid == userId;
//    }
