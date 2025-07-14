import React, { useState, useRef, useEffect, useCallback } from 'react';
import { extractAmountFromBill } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface BillScannerProps {
  onScanSuccess: (amount: number) => void;
  onCancel: () => void;
}

export const BillScanner: React.FC<BillScannerProps> = ({ onScanSuccess, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Camera access is required. Please enable camera permissions for this site in your browser settings and refresh.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    setError(null);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageDataUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setImageDataUrl(null);
    setError(null);
    startCamera();
  };

  const handleConfirm = async () => {
    if (!imageDataUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      // The data URL is `data:image/jpeg;base64,xxxxxxxx...`
      // We need to extract just the base64 part.
      const base64Image = imageDataUrl.split(',')[1];
      const amount = await extractAmountFromBill(base64Image);
      if (amount !== null) {
        onScanSuccess(amount);
      } else {
        setError("Could not find an amount on the bill. Please try again with a clearer image.");
      }
    } catch (err: any) {
      setError(`An error occurred during analysis: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-slate-900 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg border border-slate-700 relative">
        <h2 className="text-2xl font-semibold text-center text-sky-400 mb-4">
          {imageDataUrl ? 'Confirm Photo' : 'Scan a Bill'}
        </h2>

        <div className="w-full aspect-video bg-slate-800 rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-700">
          {!imageDataUrl && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label="Camera feed"
            />
          )}
          {imageDataUrl && (
            <img src={imageDataUrl} alt="Captured bill" className="w-full h-full object-contain" />
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sky-300">Analyzing bill...</p>
            </div>
          )}
        </div>

        {error && (
            <div className="mt-4 p-3 text-center bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
                {error}
            </div>
        )}

        <div className="flex justify-center space-x-4 mt-6">
          {!imageDataUrl ? (
            <>
              <button
                onClick={onCancel}
                className="px-6 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                disabled={!!error}
              >
                Capture
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-6 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                disabled={isLoading}
              >
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};
