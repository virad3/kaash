import React, { useState, useRef, useMemo } from 'react';
import { extractExpenseFromReceipt, ExtractedExpense } from '../services/geminiService';
import { matchExpenseCategory, STANDARD_EXPENSE_CATEGORIES } from '../categoryMatcher';
import { MagicIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import { Check, Edit3, RefreshCw, X, ArrowRight, Tag } from 'lucide-react';

interface ReceiptScannerProps {
  onAddExpense: (data: Partial<ExtractedExpense>) => void;
  onClose: () => void;
  availableCategories?: string[];
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ 
  onAddExpense, 
  onClose,
  availableCategories = STANDARD_EXPENSE_CATEGORIES
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [extractedExpense, setExtractedExpense] = useState<ExtractedExpense | null>(null);

  // Editable fields for verification before submitting
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sorted list of valid categories for selection
  const sortedCategories = useMemo(() => {
    const list = availableCategories && availableCategories.length > 0 
      ? availableCategories 
      : STANDARD_EXPENSE_CATEGORIES;
    return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
  }, [availableCategories]);

  const processImageFile = (file: File): Promise<{ base64String: string; mimeType: string; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.onload = () => {
        const resultStr = reader.result?.toString() || '';
        const img = new Image();
        img.onerror = () => {
          const parts = resultStr.split(',');
          if (parts.length > 1) {
            resolve({ base64String: parts[1], mimeType: file.type || 'image/jpeg', dataUrl: resultStr });
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
              resolve({ base64String: parts[1] || '', mimeType: file.type || 'image/jpeg', dataUrl: resultStr });
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            const base64String = dataUrl.split(',')[1] || '';
            resolve({ base64String, mimeType: 'image/jpeg', dataUrl });
          } catch {
            const parts = resultStr.split(',');
            resolve({ base64String: parts[1] || '', mimeType: file.type || 'image/jpeg', dataUrl: resultStr });
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
    setStatusMessage('Analyzing receipt with Gemini AI & categorizing expense...');
    setExtractedExpense(null);

    try {
      const { base64String, mimeType, dataUrl } = await processImageFile(file);
      setPreviewImage(dataUrl);

      const expenseDetails = await extractExpenseFromReceipt(base64String, mimeType, sortedCategories);

      if (expenseDetails && expenseDetails.amount > 0) {
        const cleanDate = expenseDetails.date ? expenseDetails.date.split('T')[0] : new Date().toISOString().split('T')[0];
        
        // Match category with maximum intelligence
        const matchedCategory = matchExpenseCategory(
          expenseDetails.category,
          expenseDetails.description,
          sortedCategories
        );

        const verifiedDetails: ExtractedExpense = {
          amount: expenseDetails.amount,
          description: expenseDetails.description || 'Receipt Expense',
          category: matchedCategory,
          date: cleanDate
        };

        setExtractedExpense(verifiedDetails);
        setEditAmount(verifiedDetails.amount.toString());
        setEditDescription(verifiedDetails.description);
        setEditCategory(verifiedDetails.category);
        setEditDate(verifiedDetails.date);
        setStatusMessage('');
      } else {
        setStatusMessage('Could not extract expense details from this image. Please try a clearer photo or enter details manually.');
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = err.message || 'Error analyzing image';
      if (errorMsg.includes('API key not valid') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('Missing API Key')) {
        errorMsg = 'Invalid Gemini API Key. Please verify your GEMINI_API_KEY.';
      }
      setStatusMessage(`Error: ${errorMsg}`);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleConfirmExpense = () => {
    const numAmount = parseFloat(editAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMessage('Please enter a valid amount.');
      return;
    }

    onAddExpense({
      amount: numAmount,
      description: editDescription.trim() || 'Receipt Expense',
      category: editCategory || sortedCategories[0] || 'Food',
      date: editDate || new Date().toISOString().split('T')[0]
    });
  };

  const handleReset = () => {
    setExtractedExpense(null);
    setPreviewImage(null);
    setStatusMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <MagicIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {extractedExpense ? 'Verify Scanned Receipt' : 'Scan Receipt'}
              </h2>
              <p className="text-xs text-gray-400">
                {extractedExpense ? 'Review and adjust identified category or details' : 'AI extracts amount, items & expense category'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-grow space-y-4">
          
          {/* View 1: Extracted details ready for review & confirmation */}
          {extractedExpense ? (
            <div className="space-y-4">
              
              {/* Receipt Preview + Success Banner */}
              <div className="flex items-center gap-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-300">Receipt Extracted Successfully</p>
                  <p className="text-xs text-emerald-400/80">Check category and details below before saving</p>
                </div>
                {previewImage && (
                  <img 
                    src={previewImage} 
                    alt="Receipt preview" 
                    className="w-10 h-10 object-cover rounded border border-slate-600 shrink-0" 
                  />
                )}
              </div>

              {/* Form Fields for Instant Verification */}
              <div className="space-y-3.5 bg-slate-900/50 p-4 rounded-xl border border-slate-700/60">
                
                {/* Category Selection - Highlighted */}
                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      Expense Category
                    </span>
                    <span className="text-[11px] text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-700/50">
                      AI Suggested
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-slate-800 border-2 border-indigo-500/60 focus:border-indigo-400 rounded-lg px-3.5 py-2.5 text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-colors cursor-pointer"
                    >
                      {sortedCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Select a different category from the dropdown if the suggested category needs correction.
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white text-base font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Description / Merchant */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Description / Merchant
                  </label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Merchant or item name"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

              </div>

              {/* Status Message if any */}
              {statusMessage && (
                <p className="text-xs text-red-400 text-center">{statusMessage}</p>
              )}

              {/* Review Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Scan Another
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExpense}
                  className="flex-[2] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <span>Continue to Add Expense</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            /* View 2: Initial Upload & Camera Controls */
            <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
              
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                {isScanning ? (
                  <LoadingSpinner size="md" color="border-indigo-400" />
                ) : (
                  <MagicIcon className="w-8 h-8" />
                )}
              </div>

              <div className="max-w-sm space-y-1.5">
                <p className="text-sm font-medium text-white">
                  {isScanning ? 'Processing Receipt Image...' : 'Capture or Upload Receipt'}
                </p>
                <p className="text-xs text-slate-400">
                  {isScanning 
                    ? 'Gemini AI is reading text, calculating total, and assigning the proper category.' 
                    : 'Take a photo or upload a receipt/bill. Gemini AI will extract the merchant, amount, date, and correctly match the expense category.'}
                </p>
              </div>

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
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
                >
                  <span className="text-base">📸</span>
                  Take Photo
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-700 text-slate-200 hover:text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors disabled:opacity-50 border border-slate-600/60"
                >
                  <span className="text-base">📁</span>
                  Upload Image
                </button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div className={`p-3 rounded-lg text-xs max-w-sm w-full ${
                  statusMessage.includes('Error') || statusMessage.includes('Could not')
                    ? 'bg-red-950/40 border border-red-500/30 text-red-300'
                    : 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300'
                }`}>
                  {statusMessage}
                </div>
              )}

              {/* Supported Categories Note */}
              <div className="pt-2 border-t border-slate-700/60 w-full text-left">
                <p className="text-[11px] text-slate-400 font-medium mb-1.5">Available Expense Categories:</p>
                <div className="flex flex-wrap gap-1.5">
                  {sortedCategories.slice(0, 8).map(c => (
                    <span key={c} className="text-[10px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                  {sortedCategories.length > 8 && (
                    <span className="text-[10px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">
                      +{sortedCategories.length - 8} more
                    </span>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
