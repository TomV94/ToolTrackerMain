import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/BarcodeScanner.css';

const BarcodeScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    scannerRef.current = scanner;

    scanner.render(onScanSuccess, onScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="scanner-container">
      <div id="reader" className="scanner"></div>
    </div>
  );
};

export default BarcodeScanner; 