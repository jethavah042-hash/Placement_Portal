import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { ThemeContext } from '../../context/ThemeContext';
import AuthContext from '../../context/AuthContext';
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiShield,
  FiLogOut,
  FiBriefcase,
  FiBell,
  FiActivity,
  FiChevronDown,
  FiUser
} from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);

  const dropdownRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Admin Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Admin Top Bar */}
        <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
            
            {/* Left: Mobile Toggle & Admin Badge */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>

              {/* Administrator Role Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300">
                <FiShield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold tracking-wider uppercase">Administrator</span>
              </div>
            </div>

            {/* Right: Theme Toggle & Admin Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="btn-icon"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="w-4.5 h-4.5 text-amber-400" />
                ) : (
                  <FiMoon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
                )}
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Admin menu"
                >
                  <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:block max-w-[120px] truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="dropdown-menu right-0 w-56 shadow-xl animate-fade-in-up">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user?.name || 'Administrator'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user?.email || 'admin@portal.com'}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/admin/companies"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="dropdown-item rounded-md"
                      >
                        <FiBriefcase className="w-4 h-4 text-slate-400" />
                        <span>Company Drives</span>
                      </Link>

                      <Link
                        to="/admin/announcements"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="dropdown-item rounded-md"
                      >
                        <FiBell className="w-4 h-4 text-slate-400" />
                        <span>Broadcast Alerts</span>
                      </Link>

                      <Link
                        to="/admin/activity-logs"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="dropdown-item rounded-md"
                      >
                        <FiActivity className="w-4 h-4 text-slate-400" />
                        <span>Audit Activity Logs</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="dropdown-item rounded-md w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
