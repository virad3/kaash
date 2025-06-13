
import firebase from 'firebase/compat/app'; // Required for firebase.User type and potentially for firebase.auth() if not already initialized
// auth and googleProvider will be instances from firebase/compat/auth via firebaseConfig
import { auth, googleProvider } from '../firebaseConfig'; 
import { User } from '../types'; // Your app's User type

// Firebase's User type from the compat library
type FirebaseUser = firebase.User;

export const registerUserWithEmail = async (name: string, email: string, password?: string): Promise<User> => {
  if (!password) throw new Error("Password is required for email registration.");
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  if (userCredential.user) {
    await userCredential.user.updateProfile({ displayName: name });
    // Return your app's User type
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name: name, 
      photoURL: userCredential.user.photoURL
    };
  }
  throw new Error("User registration failed.");
};

export const loginUserWithEmail = async (email: string, password?: string): Promise<User> => {
  if (!password) throw new Error("Password is required for email login.");
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  if (userCredential.user) {
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL
    };
  }
  throw new Error("User login failed.");
};

export const loginWithGoogle = async (): Promise<User> => {
  const result = await auth.signInWithPopup(googleProvider);
  if (result.user) {
    return {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName,
      photoURL: result.user.photoURL
    };
  }
  throw new Error("Google Sign-In failed.");
};

export const logoutUser = async (): Promise<void> => {
  await auth.signOut();
};

export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
  // This function now returns the unsubscribe function from onAuthStateChanged
  return auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user: User = { // Map FirebaseUser to your app's User type
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};

export const updateUserProfileName = async (newName: string): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    try {
      await user.updateProfile({
        displayName: newName,
      });
    } catch (error) {
      console.error("Error updating user profile name:", error);
      throw error; // Re-throw to be caught by calling function
    }
  } else {
    throw new Error("No user is currently signed in.");
  }
};