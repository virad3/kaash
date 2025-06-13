import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface EditProfileModalProps {
  user: User | null;
  onUpdateProfile: (newName: string) => Promise<void>;
  onCancel: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onUpdateProfile, onCancel }) => {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    } else {
      setDisplayName('');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      alert("Display name cannot be empty.");
      return;
    }
    try {
      await onUpdateProfile(trimmedName);
    } catch (error: any) {
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]"> {/* Higher z-index than profile dropdown */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-sky-400">Edit Profile</h2>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close edit profile modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-gray-100 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Enter your display name"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};