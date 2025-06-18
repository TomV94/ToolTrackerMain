import { useState, useRef } from 'react';
import BarcodeScanner from '../components/BarcodeScanner';
import { apiUrl } from '../utils/api';
import '../styles/ToolCheckin.css';

const ToolCheckin = () => {
  const [step, setStep] = useState(1);
  const [personnelBarcode, setPersonnelBarcode] = useState('');
  const [toolBarcode, setToolBarcode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [isStorepersonOverride, setIsStorepersonOverride] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const audioRef = useRef(null);
  const [manualEntry, setManualEntry] = useState({ personnel: false, tool: false });
  const [manualValue, setManualValue] = useState('');

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

  const handleToolScan = async (barcode) => {
    try {
      const response = await fetch(apiUrl(`/api/tools/verify-ownership/${barcode}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        playSound('error');
        vibrate([100, 50, 100]);
        throw new Error(data.message || 'Failed to verify tool ownership');
      }

      if (data.ownerBarcode !== personnelBarcode && !isStorepersonOverride) {
        setError('This tool was not checked out by this personnel. Please contact a storeperson for override.');
        playSound('error');
        vibrate([100, 50, 100]);
        return;
      }

      setToolBarcode(barcode);
      setError('');
      setStep(3);
      setManualEntry({ ...manualEntry, tool: false });
      setManualValue('');
      playSound('success');
      vibrate([50]);
    } catch (err) {
      setError(err.message);
      playSound('error');
      vibrate([100, 50, 100]);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(apiUrl('/api/tools/checkin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personnelBarcode,
          toolBarcode,
          isStorepersonOverride,
        }),
      });

      if (!response.ok) {
        playSound('error');
        vibrate([100, 50, 100]);
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to check in tool');
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

  const handleNextCheckin = () => {
    setStep(1);
    setPersonnelBarcode('');
    setToolBarcode('');
    setError('');
    setSuccess(false);
    setShowSummary(false);
    setIsScanning(true);
    setIsStorepersonOverride(false);
    setManualEntry({ personnel: false, tool: false });
    setManualValue('');
  };

  const handleEndSession = () => {
    window.location.href = '/dashboard';
  };

  const renderStep = () => {
    if (showSummary) {
      return (
        <div className="checkin-summary">
          {success ? (
            <div className="success-message">Tool checked in successfully!</div>
          ) : null}
          <div className="summary-details">
            <p><b>Personnel:</b> {personnelBarcode}</p>
            <p><b>Tool:</b> {toolBarcode}</p>
            {isStorepersonOverride && (
              <p className="override-notice">Storeperson Override Applied</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="submit-button" onClick={handleNextCheckin} style={{ minWidth: 140 }}>Start Next Check-in</button>
            <button className="submit-button" style={{ background: '#888', minWidth: 140 }} onClick={handleEndSession}>End Session</button>
          </div>
        </div>
      );
    }
    switch (step) {
      case 1:
        return (
          <div className="checkin-step">
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
          <div className="checkin-step">
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
            <div className="storeperson-override">
              <label>
                <input
                  type="checkbox"
                  checked={isStorepersonOverride}
                  onChange={(e) => setIsStorepersonOverride(e.target.checked)}
                />
                Storeperson Override
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="checkin-step">
            <h2>Step 3: Confirm Check-in</h2>
            <div className="checkin-summary">
              <p>Personnel: {personnelBarcode}</p>
              <p>Tool: {toolBarcode}</p>
              {isStorepersonOverride && (
                <p className="override-notice">Storeperson Override Applied</p>
              )}
            </div>
            <button className="submit-button" onClick={handleSubmit} style={{ minWidth: 180, marginTop: 20 }}>
              Complete Check-in
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tool-checkin">
      <h1>Tool Check-in</h1>
      {error && <div className="error-message">{error}</div>}
      {renderStep()}
    </div>
  );
};

export default ToolCheckin; 