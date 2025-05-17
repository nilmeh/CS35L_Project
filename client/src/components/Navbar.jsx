import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>UCLA Meal Planner</h1>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link 
          to="/preferences" 
          className={location.pathname === '/preferences' ? 'active' : ''}
        >
          Set Preferences
        </Link>
        <Link 
          to="/edit-plan" 
          className={location.pathname === '/edit-plan' ? 'active' : ''}
        >
          Edit Meal Plan
        </Link>
      </div>
    </nav>
  );
}

export default Navbar; 