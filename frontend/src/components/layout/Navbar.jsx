import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../context/ThemeContext';
import AuthContext from '../../context/AuthContext';
import { getMyNotificationsRequest, markNotificationReadRequest } from '../../api/notifications';
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiBell,
  FiUser,
  FiBriefcase,
  FiCode,
  FiCheckSquare,
  FiInfo,
  FiExternalLink,
  FiLogOut,
  FiCheck,
  FiClock
} from 'react-icons/fi';

const typeIcons = {
  company: { icon: FiBriefcase, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' },
  test: { icon: FiCheckSquare, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
  coding: { icon: FiCode, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' },
  general: { icon: FiBell, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
  system: { icon: FiInfo, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await getMyNotificationsRequest();
      if (res?.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationReadRequest(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await handleMarkAsRead(n._id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        
        {/* Left Side: Hamburger & Branding for Mobile */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          <Link to="/student/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">
              Placement<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Tools & Account */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
          
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FiSun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <FiMoon className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setDropdownOpen(false);
              }}
              className="btn-icon relative"
              title="Notifications & Placement Alerts"
              aria-label="View notifications"
            >
              <FiBell className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="dropdown-menu right-0 w-80 sm:w-96 shadow-xl animate-fade-in-up">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/60 dark:bg-gray-800/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                    {unreadCount > 0 && (
                      <span className="badge-danger text-[10px] py-0 px-1.5">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {loadingNotifs && notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 animate-pulse">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                      <FiBell className="w-6 h-6 mx-auto text-gray-300 dark:text-gray-600 mb-1" />
                      <p className="font-semibold text-gray-700 dark:text-gray-300">All caught up</p>
                      <p>Company drives and mock test alerts will appear here.</p>
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const styling = typeIcons[n.type] || typeIcons.general;
                      const IconComponent = styling.icon;

                      return (
                        <div
                          key={n._id}
                          onClick={() => !n.read && handleMarkAsRead(n._id)}
                          className={`p-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer flex items-start gap-3 ${
                            !n.read ? 'bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styling.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>

                            {n.link && (
                              <div className="mt-1.5">
                                {n.link.startsWith('http') ? (
                                  <a
                                    href={n.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    <span>Details</span>
                                    <FiExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <Link
                                    to={n.link}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifOpen(false);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    <span>View</span>
                                    <FiExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>

                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-center">
                  <Link
                    to="/student/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 hidden md:block max-w-[120px] truncate">
                {user?.name || 'Student'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu right-0 w-52 shadow-xl animate-fade-in-up">
                <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || 'Student Account'}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user?.email || 'No email registered'}
                  </p>
                </div>
                <div className="p-1 space-y-0.5">
                  <Link
                    to="/student/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="dropdown-item rounded-md"
                  >
                    <FiUser className="w-4 h-4 text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="dropdown-item rounded-md w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
  );
};

export default Navbar;
