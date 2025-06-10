import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser // Firebase's User type
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig'; // Corrected path
import { User } from '../types'; // Your app's User type

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
  await firebaseSignOut(auth);
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
