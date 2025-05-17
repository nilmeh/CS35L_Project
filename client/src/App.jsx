import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import PreferencesPage from './pages/PreferencesPage';
import EditPlanPage from './pages/EditPlanPage';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when route changes or on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>UCLA Dining</h1>
              <span className="logo-tag">Meal Planner</span>
            </div>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <ul className="nav-list">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link to="/preferences" className="nav-link">Preferences</Link>
                </li>
                <li className="nav-item">
                  <Link to="/edit-plan" className="nav-link">Edit Plan</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/edit-plan" element={<EditPlanPage />} />
          </Routes>
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} UCLA Dining Meal Planner</p>
            <div className="footer-links">
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms of Service</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;