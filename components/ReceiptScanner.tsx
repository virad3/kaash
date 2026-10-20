import React, { useState, useRef } from 'react';
import { TransactionType, ExpenseCategory } from '../types';
import { extractExpenseFromReceipt, ExtractedExpense } from '../services/geminiService';
import { MagicIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ReceiptScannerProps {
  onAddExpense: (data: Partial<ExtractedExpense>) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onAddExpense, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setStatusMessage('Please upload a valid image file.');
        return;
    }

    setIsScanning(true);
    setStatusMessage('Analyzing receipt with Gemini...');
    
    try {
        const base64Data = await convertFileToBase64(file);
        const mimeType = file.type;
        // strip the 'data:image/...;base64,' part
        const base64String = base64Data.toString().split(',')[1];
        
        const expenseDetails = await extractExpenseFromReceipt(base64String, mimeType);
        
        if (expenseDetails && expenseDetails.amount > 0) {
            setStatusMessage('Scan complete! Preparing form...');
            setTimeout(() => {
                onAddExpense(expenseDetails);
            }, 500);
        } else {
            setStatusMessage('Could not extract expense details from this image.');
        }
    } catch (err: any) {
        console.error(err);
        let errorMsg = err.message;
        if (errorMsg.includes('API key not valid') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Missing API Key')) {
            errorMsg = 'Invalid Gemini API Key. Please update it in the Settings > Secrets panel.';
        }
        setStatusMessage(`Error: ${errorMsg}`);
    } finally {
        setIsScanning(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = ''; // Reset input
        }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg">
                <MagicIcon className="h-6 w-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Scan Receipt</h2>
                <p className="text-xs text-gray-400">Extracts details using Gemini</p>
             </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow flex flex-col items-center justify-center text-center space-y-6">
            
            <p className="text-gray-300">
                Upload a photo of your receipt or bill. AI will extract the amount, description, date, and suggest a category.
            </p>
            
            <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                disabled={isScanning}
            />
            <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden" 
                ref={cameraInputRef} 
                onChange={handleFileChange}
                disabled={isScanning}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isScanning}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                  {isScanning ? <LoadingSpinner size="sm" color="border-white"/> : <span className="text-xl">📸</span>}
                  {isScanning ? "Scanning..." : "Take Photo"}
              </button>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                  <span className="text-xl">📁</span>
                  Upload Image
              </button>
            </div>
            
            {statusMessage && (
                <p className={`text-sm ${statusMessage.includes('Error') || statusMessage.includes('Could not') ? 'text-red-400' : 'text-indigo-300'}`}>
                    {statusMessage}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};
