import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { apiUrl } from '../utils/api';
import '../styles/ToolReservation.css';

const ToolReservation = ({ toolId, onReserve }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableDates();
  }, [toolId]);

  const fetchAvailableDates = async () => {
    try {
      const response = await fetch(apiUrl(`/api/tools/${toolId}/available-dates`));
      const data = await response.json();
      setAvailableDates(data);
    } catch (error) {
      console.error('Failed to fetch available dates:', error);
    }
  };

  const handleReserve = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/tools/reserve'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          date: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reserve tool');
      }

      onReserve();
      setSelectedDate('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  // Generate next 7 days for date selection
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  return (
    <div className="tool-reservation">
      <h3>Reserve Tool</h3>
      
      <div className="date-selection">
        <label>Select Date:</label>
        <div className="date-grid">
          {nextSevenDays.map(date => {
            const isAvailable = availableDates.includes(date);
            return (
              <button
                key={date}
                className={`date-button ${selectedDate === date ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                onClick={() => isAvailable && setSelectedDate(date)}
                disabled={!isAvailable}
              >
                {format(new Date(date), 'EEE, MMM d')}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="reserve-button"
        onClick={handleReserve}
        disabled={!selectedDate}
      >
        Reserve Tool
      </button>
    </div>
  );
};

export default ToolReservation; 