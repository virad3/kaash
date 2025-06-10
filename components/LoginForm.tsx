
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password?: string) => void; // Password optional for demo
  onSwitchToSignup: () => void;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignup, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
        alert("Please enter your email.");
        return;
    }
    // Password validation could be added here if needed for your demo logic
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-center text-sky-400">Login to Kaash</h2>
      {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
        <input
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="••••••••"
          // required // Making password optional for demo to simplify if not fully implemented
        />
        <p className="text-xs text-gray-500 mt-1">Note: Password field is for UI demonstration. Secure password handling requires a backend.</p>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors"
      >
        Log In
      </button>
      <p className="text-sm text-center text-gray-400">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToSignup} className="font-medium text-sky-400 hover:text-sky-300">
          Sign up
        </button>
      </p>
    </form>
  );
};
