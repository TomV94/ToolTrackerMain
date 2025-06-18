import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import '../styles/BarcodeScanner.css';

const BarcodeScanner = ({ onScan, onError, isScanning = true }) => {
  const videoRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef(new Audio('/scan-success.mp3'));

  useEffect(() => {
    let codeReader;
    let videoElement;

    const initializeScanner = async () => {
      try {
        codeReader = new BrowserMultiFormatReader();
        videoElement = videoRef.current;

        // Configure for Code-128 only
        const hints = new Map();
        hints.set(BarcodeFormat.CODE_128, true);

        if (isScanning && videoElement) {
          await codeReader.decodeFromVideoDevice(
            null,
            videoElement,
            (result, error) => {
              if (result) {
                // Play success sound
                audioRef.current.play().catch(console.error);
                
                // Visual feedback
                videoElement.classList.add('scan-success');
                setTimeout(() => {
                  videoElement.classList.remove('scan-success');
                }, 500);

                onScan(result.text);
              }
              if (error && error.message !== 'No MultiFormat Readers were able to detect the code.') {
                onError(error);
              }
            },
            hints
          );
          setIsInitialized(true);
        }
      } catch (error) {
        onError(error);
      }
    };

    initializeScanner();

    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [isScanning, onScan, onError]);

  return (
    <div className="barcode-scanner">
      <div className="scanner-container">
        <video
          ref={videoRef}
          className="scanner-video"
          playsInline
        />
        {!isInitialized && (
          <div className="scanner-loading">
            <div className="loading-spinner"></div>
            <p>Initializing camera...</p>
          </div>
        )}
        <div className="scanner-overlay">
          <div className="scanner-guide"></div>
        </div>
      </div>
      <div className="scanner-instructions">
        <p>Position the barcode within the frame</p>
        <p className="scanner-hint">Ensure good lighting for better scanning</p>
      </div>
    </div>
  );
};

export default BarcodeScanner; 