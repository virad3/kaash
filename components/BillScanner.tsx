
import React, { useState } from 'react';
import { CreditCard, CreditCardBill } from '../types';
import { extractBillDetails, ExtractedBill } from '../services/geminiService';
import { loginWithGoogle } from '../services/authService';
import { MagicIcon, GmailIcon, PlusIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface BillScannerProps {
  creditCards: CreditCard[];
  onAddBill: (data: Omit<CreditCardBill, 'id' | 'createdAt' | 'userId'> & { id?: string }) => Promise<void>;
  onClose: () => void;
}

export const BillScanner: React.FC<BillScannerProps> = ({ creditCards, onAddBill, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'text'>('gmail');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBills, setScannedBills] = useState<ExtractedBill[]>([]);
  const [manualText, setManualText] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Auto-matching result logic
  const getMatchedCardId = (bill: ExtractedBill): string | undefined => {
    const bankMatches = creditCards.filter(c => c.bankName.toLowerCase().includes(bill.bankName?.toLowerCase()) || bill.bankName?.toLowerCase().includes(c.bankName.toLowerCase()));
    if (bankMatches.length === 1) return bankMatches[0].id;
    return undefined;
  };

  const handleScanGmail = async () => {
    setIsScanning(true);
    setStatusMessage("Checking Gmail connection...");
    setScannedBills([]);

    let token = sessionStorage.getItem('googleAccessToken');

    if (!token) {
       try {
         await loginWithGoogle();
         token = sessionStorage.getItem('googleAccessToken');
       } catch (e) {
         setStatusMessage("Failed to connect to Gmail.");
         setIsScanning(false);
         return;
       }
    }

    if (!token) {
        setStatusMessage("Gmail access denied.");
        setIsScanning(false);
        return;
    }

    try {
        setStatusMessage("Searching recent emails for bills...");
        
        const date = new Date();
        date.setDate(date.getDate() - 30);
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '/');
        
        const query = `subject:(statement OR bill OR due) after:${dateStr}`;
        const listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!listResponse.ok) {
            if (listResponse.status === 401) {
                sessionStorage.removeItem('googleAccessToken');
                setStatusMessage("Session expired. Please reconnect Gmail.");
                setIsScanning(false);
                return;
            }
            throw new Error("Failed to fetch emails");
        }

        const listData = await listResponse.json();
        const messages = listData.messages || [];

        if (messages.length === 0) {
            setStatusMessage("No recent bill emails found.");
            setIsScanning(false);
            return;
        }

        setStatusMessage(`Analyzing ${messages.length} emails with AI...`);
        
        let combinedText = "";
        for (const msg of messages) {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const msgData = await msgRes.json();
            const snippet = msgData.snippet || "";
            combinedText += `Email Snippet: ${snippet}\n\n`;
        }

        const bills = await extractBillDetails(combinedText);
        setScannedBills(bills);
        setStatusMessage(bills.length > 0 ? "Scan complete!" : "No bills extracted from emails.");

    } catch (error: any) {
        console.error(error);
        setStatusMessage(`Error: ${error.message}`);
    } finally {
        setIsScanning(false);
    }
  };

  const handleScanText = async (textToScan?: string) => {
      const text = textToScan || manualText;
      if (!text.trim()) return;
      
      setIsScanning(true);
      setStatusMessage("Analyzing text...");
      try {
        const bills = await extractBillDetails(text);
        setScannedBills(bills);
        setStatusMessage(bills.length > 0 ? "Scan complete!" : "No bills found in text.");
      } catch (error) {
        setStatusMessage("Error analyzing text.");
      } finally {
        setIsScanning(false);
      }
  };

  const handlePasteAndScan = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setManualText(text);
        handleScanText(text);
      } else {
        setStatusMessage("Clipboard is empty.");
      }
    } catch (err) {
      setStatusMessage("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleAddScannedBill = async (bill: ExtractedBill, cardId: string) => {
      try {
          await onAddBill({
              creditCardId: cardId,
              amount: bill.amount,
              billDate: bill.billDate || new Date().toISOString().split('T')[0],
              paymentDueDate: bill.dueDate || new Date().toISOString().split('T')[0],
              isPaid: false,
              notes: `Auto-scanned via Gemini (${bill.bankName})`
          });
          setScannedBills(prev => prev.filter(b => b !== bill));
      } catch (e) {
          alert("Failed to add bill.");
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg">
                <MagicIcon className="h-6 w-6 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">AI Bill Scanner</h2>
                <p className="text-xs text-gray-400">Extracts details from Gmail or Messages using Gemini</p>
             </div>
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
            <button 
                onClick={() => setActiveTab('gmail')} 
                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'gmail' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-700/30' : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/50'}`}
            >
                <GmailIcon className="w-4 h-4" /> Scan Gmail
            </button>
            <button 
                onClick={() => setActiveTab('text')} 
                className={`flex-1 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'text' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-slate-700/30' : 'text-gray-400 hover:text-gray-200 hover:bg-slate-700/50'}`}
            >
                <span className="text-lg">📄</span> Paste Text / Message
            </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-y-auto">
            
            {/* Input Area */}
            {activeTab === 'gmail' ? (
                <div className="text-center py-8">
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                        Connect your Gmail account to automatically find and extract recent credit card statements matching "Bill", "Statement", or "Due".
                    </p>
                    <button 
                        onClick={handleScanGmail}
                        disabled={isScanning}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {isScanning ? <LoadingSpinner size="sm" color="border-gray-900"/> : <GmailIcon className="w-5 h-5 text-red-500" />}
                        {isScanning ? "Scanning..." : "Scan Gmail Now"}
                    </button>
                    {statusMessage && <p className="mt-4 text-sm text-indigo-300">{statusMessage}</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    <textarea 
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Paste SMS content or email text here..."
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                    ></textarea>
                    
                    <div className="flex gap-3">
                      <button 
                          onClick={handlePasteAndScan}
                          disabled={isScanning}
                          className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 border border-slate-600 flex justify-center items-center gap-2"
                      >
                          📋 Paste & Scan
                      </button>
                      <button 
                          onClick={() => handleScanText()}
                          disabled={isScanning || !manualText.trim()}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                      >
                          {isScanning && <LoadingSpinner size="sm" color="border-white"/>}
                          Analyze Text
                      </button>
                    </div>
                    {statusMessage && <p className="text-sm text-center text-indigo-300">{statusMessage}</p>}
                </div>
            )}

            {/* Results Area */}
            {scannedBills.length > 0 && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detected Bills</h3>
                    <div className="grid gap-3">
                        {scannedBills.map((bill, index) => {
                            const matchedCardId = getMatchedCardId(bill);
                            return (
                                <BillResultItem 
                                    key={index} 
                                    bill={bill} 
                                    creditCards={creditCards} 
                                    matchedCardId={matchedCardId}
                                    onAdd={(cardId) => handleAddScannedBill(bill, cardId)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const BillResultItem: React.FC<{
    bill: ExtractedBill;
    creditCards: CreditCard[];
    matchedCardId?: string;
    onAdd: (cardId: string) => void;
}> = ({ bill, creditCards, matchedCardId, onAdd }) => {
    const [selectedCardId, setSelectedCardId] = useState(matchedCardId || "");

    return (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">₹{bill.amount.toLocaleString('en-IN')}</span>
                    <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-gray-300">{bill.bankName}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1 space-x-3">
                    <span>Due: {bill.dueDate || 'N/A'}</span>
                    <span>Stmt: {bill.billDate || 'N/A'}</span>
                    {bill.last4Digits && <span>End: {bill.last4Digits}</span>}
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                    value={selectedCardId} 
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="bg-slate-900 border border-slate-600 text-sm rounded-md px-2 py-1.5 text-gray-200 focus:outline-none focus:border-indigo-500 w-full sm:w-40"
                >
                    <option value="">Select Card...</option>
                    {creditCards.map(c => (
                        <option key={c.id} value={c.id}>{c.bankName} - {c.cardName}</option>
                    ))}
                </select>
                <button 
                    onClick={() => onAdd(selectedCardId)}
                    disabled={!selectedCardId}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add Bill"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
