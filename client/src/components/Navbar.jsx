import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Tool Tracker</Link>
      </div>
      
      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/checkout" className="nav-link">Check Out Tool</Link>
            <Link to="/checkin" className="nav-link">Check In Tool</Link>
            
            {user.role === 'admin' && (
              <>
                <Link to="/users" className="nav-link">Users</Link>
                <Link to="/reports" className="nav-link">Reports</Link>
              </>
            )}
            
            <button className="nav-link logout-btn">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 