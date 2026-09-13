import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiLayers,
  FiCode,
  FiCheckSquare,
  FiFileText,
  FiTrendingUp,
  FiX,
  FiBriefcase,
  FiCpu,
  FiFeather,
  FiBookmark,
  FiAward
} from 'react-icons/fi';

const navGroups = [
  {
    title: 'Core Preparation',
    items: [
      { path: '/student/dashboard', name: 'Dashboard', icon: FiHome },
      { path: '/student/aptitude', name: 'Aptitude Prep', icon: FiBook },
      { path: '/student/reasoning', name: 'Reasoning Prep', icon: FiLayers },
      { path: '/student/english', name: 'English Prep', icon: FiFeather },
      { path: '/student/coding', name: 'Coding Practice', icon: FiCode },
    ]
  },
  {
    title: 'Assessments',
    items: [
      { path: '/student/mock-tests', name: 'Mock Tests', icon: FiCheckSquare },
      { path: '/student/analytics', name: 'Performance Analytics', icon: FiTrendingUp },
    ]
  },
  {
    title: 'Career & Drives',
    items: [
      { path: '/student/company-prep', name: 'Company Preparation', icon: FiBriefcase },
      { path: '/student/resume-scanner', name: 'Resume ATS Scanner', icon: FiFileText },
      { path: '/student/bookmarks', name: 'Saved Bookmarks', icon: FiBookmark },
    ]
  }
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <Link to="/student/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
                P
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white block leading-none">
                  Placement<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-1">
                  Student Portal
                </span>
              </div>
            </Link>

            <button
              onClick={toggleSidebar}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Navigation */}
          <div className="space-y-6 flex-1">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  {group.title}
                </h3>
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && isOpen) toggleSidebar();
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border-l-3 border-indigo-600 pl-[9px]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-4.5 h-4.5 shrink-0 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          {/* Practice Test Booster Widget */}
          <div className="mt-6 p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <FiAward className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Campus Mock Assessment</h4>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-2.5">
              Benchmark your readiness against current hiring standards.
            </p>
            <Link
              to="/student/mock-tests"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Take Mock Test
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
