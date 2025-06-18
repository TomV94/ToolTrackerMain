import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css'; // Reuse for basic styling

const Login = () => {
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await login(barcode);
      if (result && result.loginSuccess) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError('Invalid barcode. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Invalid barcode. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ maxWidth: 400, margin: '0 auto', paddingTop: 60 }}>
      <h1>Tool Tracker Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="barcode" className="form-label">Scan or Enter Barcode</label>
          <input
            id="barcode"
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            autoFocus
            required
            inputMode="text"
            placeholder="e.g. ADMIN001"
            style={{ fontSize: '1.2rem', padding: '1rem', marginBottom: 10 }}
          />
        </div>
        <button type="submit" disabled={loading || !barcode} style={{ width: '100%', fontSize: '1.1rem' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error-message"><p>{error}</p></div>}
        {success && <div className="success-message"><p>Login successful!</p></div>}
      </form>
    </div>
  );
};

export default Login; 