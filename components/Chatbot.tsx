
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { SendIcon, UserIcon, BotIcon } from './icons';

interface ChatbotProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => void;
  isLoading: boolean;
  onClose?: () => void; // Optional close handler
}

export const Chatbot: React.FC<ChatbotProps> = ({ messages, onSubmit, isLoading, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl sm:rounded-t-none"> {/* Ensure top corners are not rounded if it's part of an overlay with rounded top */}
      <header className="p-3 sm:p-4 border-b border-slate-700 flex items-center relative">
        <h2 className="text-lg sm:text-xl font-semibold text-sky-400 text-center w-full">Kaash AI Assistant</h2>
        {onClose && (
            <button 
                onClick={onClose} 
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors p-1" 
                aria-label="Close chat"
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        )}
      </header>
      
      <div className="flex-grow p-2.5 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end max-w-[80%] sm:max-w-xs md:max-w-md lg:max-w-lg ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-1 rounded-full text-white flex-shrink-0 ${msg.sender === 'user' ? 'bg-sky-500 ml-1.5 sm:ml-2' : 'bg-slate-600 mr-1.5 sm:mr-2'}`}>
                {msg.sender === 'user' ? <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div
                className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow ${
                  msg.sender === 'user' 
                    ? 'bg-sky-500 text-white rounded-br-none' 
                    : 'bg-slate-700 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-[0.65rem] sm:text-xs mt-1 ${msg.sender === 'user' ? 'text-sky-200 text-right' : 'text-gray-500 text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-end max-w-xs md:max-w-md lg:max-w-lg flex-row">
                <div className="p-1 rounded-full text-white bg-slate-600 mr-1.5 sm:mr-2 flex-shrink-0">
                    <BotIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow bg-slate-700 text-gray-200 rounded-bl-none">
                    <LoadingSpinner size="sm"/>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 sm:p-3 border-t border-slate-700 flex items-center space-x-1.5 sm:space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Kaash..."
          className="flex-grow bg-slate-700 border border-slate-600 text-gray-100 rounded-lg p-2.5 sm:p-3 focus:ring-sky-500 focus:border-sky-500 transition placeholder-gray-500 text-sm sm:text-base"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold p-2.5 sm:p-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <SendIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>
      </form>
    </div>
  );
};
