
import React from 'react';
import { KaashLogoIcon } from './icons';

export const ConfigurationErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col justify-center items-center p-4 text-center">
      <div className="max-w-2xl">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <KaashLogoIcon className="h-12 w-12 text-red-500" />
          <h1 className="text-4xl font-bold text-red-400">Configuration Required</h1>
        </div>
        <p className="text-lg text-gray-300 mb-4">
          Welcome to Kaash! To get started, you need to connect the app to your own Firebase project.
        </p>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 text-left space-y-3">
          <p className="font-semibold text-sky-300">
            It looks like the application is using placeholder credentials. You'll need to update one file to fix this.
          </p>
          <div>
            <p className="text-gray-400">File to edit:</p>
            <code className="bg-slate-900 text-yellow-300 px-2 py-1 rounded-md text-sm block my-1">
              firebaseConfig.ts
            </code>
          </div>
          <p>
            Please follow the detailed instructions written in the comments at the top of that file. After you've replaced the placeholder values with your actual Firebase project configuration, please refresh this page.
          </p>
          <p className="text-xs text-gray-500 pt-2 border-t border-slate-700">
            This is a one-time setup step. The app cannot connect to the database until this is completed.
          </p>
        </div>
      </div>
    </div>
  );
};
