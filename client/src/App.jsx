import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Dashboard from './pages/Dashboard';
import PreferencesPage from './pages/PreferencesPage';
import EditPlanPage from './pages/EditPlanPage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return children;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
    <AuthProvider>
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
                    <Link to="/menu" className="nav-link">Menu</Link>
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
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/preferences" element={
                <ProtectedRoute>
                  <PreferencesPage />
                </ProtectedRoute>
              } />
              <Route path="/edit-plan" element={<EditPlanPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
    </AuthProvider>
  );
}

export default App;