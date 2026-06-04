import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { FiSun, FiMoon } from 'react-icons/fi';
import ToggleSwitch from '../ui/ToggleSwitch/ToggleSwitch';
import Dropdown from '../ui/Dropdown/Dropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileDropdownItems = [
    {
      label: 'Profile',
      icon: '👤',
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: '⚙️',
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Logout',
      icon: '🚪',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            DevConnect
          </Link>

          <div className="nav-menu">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/projects" 
                  className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
                >
                  Projects
                </Link>
                <Link 
                  to="/projects/new" 
                  className={`nav-link ${isActive('/projects/new') ? 'active' : ''}`}
                >
                  New Project
                </Link>
                
                <div className="theme-toggle-wrapper">
                  <ToggleSwitch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    label=""
                  />
                  <span className="theme-icon">
                    {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                  </span>
                </div>

                <Dropdown
                  trigger={
                    <div className="profile-avatar" aria-label="User profile menu">
                      {getUserInitials()}
                    </div>
                  }
                  items={profileDropdownItems}
                  align="right"
                />
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                >
                  Register
                </Link>
                
                <div className="theme-toggle-wrapper">
                  <ToggleSwitch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                    label=""
                  />
                  <span className="theme-icon">
                    {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                  </span>
                </div>
              </>
            )}
          </div>

          <button 
            className="hamburger" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="nav-logo">DevConnect</span>
          <button 
            className="mobile-menu-close" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu-links">
          {isAuthenticated ? (
            <>
              <Link 
                to="/projects" 
                className={`nav-link ${isActive('/projects') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </Link>
              <Link 
                to="/projects/new" 
                className={`nav-link ${isActive('/projects/new') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                New Project
              </Link>
              
              <div style={{ marginTop: 'var(--space-2)' }}>
                <ToggleSwitch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  label={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
                />
              </div>

              <div className="nav-user">
                <span className="user-name">{user?.name || 'User'}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
              
              <div style={{ marginTop: 'var(--space-2)' }}>
                <ToggleSwitch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  label={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;