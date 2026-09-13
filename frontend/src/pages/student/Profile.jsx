import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import LoadingState from '../../components/ui/LoadingState';
import AuthContext from '../../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiBook,
  FiCalendar,
  FiPhone,
  FiAward,
  FiFileText,
  FiBookmark,
  FiBell,
  FiCheckCircle
} from 'react-icons/fi';

const Profile = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState variant="page" />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="card p-8 text-center max-w-md mx-auto">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Profile Unavailable</h1>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Please sign in to view your candidate profile.</p>
          <Link to="/login" className="btn-primary mt-4 text-xs inline-flex">
            Go to Login
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Candidate Profile"
        subtitle="Manage your student account information and recruitment credentials."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Profile Card */}
          <div className="card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
                {user.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {user.name || 'Student Name'}
                  </h2>
                  <span className="badge-primary text-[10px] uppercase">
                    {user.role || 'Student'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {user.college || 'Marwadi University'} • Class of {user.graduationYear || '2026'}
                </p>
              </div>
            </div>

            {/* Academic Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 font-medium block">Email Address</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                  {user.email || 'Not provided'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 font-medium block">Academic Department</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                  {user.branch || 'MCA / Computer Science'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 font-medium block">Contact Number</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                  {user.phone || '+91 ••••• •••••'}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 font-medium block">Registration / Enrollment ID</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">
                  {user.registrationNumber || '23010401000'}
                </p>
              </div>
            </div>
          </div>

          {/* Target Placement Preparation Info */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Target Placement Focus"
              subtitle="Target companies and interview preferences"
            />

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Target Recruiters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(user.targetCompanies && user.targetCompanies.length > 0
                    ? user.targetCompanies
                    : ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Accenture']
                  ).map((comp, idx) => (
                    <span key={idx} className="badge-neutral text-xs py-1 px-2.5">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <Link
                to="/student/resume-scanner"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiFileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">ATS Resume Scanner</span>
              </Link>

              <Link
                to="/student/bookmarks"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiBookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Saved Bookmarks</span>
              </Link>

              <Link
                to="/student/notifications"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiBell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Placement Notifications</span>
              </Link>

              <Link
                to="/student/mock-tests"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiAward className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Mock Assessments</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
