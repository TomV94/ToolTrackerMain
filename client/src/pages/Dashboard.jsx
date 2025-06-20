import { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCog, FaUserCircle, FaSignOutAlt, FaBox, FaExclamationTriangle, FaUsers, FaCheckCircle, FaMapMarkerAlt, FaUndo } from 'react-icons/fa';
// Optionally import a chart library for graphs
// import { Bar } from 'react-chartjs-2';

const mockStats = {
  checkedOutTools: [
    { id: 1, name: 'Hammer', user: 'John Worker' },
    { id: 2, name: 'Cordless Drill', user: 'Admin User' }
  ],
  overdueTools: [
    { id: 3, name: 'Tape Measure', user: 'Store Person', hoursOverdue: 30 }
  ],
  lateReturnOffenders: [
    { id: 2, name: 'Store Person', lateReturns: 3 }
  ],
  toolsLoggedToday: 5,
  mostUsedArea: 'Main Workshop',
  toolReturnsCount: 2,
  missingTools: [
    { id: 4, name: 'Safety Helmet', hoursMissing: 48 }
  ],
  lostTime: 45,
  lostTimeLogs: [
    { id: 1, user: 'Admin User', tool: 'Tape Measure', reason: 'tool_missing', minutes: 15, comment: 'Could not find Tape Measure', timestamp: '2024-06-10 09:00' }
  ]
};

const user = { name: 'admin', role: 'admin' }; // Placeholder, replace with real user context if available
const notifications = 3; // Placeholder, replace with real notification count if available

const Dashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);
  const [showLostTime, setShowLostTime] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('/api/dashboard/summary'))
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats(mockStats);
        setLoading(false);
      });
  }, []);

  // Top Section: Summary Tiles
  const summaryTiles = [
    { label: 'Checked Out Tools', value: stats.checkedOutTools.length },
    { label: 'Overdue Tools', value: stats.overdueTools.length },
    { label: 'Late Return Offenders', value: stats.lateReturnOffenders.length },
    { label: 'Tools Logged Today', value: stats.toolsLoggedToday },
    { label: 'Most Used Area', value: stats.mostUsedArea },
    { label: 'Tool Returns', value: stats.toolReturnsCount },
    { label: 'Missing Tools >24h', value: stats.missingTools.length },
    { label: 'Total Time Lost (min)', value: stats.lostTime }
  ];

  // Summary card config for screenshot alignment
  const summaryCards = [
    { label: 'Checked Out', value: stats.checkedOutTools.length, icon: <FaBox size={22} color="#4f8cff" />, bg: '#f5f8ff' },
    { label: 'Overdue (>24h)', value: stats.overdueTools.length, icon: <FaExclamationTriangle size={22} color="#f87171" />, bg: '#fff6f6' },
    { label: 'Repeat Offenders', value: stats.lateReturnOffenders.length, icon: <FaUsers size={22} color="#fbbf24" />, bg: '#fffaf3' },
    { label: 'Logged Today', value: stats.toolsLoggedToday, icon: <FaCheckCircle size={22} color="#34d399" />, bg: '#f6fefb' },
    { label: 'Top Area', value: stats.mostUsedArea || '—', icon: <FaMapMarkerAlt size={22} color="#a78bfa" />, bg: '#f7f6ff', extra: stats.mostUsedAreaCount ? `${stats.mostUsedAreaCount} tools` : '' },
    { label: 'Returns Today', value: stats.toolReturnsCount, icon: <FaUndo size={22} color="#4f8cff" />, bg: '#f5f8ff' },
  ];

  // Helper for duration
  function formatDuration(start) {
    if (!start) return '';
    const startTime = new Date(`1970-01-01T${start}`);
    const now = new Date();
    let diff = (now.getHours() * 60 + now.getMinutes()) - (startTime.getHours() * 60 + startTime.getMinutes());
    if (diff < 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  }

  // Filter checked out tools by search
  const filteredCheckedOutTools = stats.checkedOutTools.filter(tool => {
    const q = search.toLowerCase();
    return (
      (tool.name && tool.name.toLowerCase().includes(q)) ||
      (tool.user && tool.user.toLowerCase().includes(q)) ||
      (tool.location && tool.location.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <div className="dashboard"><h1>Dashboard</h1><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1rem 1.2rem 0', borderBottom: '1px solid #eee', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 24 }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 22, color: '#222' }}>ToolTracker</div>
            <div style={{ fontSize: 14, color: '#666' }}>Welcome, {user.name} ({user.role})</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 260, maxWidth: 400, padding: '0.6rem 2.2rem 0.6rem 1rem', borderRadius: 8, border: '1px solid #ddd', fontSize: 16, background: '#f9f9fb', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative' }}>
            <FaBell size={22} color="#444" />
            {notifications > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -8, background: '#e11d48', color: 'white', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifications}</span>
            )}
          </div>
          <FaCog size={22} color="#444" style={{ cursor: 'pointer' }} />
          <FaUserCircle size={28} color="#444" style={{ cursor: 'pointer' }} />
          <FaSignOutAlt size={22} color="#444" style={{ cursor: 'pointer' }} />
        </div>
      </div>
      <h1>Dashboard</h1>
      {/* Summary Cards Row */}
      <div className="dashboard-summary-row" style={{ display: 'flex', gap: 20, margin: '32px 0 28px 0', overflowX: 'auto' }}>
        {summaryCards.map((card, idx) => (
          <div key={idx} style={{ background: card.bg, borderRadius: 12, minWidth: 180, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#222' }}>{card.value}</div>
            <div style={{ fontSize: 15, color: '#555', marginTop: 2 }}>{card.label}</div>
            {card.label === 'Top Area' && card.extra && (
              <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{card.extra}</div>
            )}
          </div>
        ))}
      </div>
      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '1.1rem 0',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          Loan Tool
        </button>
        <button
          onClick={() => navigate('/checkin')}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '1.1rem 0',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          Return Tool
        </button>
        <button
          onClick={() => navigate('/lost-time')}
          style={{
            flex: 1,
            minWidth: 180,
            padding: '1.1rem 0',
            background: '#f59e42',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        >
          Record Lost Time
        </button>
      </div>
      {/* Checked Out Tools Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 0, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: 18 }}>
          <FaBox size={20} style={{ marginRight: 10, color: '#4f8cff' }} />
          Currently Checked Out Tools
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f9fb', color: '#444', fontWeight: 600, fontSize: 15 }}>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>Tool</th>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>Time Out</th>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>Duration</th>
              <th style={{ textAlign: 'left', padding: '12px 24px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCheckedOutTools.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>No tools currently checked out</td></tr>
            ) : (
              filteredCheckedOutTools.map((tool, idx) => {
                // Mock fields for screenshot alignment
                const toolId = tool.id || `TL${String(idx + 1).padStart(3, '0')}`;
                const toolName = tool.name || '—';
                const userName = tool.user || '—';
                const location = tool.location || '—';
                const timeOut = tool.timeOut || '—';
                const duration = tool.duration || '—';
                const status = tool.status || 'Active';
                // For demo, use screenshot-style mock data if missing
                return (
                  <tr key={toolId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '14px 24px', fontWeight: 600 }}>
                      {toolName}<div style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>{toolId}</div>
                    </td>
                    <td style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaUserCircle size={18} style={{ color: '#888' }} /> {userName}
                    </td>
                    <td style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FaMapMarkerAlt size={16} style={{ color: '#888' }} /> {location}
                    </td>
                    <td style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="16" height="16" fill="#888" style={{ marginRight: 2 }} viewBox="0 0 24 24"><path d="M12 8a1 1 0 0 1 1 1v3h2a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v3z"/><circle cx="12" cy="12" r="10" fill="none" stroke="#888" strokeWidth="2"/></svg> {timeOut}
                    </td>
                    <td style={{ padding: '14px 24px' }}>{duration}</td>
                    <td style={{ padding: '14px 24px' }}>
                      {status === 'Overdue' ? (
                        <span style={{ background: '#fee2e2', color: '#e11d48', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 14 }}>Overdue</span>
                      ) : (
                        <span style={{ background: '#e0f2fe', color: '#2563eb', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 14 }}>Active</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 