import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getAdminDashboardStatsRequest } from '../../api/admin';
import {
  FiUsers,
  FiCode,
  FiBookOpen,
  FiBriefcase,
  FiCheckSquare,
  FiFileText,
  FiAward,
  FiPlus,
  FiRefreshCw,
  FiActivity,
  FiShield,
  FiLayers,
  FiArrowRight,
  FiExternalLink
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAdminDashboardStatsRequest();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.response?.data?.message || 'Unable to load dynamic dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = stats?.metrics || {
    totalStudents: 0,
    activeStudents: 0,
    blockedStudents: 0,
    totalCodingProblems: 0,
    totalAptitudeQuestions: 0,
    totalReasoningQuestions: 0,
    totalEnglishQuestions: 0,
    totalCompanies: 0,
    totalMockTests: 0,
    totalResumesScanned: 0,
    totalTestAttempts: 0,
    totalCodingSubmissions: 0,
    totalNotes: 0
  };

  const totalQuestionsSum =
    (metrics.totalAptitudeQuestions || 0) +
    (metrics.totalReasoningQuestions || 0) +
    (metrics.totalEnglishQuestions || 0);

  const activeRatio =
    metrics.totalStudents > 0
      ? Math.round(((metrics.activeStudents || 0) / metrics.totalStudents) * 100)
      : 100;

  return (
    <AdminLayout>
      <PageHeader
        title="Control Center & Analytics"
        subtitle="Real-time platform metrics, student activity monitoring, and content governance."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Overview' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-success hidden sm:inline-flex">
              Live Database
            </span>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="btn-secondary"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState variant="page" rows={4} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchStats} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Management Shortcuts Ribbon */}
          <div className="card p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quick Shortcuts
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/admin/coding"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <FiPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Add Problem</span>
                </Link>
                <Link
                  to="/admin/aptitude"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <FiPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Add Question</span>
                </Link>
                <Link
                  to="/admin/companies"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <FiPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Add Company</span>
                </Link>
                <Link
                  to="/admin/mock-tests"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <FiPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>New Mock Test</span>
                </Link>
                <Link
                  to="/admin/notifications"
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <FiPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Broadcast Alert</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Primary Key Stats Grid */}
          <div>
            <SectionHeader
              title="Platform Metrics"
              subtitle="Core student accounts, question banks, and assessment aggregates"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Registered Students"
                value={metrics.totalStudents}
                icon={FiUsers}
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/50"
                trend={`${metrics.activeStudents} Active`}
                trendUp={true}
                to="/admin/students"
              />

              <StatCard
                label="Coding Challenges"
                value={metrics.totalCodingProblems}
                icon={FiCode}
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/50"
                trend={`${metrics.totalCodingSubmissions} Submissions`}
                trendUp={true}
                to="/admin/coding"
              />

              <StatCard
                label="MCQ Question Bank"
                value={totalQuestionsSum}
                icon={FiBookOpen}
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/50"
                trend={`${metrics.totalAptitudeQuestions} Apt • ${metrics.totalReasoningQuestions} Reas • ${metrics.totalEnglishQuestions} Eng`}
                trendUp={true}
                to="/admin/aptitude"
              />

              <StatCard
                label="Mock Test Assessments"
                value={metrics.totalMockTests}
                icon={FiCheckSquare}
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/50"
                trend={`${metrics.totalTestAttempts} Attempts`}
                trendUp={true}
                to="/admin/mock-tests"
              />
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Hiring Partners"
              value={`${metrics.totalCompanies} Companies`}
              icon={FiBriefcase}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/50"
              trend="TCS, Infosys, Cognizant..."
              trendUp={true}
              to="/admin/companies"
            />

            <StatCard
              label="Resumes Analyzed"
              value={`${metrics.totalResumesScanned} Scans`}
              icon={FiFileText}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/50"
              trend="AI ATS Evaluated"
              trendUp={true}
              to="/admin/resume-scanner"
            />

            <StatCard
              label="Preparation Guides"
              value={`${metrics.totalNotes} Topic Notes`}
              icon={FiLayers}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/50"
              trend="DSA & Concepts"
              trendUp={true}
              to="/admin/coding"
            />

            <StatCard
              label="Candidate Active Rate"
              value={`${activeRatio}%`}
              icon={FiAward}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/50"
              trend={`${metrics.blockedStudents} Blocked`}
              trendUp={metrics.blockedStudents === 0}
              to="/admin/reports"
            />
          </div>

          {/* Activity Feeds & Audit Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Live Activity Feed */}
            <div className="card p-5 space-y-4">
              <SectionHeader
                title="Recent Student Activities"
                subtitle="Live candidate progress stream across portal modules"
                badge="Live"
              />

              {(!stats?.recentActivities || stats.recentActivities.length === 0) ? (
                <EmptyState
                  icon={FiActivity}
                  title="No Recent Activity"
                  description="No student actions have been recorded yet."
                />
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentActivities.map((act) => (
                    <div
                      key={act._id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {act.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-[11px] truncate mt-0.5">
                          {act.userId?.name || 'Student'} ({act.userId?.email || 'user'}) •{' '}
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {act.module || 'Portal'}
                          </span>
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Audit Logs */}
            <div className="card p-5 space-y-4">
              <SectionHeader
                title="Admin Audit Trail"
                subtitle="Recent administrative operations and revisions"
                action={
                  <Link
                    to="/admin/activity-logs"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />

              {(!stats?.recentAdminActions || stats.recentAdminActions.length === 0) ? (
                <EmptyState
                  icon={FiShield}
                  title="No Audit Actions"
                  description="No administrative actions recorded yet."
                />
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentAdminActions.map((log) => (
                    <div
                      key={log._id}
                      className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="badge-primary text-[10px] uppercase font-bold">
                            {log.action}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {log.details || log.entity}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          By <span className="font-medium">{log.adminName || 'Admin'}</span>
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono shrink-0">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
