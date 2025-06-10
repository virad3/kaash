
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { KaashLogoIcon, GoogleIcon } from './icons';

interface AuthPageProps {
  onLogin: (email: string, password?: string) => void;
  onSignup: (name: string, email: string, password?: string) => void;
  onGoogleLogin: () => Promise<void>; // This is now a direct call to the authService method
  error?: string | null;
  clearError: () => void;
  // googleClientId prop is removed as Firebase configuration handles this
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, onGoogleLogin, error, clearError }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  // No useEffect needed for Google Sign-In button rendering here.
  // Firebase's signInWithPopup handles the UI interaction.

  const switchToSignup = () => {
    setIsLoginView(false);
    clearError();
  };
  const switchToLogin = () => {
    setIsLoginView(true);
    clearError();
  };

  const handleGoogleSignInClick = async () => {
    try {
      await onGoogleLogin();
      // Successful login is handled by App.tsx via onAuthStateChanged
    } catch (err) {
      // Error is set in App.tsx's onGoogleLogin handler and passed as 'error' prop
      console.error("Google Sign In Click Error on AuthPage:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center items-center p-3 sm:p-4 selection:bg-sky-400 selection:text-sky-900">
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <KaashLogoIcon className="h-12 w-12 sm:h-16 sm:w-16 text-sky-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                Kaash
            </h1>
        </div>
        <p className="mt-2 text-base sm:text-lg text-gray-400">Track smarter, live better.</p>
      </div>
      <div className="w-full max-w-md bg-slate-800 p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl border border-slate-700">
        {isLoginView ? (
          <LoginForm onLogin={onLogin} onSwitchToSignup={switchToSignup} error={error} />
        ) : (
          <SignupForm onSignup={onSignup} onSwitchToLogin={switchToLogin} error={error} />
        )}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-600 rounded-lg shadow-sm bg-slate-700 text-sm font-medium text-gray-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>
            {/* The old div with id="googleSignInButton" is no longer needed */}
          </div>
        </div>
      </div>
       <footer className="w-full max-w-7xl mt-10 sm:mt-12 py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Kaash. Your personal finance companion.</p>
      </footer>
    </div>
  );
};
