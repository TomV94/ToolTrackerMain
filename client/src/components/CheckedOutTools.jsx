import { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import '../styles/CheckedOutTools.css';

const CheckedOutTools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCheckedOutTools();
  }, []);

  const fetchCheckedOutTools = async () => {
    try {
      const response = await fetch(apiUrl('/api/tools/checked-out'));
      if (!response.ok) {
        throw new Error('Failed to fetch checked out tools');
      }
      const data = await response.json();
      setTools(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'overdue':
        return 'status-overdue';
      case 'reserved':
        return 'status-reserved';
      default:
        return 'status-normal';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="checked-out-tools loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checked-out-tools error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="checked-out-tools">
      <h2>Currently Checked Out Tools</h2>
      {tools.length === 0 ? (
        <p className="no-tools">No tools are currently checked out</p>
      ) : (
        <div className="tools-list">
          {tools.map((tool) => (
            <div key={tool.id} className="tool-card">
              <div className="tool-header">
                <h3>{tool.description}</h3>
                <span className={`status-badge ${getStatusClass(tool.status)}`}>
                  {tool.status}
                </span>
              </div>
              <div className="tool-details">
                <p>
                  <strong>Type:</strong> {tool.type}
                </p>
                <p>
                  <strong>Checked out by:</strong> {tool.lastUser.name}
                </p>
                <p>
                  <strong>Location:</strong> {tool.locationUsed}
                </p>
                <p>
                  <strong>Checkout time:</strong> {formatTime(tool.checkoutTime)}
                </p>
                {tool.expectedReturnTime && (
                  <p>
                    <strong>Expected return:</strong>{' '}
                    {formatTime(tool.expectedReturnTime)}
                  </p>
                )}
              </div>
              {tool.status === 'overdue' && (
                <div className="overdue-warning">
                  <span className="warning-icon">⚠️</span>
                  <p>This tool is overdue for return</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckedOutTools; 