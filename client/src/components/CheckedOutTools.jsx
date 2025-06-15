import React, { useState, useEffect } from 'react';
import '../styles/CheckedOutTools.css';

const CheckedOutTools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCheckedOutTools = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tools/checked-out');
        if (!response.ok) {
          throw new Error('Failed to fetch checked-out tools');
        }
        const data = await response.json();
        setTools(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckedOutTools();
  }, []);

  if (loading) {
    return (
      <div className="checked-out-tools">
        <h2>Checked Out Tools</h2>
        <div className="loading">Loading checked-out tools...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checked-out-tools">
        <h2>Checked Out Tools</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="checked-out-tools">
      <h2>Checked Out Tools</h2>
      {tools.length === 0 ? (
        <div className="no-tools">No tools are currently checked out</div>
      ) : (
        <div className="tools-grid">
          {tools.map((tool) => (
            <div key={tool.id} className="tool-card">
              <h3>{tool.description}</h3>
              <p className="tool-id">ID: {tool.id}</p>
              <div className="checkout-info">
                <p>
                  <span className="label">Checked out by:</span>
                  <span className="value">{tool.checkedOutBy}</span>
                </p>
                <p>
                  <span className="label">Checkout date:</span>
                  <span className="value">
                    {new Date(tool.checkoutDate).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <span className="label">Expected return:</span>
                  <span className="value">
                    {new Date(tool.expectedReturnDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckedOutTools; 