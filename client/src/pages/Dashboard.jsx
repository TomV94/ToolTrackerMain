import { useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);
  const [showLostTime, setShowLostTime] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);
  const navigate = useNavigate();

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

  if (loading) {
    return <div className="dashboard"><h1>Dashboard</h1><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {/* Top Section: Summary Tiles */}
      <div className="dashboard-summary-tiles" style={{ display: 'flex', overflowX: 'auto', gap: 16, marginBottom: 24 }}>
        {summaryTiles.map((tile, idx) => (
          <div key={idx} className="summary-tile" style={{ minWidth: 180, background: 'white', borderRadius: 8, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{tile.value}</div>
            <div style={{ fontSize: 14, color: '#555', marginTop: 6 }}>{tile.label}</div>
          </div>
        ))}
      </div>
      {/* Action Buttons for Transactions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: 8,
            background: '#2196f3',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 160
          }}
          onClick={() => navigate('/checkout')}
        >
          Loan Tool
        </button>
        <button
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            borderRadius: 8,
            background: '#00C851',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            minWidth: 160
          }}
          onClick={() => navigate('/checkin')}
        >
          Return Tool
        </button>
      </div>

      {/* Middle Section: Graph Widgets (placeholders) */}
      <div className="dashboard-graphs" style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
        <div className="graph-widget" style={{ background: 'white', borderRadius: 8, padding: 16 }}>
          <h3>Usage by Area</h3>
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            [Graph Placeholder]
          </div>
        </div>
        <div className="graph-widget" style={{ background: 'white', borderRadius: 8, padding: 16 }}>
          <h3>Time Lost (Daily)</h3>
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            [Graph Placeholder]
          </div>
        </div>
        <div className="graph-widget" style={{ background: 'white', borderRadius: 8, padding: 16 }}>
          <h3>Missing Tools Count</h3>
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
            [Graph Placeholder]
          </div>
        </div>
        <div className="graph-widget" style={{ background: 'white', borderRadius: 8, padding: 16, minHeight: 160 }}>
          <h3>Top Offenders</h3>
          {stats.topOffenders && stats.topOffenders.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {stats.topOffenders.map((offender, idx) => (
                <li key={idx} style={{ marginBottom: 12 }}>
                  <b>{offender.user}</b>
                  <ul style={{ marginLeft: 16, marginTop: 4 }}>
                    {offender.tools.map((tool, tIdx) => (
                      <li key={tIdx}>
                        {tool.name} — <span style={{ color: '#c0392b' }}>{tool.hoursOverdue}h overdue</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: '#aaa', textAlign: 'center' }}>[No top offenders]</div>
          )}
        </div>
      </div>

      {/* Bottom Section: Expandable Lists */}
      <div className="dashboard-lists" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setShowLostTime(v => !v)} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#f5f5f5', border: 'none', fontWeight: 600, marginBottom: 6 }}>
            {showLostTime ? 'Hide' : 'Show'} Lost Time Logs
          </button>
          {showLostTime && (
            <div style={{ background: 'white', borderRadius: 8, padding: 12 }}>
              {stats.lostTimeLogs.length === 0 ? <div style={{ color: '#aaa' }}>No lost time logs</div> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {stats.lostTimeLogs.map(log => (
                    <li key={log.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                      <div><b>{log.user}</b> lost <b>{log.minutes} min</b> on <b>{log.tool}</b> ({log.reason})</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{log.timestamp} {log.comment && `- ${log.comment}`}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div>
          <button onClick={() => setShowOverdue(v => !v)} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#f5f5f5', border: 'none', fontWeight: 600, marginBottom: 6 }}>
            {showOverdue ? 'Hide' : 'Show'} Overdue Tools
          </button>
          {showOverdue && (
            <div style={{ background: 'white', borderRadius: 8, padding: 12 }}>
              {stats.overdueTools.length === 0 ? <div style={{ color: '#aaa' }}>No overdue tools</div> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {stats.overdueTools.map(tool => (
                    <li key={tool.id} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                      <div><b>{tool.name}</b> checked out by <b>{tool.user}</b> ({tool.hoursOverdue}h overdue)</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 