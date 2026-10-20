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

  const processImageFile = (file: File): Promise<{ base64String: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = () => {
        const resultStr = reader.result?.toString() || '';
        const img = new Image();
        img.onerror = () => {
          // Fallback to direct base64 if image rendering fails
          const parts = resultStr.split(',');
          if (parts.length > 1) {
            resolve({ base64String: parts[1], mimeType: file.type || 'image/jpeg' });
          } else {
            reject(new Error('Invalid image data'));
          }
        };
        img.onload = () => {
          try {
            const maxDimension = 1600;
            let width = img.width;
            let height = img.height;
            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              const parts = resultStr.split(',');
              resolve({ base64String: parts[1] || '', mimeType: file.type || 'image/jpeg' });
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64String = dataUrl.split(',')[1] || '';
            resolve({ base64String, mimeType: 'image/jpeg' });
          } catch {
            const parts = resultStr.split(',');
            resolve({ base64String: parts[1] || '', mimeType: file.type || 'image/jpeg' });
          }
        };
        img.src = resultStr;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name);
    if (!isImage) {
        setStatusMessage('Please upload a valid image file.');
        return;
    }

    setIsScanning(true);
    setStatusMessage('Optimizing image and analyzing with Gemini AI...');
    
    try {
        const { base64String, mimeType } = await processImageFile(file);
        
        const expenseDetails = await extractExpenseFromReceipt(base64String, mimeType);
        
        if (expenseDetails && expenseDetails.amount > 0) {
            // Ensure clean YYYY-MM-DD date string
            if (expenseDetails.date) {
                expenseDetails.date = expenseDetails.date.split('T')[0];
            }
            setStatusMessage('Scan complete! Preparing form...');
            setTimeout(() => {
                onAddExpense(expenseDetails);
            }, 400);
        } else {
            setStatusMessage('Could not extract expense details from this image.');
        }
    } catch (err: any) {
        console.error(err);
        let errorMsg = err.message || 'Error analyzing image';
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
