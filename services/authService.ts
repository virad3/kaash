
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app } from '../firebaseConfig';
import { User } from '../types'; // Your app's User type

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const registerUserWithEmail = async (name: string, email: string, password?: string): Promise<User> => {
  if (!password) throw new Error("Password is required for email registration.");
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName: name });
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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
  const result = await signInWithPopup(auth, googleProvider);
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
  await signOut(auth);
};

export const onAuthUserChanged = (callback: (user: User | null) => void): (() => void) => {
  // This function now returns the unsubscribe function from onAuthStateChanged
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
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
      await updateProfile(user, {
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