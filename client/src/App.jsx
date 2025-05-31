import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Dashboard from './pages/Dashboard';
import PreferencesPage from './pages/PreferencesPage';
import MyPlansPage from './pages/MyPlansPage';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import './App.css';
import Navbar from './components/Navbar';

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
          <Navbar />
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
              <Route path="/my-plans" element={
                <ProtectedRoute>
                  <MyPlansPage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Routes>
          </div>
        </main>
        
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <p>&copy; {new Date().getFullYear()} UCLA Dining Meal Planner</p>
            </div>
          </div>
        </footer>
    </div>
    </AuthProvider>
  );
}

export default App;