import { useState, useRef } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import { apiUrl } from '../utils/api';
import '../styles/ToolCheckout.css';

const ToolCheckout = () => {
  const [step, setStep] = useState(1);
  const [personnelBarcode, setPersonnelBarcode] = useState('');
  const [toolBarcode, setToolBarcode] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [areaSearch, setAreaSearch] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [manualEntry, setManualEntry] = useState({ personnel: false, tool: false });
  const [manualValue, setManualValue] = useState('');
  const audioRef = useRef(null);

  // Predefined areas as specified in PRD
  const predefinedAreas = [
    'Site Office',
    'Main Workshop',
    'Electrical Room',
    'Mechanical Room',
    'Storage Area',
    'Construction Zone A',
    'Construction Zone B',
    'Outdoor Work Area'
  ];

  // Filtered areas for search
  const filteredAreas = predefinedAreas.filter(area =>
    area.toLowerCase().includes(areaSearch.toLowerCase())
  );

  // Sound feedback
  const playSound = (type) => {
    if (type === 'success') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } else if (type === 'error') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = 220;
      o.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.25);
    }
  };

  // Vibration feedback
  const vibrate = (pattern = [100]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handlePersonnelScan = (barcode) => {
    setPersonnelBarcode(barcode);
    setError('');
    setStep(2);
    setManualEntry({ ...manualEntry, personnel: false });
    setManualValue('');
    playSound('success');
    vibrate([50]);
  };

  const handleToolScan = (barcode) => {
    setToolBarcode(barcode);
    setError('');
    setStep(3);
    setManualEntry({ ...manualEntry, tool: false });
    setManualValue('');
    playSound('success');
    vibrate([50]);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(apiUrl('/api/tools/checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personnelBarcode,
          toolBarcode,
          area: selectedArea,
        }),
      });

      if (!response.ok) {
        playSound('error');
        vibrate([100, 50, 100]);
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to check out tool');
      }

      setSuccess(true);
      setShowSummary(true);
      playSound('success');
      vibrate([100, 50, 100]);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      playSound('error');
      vibrate([100, 50, 100]);
    }
  };

  const handleNextCheckout = () => {
    setStep(1);
    setPersonnelBarcode('');
    setToolBarcode('');
    setSelectedArea('');
    setError('');
    setSuccess(false);
    setShowSummary(false);
    setIsScanning(true);
    setManualEntry({ personnel: false, tool: false });
    setManualValue('');
  };

  const handleEndSession = () => {
    window.location.href = '/dashboard';
  };

  const renderStep = () => {
    if (showSummary) {
      return (
        <div className="checkout-summary">
          {success ? (
            <div className="success-message">Tool checked out successfully!</div>
          ) : null}
          <div className="summary-details">
            <p><b>Personnel:</b> {personnelBarcode}</p>
            <p><b>Tool:</b> {toolBarcode}</p>
            <p><b>Area:</b> {selectedArea}</p>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="submit-button" onClick={handleNextCheckout} style={{ minWidth: 140 }}>Start Next Checkout</button>
            <button className="submit-button" style={{ background: '#888', minWidth: 140 }} onClick={handleEndSession}>End Session</button>
          </div>
        </div>
      );
    }
    switch (step) {
      case 1:
        return (
          <div className="checkout-step">
            <h2>Step 1: Scan Personnel Barcode</h2>
            <p>Please scan the personnel barcode from the hardhat sticker or enter it manually.</p>
            {!manualEntry.personnel ? (
              <>
                <BarcodeScanner
                  onScan={handlePersonnelScan}
                  onError={(err) => { setError(err); playSound('error'); vibrate([100, 50, 100]); }}
                  isScanning={isScanning}
                />
                <button
                  className="submit-button"
                  style={{ marginTop: 16, minWidth: 180 }}
                  onClick={() => { setManualEntry({ ...manualEntry, personnel: true }); setManualValue(''); }}
                >
                  Enter ID Manually
                </button>
              </>
            ) : (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  value={manualValue}
                  onChange={e => setManualValue(e.target.value)}
                  placeholder="Enter Personnel Barcode"
                  style={{ fontSize: '1.1rem', padding: '0.7rem', borderRadius: 6, width: '100%', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="submit-button"
                    style={{ minWidth: 120 }}
                    onClick={() => handlePersonnelScan(manualValue)}
                    disabled={!manualValue}
                  >
                    Submit
                  </button>
                  <button
                    className="submit-button"
                    style={{ background: '#888', minWidth: 120 }}
                    onClick={() => { setManualEntry({ ...manualEntry, personnel: false }); setManualValue(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="checkout-step">
            <h2>Step 2: Scan Tool Barcode</h2>
            <p>Please scan the tool barcode or enter it manually.</p>
            {!manualEntry.tool ? (
              <>
                <BarcodeScanner
                  onScan={handleToolScan}
                  onError={(err) => { setError(err); playSound('error'); vibrate([100, 50, 100]); }}
                  isScanning={isScanning}
                />
                <button
                  className="submit-button"
                  style={{ marginTop: 16, minWidth: 180 }}
                  onClick={() => { setManualEntry({ ...manualEntry, tool: true }); setManualValue(''); }}
                >
                  Enter ID Manually
                </button>
              </>
            ) : (
              <div style={{ marginTop: 16 }}>
                <input
                  type="text"
                  value={manualValue}
                  onChange={e => setManualValue(e.target.value)}
                  placeholder="Enter Tool Barcode"
                  style={{ fontSize: '1.1rem', padding: '0.7rem', borderRadius: 6, width: '100%', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="submit-button"
                    style={{ minWidth: 120 }}
                    onClick={() => handleToolScan(manualValue)}
                    disabled={!manualValue}
                  >
                    Submit
                  </button>
                  <button
                    className="submit-button"
                    style={{ background: '#888', minWidth: 120 }}
                    onClick={() => { setManualEntry({ ...manualEntry, tool: false }); setManualValue(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="checkout-step">
            <h2>Step 3: Select Tool Usage Area</h2>
            <div className="area-selection">
              <div className="area-search">
                <input
                  type="text"
                  placeholder="Search areas..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  style={{ fontSize: '1.1rem', padding: '0.7rem', borderRadius: 6, marginBottom: 10, width: '100%' }}
                />
              </div>
              <div className="area-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {filteredAreas.map((area) => (
                  <button
                    key={area}
                    className={`area-button ${selectedArea === area ? 'selected' : ''}`}
                    onClick={() => handleAreaSelect(area)}
                    style={{ minWidth: 120, padding: '0.8rem', borderRadius: 6, fontSize: '1rem' }}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={!selectedArea}
              style={{ marginTop: 20, minWidth: 180 }}
            >
              Complete Checkout
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tool-checkout">
      <h1>Tool Checkout</h1>
      {error && <div className="error-message">{error}</div>}
      {renderStep()}
    </div>
  );
};

export default ToolCheckout; 