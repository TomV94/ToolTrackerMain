import React, { useState } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import CheckedOutTools from '../components/CheckedOutTools';
import '../styles/Home.css';

const Home = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [error, setError] = useState(null);

  const handleScanSuccess = (code) => {
    setScannedCode(code);
    setShowScanner(false);
    setError(null);
  };

  const handleScanError = (err) => {
    setError(err.message);
  };

  return (
    <div className="home-container">
      <h1>Tool Tracker</h1>
      
      <div className="scanner-section">
        <h2>Barcode Scanner</h2>
        {!showScanner ? (
          <button 
            className="scan-button"
            onClick={() => setShowScanner(true)}
          >
            Open Scanner
          </button>
        ) : (
          <>
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
            <button 
              className="close-scanner-button"
              onClick={() => setShowScanner(false)}
            >
              Close Scanner
            </button>
          </>
        )}
        
        {scannedCode && (
          <div className="scan-result">
            <p>Scanned Code: {scannedCode}</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}
      </div>

      <CheckedOutTools />

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-button">Add New Tool</button>
          <button className="action-button">View All Tools</button>
          <button className="action-button">Check Out Tool</button>
          <button className="action-button">Return Tool</button>
        </div>
      </div>
    </div>
  );
};

export default Home; 