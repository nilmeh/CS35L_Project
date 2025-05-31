import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from './AuthProvider';
import { useState } from 'react';
import { auth } from '../services/firebase';

function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      alert('Error logging out');
    } finally {
      setLoggingOut(false);
    }
  };

  // Hide navbar links on login/signup pages
  const hideLinks = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: 0.5, background: 'none', color: 'white' }}>UCLA Meal Planner</h1>
        </Link>
      </div>
      {!hideLinks && (
        <div className="navbar-links">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/menu" 
            className={location.pathname === '/menu' ? 'active' : ''}
          >
            Menu
          </Link>
          <Link 
            to="/my-plans" 
            className={location.pathname === '/my-plans' ? 'active' : ''}
          >
            My Plans
          </Link>
          {user && (
            <button className="navbar-logout-btn" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out...' : 'Log Out'}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;