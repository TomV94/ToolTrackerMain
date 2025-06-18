import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState('');

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch(apiUrl('/api/user/current'));
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const pollServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error('Server offline');
        const data = await res.json();
        if (isMounted) setServerStatus('Server online');
      } catch (e) {
        if (isMounted) setServerStatus('Server offline');
      }
    };
    pollServer();
    const interval = setInterval(pollServer, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  const quickActions = [
    {
      title: 'Check Out Tool',
      icon: '📦',
      path: '/checkout',
      roles: ['storeperson', 'worker', 'admin']
    },
    {
      title: 'Check In Tool',
      icon: '📥',
      path: '/checkin',
      roles: ['storeperson', 'worker', 'admin']
    },
    {
      title: 'View Dashboard',
      icon: '📊',
      path: '/dashboard',
      roles: ['storeperson', 'admin']
    },
    {
      title: 'Manage Users',
      icon: '👥',
      path: '/users',
      roles: ['admin']
    },
    {
      title: 'View Reports',
      icon: '📈',
      path: '/reports',
      roles: ['storeperson', 'admin']
    }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {serverStatus && (
        <div style={{ textAlign: 'center', marginBottom: 10, color: serverStatus === 'Server online' ? 'green' : 'red' }}>
          {serverStatus}
        </div>
      )}
      <header className="home-header">
        <h1>Tool Tracker</h1>
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        )}
      </header>

      <div className="quick-actions">
        {quickActions
          .filter(action => user && action.roles.includes(user.role))
          .map((action, index) => (
            <button
              key={index}
              className="action-button"
              onClick={() => navigate(action.path)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
            </button>
          ))}
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {/* Placeholder for recent activity */}
          <p className="no-activity">No recent activity to display</p>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-card">
          <h3>Tools Out</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Overdue</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Today's Returns</h3>
          <p className="stat-value">0</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 