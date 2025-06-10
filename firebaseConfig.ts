import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
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
