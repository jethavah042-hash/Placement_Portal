import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCode,
  FiBookOpen,
  FiLayers,
  FiMessageSquare,
  FiBriefcase,
  FiCheckSquare,
  FiFileText,
  FiAward,
  FiBell,
  FiBarChart2,
  FiActivity,
  FiSettings,
  FiLogOut,
  FiX,
  FiShield
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const adminNavGroups = [
  {
    title: 'Operations',
    items: [
      { path: '/admin/dashboard', name: 'Overview Dashboard', icon: FiHome },
      { path: '/admin/students', name: 'Student Directory', icon: FiUsers },
    ]
  },
  {
    title: 'Academic Question Banks',
    items: [
      { path: '/admin/aptitude', name: 'Aptitude Questions', icon: FiBookOpen },
      { path: '/admin/reasoning', name: 'Reasoning Bank', icon: FiLayers },
      { path: '/admin/english', name: 'English Verbal Bank', icon: FiMessageSquare },
      { path: '/admin/coding', name: 'Coding DSA Challenges', icon: FiCode },
    ]
  },
  {
    title: 'Assessments & Recruitment',
    items: [
      { path: '/admin/mock-tests', name: 'Mock Tests Arena', icon: FiCheckSquare },
      { path: '/admin/results', name: 'Results & Attempts', icon: FiAward },
      { path: '/admin/companies', name: 'Company Profiles', icon: FiBriefcase },
      { path: '/admin/announcements', name: 'Placement Drives & Alerts', icon: FiBell },
    ]
  },
  {
    title: 'Governance & Analytics',
    items: [
      { path: '/admin/resume-scanner', name: 'Resume ATS Logs', icon: FiFileText },
      { path: '/admin/notifications', name: 'Broadcast Messages', icon: FiBell },
      { path: '/admin/reports', name: 'Reports & Export', icon: FiBarChart2 },
      { path: '/admin/activity-logs', name: 'Audit Activity Trail', icon: FiActivity },
      { path: '/admin/settings', name: 'Platform Settings', icon: FiSettings }
    ]
  }
];

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
          {/* Admin Header & Logo */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-500 transition-colors">
                <FiShield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white block leading-none">
                  Admin Console
                </span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block mt-1">
                  Placement Governance
                </span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-white lg:hidden rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close admin menu"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Admin Nav Items */}
          <div className="space-y-5 flex-1">
            {adminNavGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {group.title}
                </h3>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && isOpen) toggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-indigo-400" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          {/* Admin User Footer & Logout */}
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@portal.com'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-900/50 text-slate-300 hover:text-rose-400 text-xs font-semibold transition-colors"
            >
              <FiLogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
