import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiAlertTriangle, FiArrowRight, FiLogOut, FiUser, FiInfo } from 'react-icons/fi';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchToAdmin = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/admin/login');
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 text-center animate-fade-in">
        
        {/* Icon & Error Header */}
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <FiShield className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="badge-danger">
            <FiAlertTriangle className="w-3 h-3 mr-1" /> Access Restricted
          </span>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Permission Required
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            You do not have administrative privileges to access this area.
          </p>
        </div>

        {/* Current Active Account Box */}
        {user && (
          <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 text-left flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 font-mono truncate">{user.email}</p>
              </div>
            </div>
            <span className="badge-neutral text-[10px]">
              Role: {user.role}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2 pt-1">
          {user?.role === 'student' && (
            <button
              onClick={handleSwitchToAdmin}
              className="btn-primary w-full py-2.5 text-xs font-semibold"
            >
              <span>Sign In with Admin Account</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/student/dashboard"
              className="btn-secondary text-xs py-2 justify-center"
            >
              <FiUser className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-secondary text-xs py-2 justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Dual Tab Tip */}
        <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-left flex items-start gap-2 text-[11px] text-indigo-950 dark:text-indigo-300">
          <FiInfo className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Tip:</strong> To test both Student and Admin views simultaneously, open the Admin Console in an Incognito window.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
