import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import { getCodingAnalyticsRequest } from '../../../api/coding';
import {
  FiArrowLeft,
  FiTrendingUp,
  FiTarget,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiAward,
  FiZap,
  FiClock,
  FiCode,
  FiChevronRight,
  FiEye,
  FiX
} from 'react-icons/fi';

const CodingResults = () => {
  const { topicId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const topicName = topicId
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'All Topics';

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCodingAnalyticsRequest();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Unable to load coding performance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [topicId]);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        to={topicId ? `/student/coding/${topicId}` : '/student/coding'}
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>{topicId ? `${topicName} Hub` : 'DSA Hub'}</span>
      </Link>
      <Link
        to="/student/coding/arrays/challenges"
        className="btn-primary text-xs py-2 px-3.5"
      >
        <FiCode className="w-4 h-4" />
        <span>Go to Problem Arena</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Coding Performance Analytics"
        subtitle="Real-time accuracy analysis, difficulty distribution, weak topic diagnostics, and submission inspection."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA', to: '/student/coding' },
          ...(topicId ? [{ label: topicName, to: `/student/coding/${topicId}` }] : []),
          { label: 'Analytics' }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchAnalytics} />
        </div>
      ) : !analytics ? (
        <div className="card p-6">
          <EmptyState
            icon={FiActivity}
            title="No performance analytics available"
            description="Complete some challenges in the arena to generate analytics."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Problems Solved"
              value={analytics.totalSolved}
              icon={FiCheckCircle}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />
            <StatCard
              label="Total Submissions"
              value={analytics.totalAttempts}
              icon={FiTarget}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />
            <StatCard
              label="Accuracy Rate"
              value={`${analytics.accuracy}%`}
              icon={FiAward}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/40"
            />
            <StatCard
              label="Coding Streak"
              value={`${analytics.streak} Days`}
              icon={FiZap}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-50 dark:bg-amber-950/40"
            />
          </div>

          {/* Section 2: Difficulty Breakdown & Weak / Strong Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Difficulty Breakdown (5 cols) */}
            <div className="lg:col-span-5 card p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <SectionHeader
                  title="Difficulty Distribution"
                  subtitle="Submissions and solve rate across levels"
                />

                <div className="space-y-4 mt-4">
                  {(analytics.difficultyDistribution || []).map(d => {
                    const barColor =
                      d.difficulty === 'Easy' ? 'bg-emerald-600' :
                      d.difficulty === 'Medium' ? 'bg-amber-600' : 'bg-rose-600';

                    return (
                      <div key={d.difficulty} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-900 dark:text-white">{d.difficulty}</span>
                          <span className="text-gray-500 dark:text-gray-400">{d.solved} / {d.total} ({d.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>Avg Exec: <strong className="text-gray-900 dark:text-white font-medium">{analytics.avgExecutionTime || 12} ms</strong></span>
                <span>Accepted: <strong className="text-emerald-600 dark:text-emerald-400 font-medium">{analytics.acceptedCount}</strong></span>
                <span>Rejected: <strong className="text-rose-600 dark:text-rose-400 font-medium">{analytics.rejectedCount}</strong></span>
              </div>
            </div>

            {/* Weak & Strong Topics Diagnosis (7 cols) */}
            <div className="lg:col-span-7 card p-5 sm:p-6">
              <SectionHeader
                title="Topic Diagnostics & Focus Areas"
                subtitle="Targeted performance insights to guide your next study session"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {/* Weak Topics */}
                <div className="surface-muted p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                  <h4 className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-2.5">
                    Needs Focus (Weak Areas)
                  </h4>
                  {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                    <ul className="space-y-2 text-xs text-rose-900 dark:text-rose-300">
                      {analytics.weakTopics.map((w, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="font-medium">{w.topic}</span>
                          <span className="font-mono font-semibold text-[11px]">{w.accuracy}% Acc</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      No weak topics identified yet. Keep practicing!
                    </p>
                  )}
                </div>

                {/* Strong Topics */}
                <div className="surface-muted p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2.5">
                    Mastered Topics (Strengths)
                  </h4>
                  {analytics.strongTopics && analytics.strongTopics.length > 0 ? (
                    <ul className="space-y-2 text-xs text-emerald-900 dark:text-emerald-300">
                      {analytics.strongTopics.map((s, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="font-medium">{s.topic}</span>
                          <span className="font-mono font-semibold text-[11px]">{s.accuracy}% Acc</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      Solve more challenges to establish topic mastery.
                    </p>
                  )}
                </div>
              </div>

              {/* Recommended Problems */}
              {analytics.recommendedProblems && analytics.recommendedProblems.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                    Recommended Next Challenges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.recommendedProblems.map((rp) => (
                      <Link
                        key={rp._id}
                        to={`/student/coding/${rp.slug || 'arrays'}/challenges`}
                        className="surface-muted hover:border-indigo-300 dark:hover:border-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{rp.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({rp.difficulty})</span>
                        <FiChevronRight className="w-3 h-3 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Topic-wise Performance Breakdown */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="11 Core Topics Performance Breakdown"
              subtitle="Detailed completion progress across all data structures and algorithm categories"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
              {(analytics.topicPerformance || []).map((tp) => (
                <div key={tp.topic} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tp.topic}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                      {tp.solved} / {tp.total} Solved ({tp.progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${tp.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Recent Submissions Table & Inspection */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Recent Code Submissions"
              subtitle="Review your historical submissions, execution results, and code artifacts"
            />

            {analytics.recentSubmissions && analytics.recentSubmissions.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {analytics.recentSubmissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {sub.problem?.title || 'Coding Problem'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{sub.topic}</td>
                        <td className="py-3 px-4 font-mono uppercase text-[11px] text-gray-600 dark:text-gray-400">{sub.language}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={sub.status === 'Accepted' ? 'success' : 'danger'}
                            size="sm"
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                          {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="btn-icon p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Inspect code"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
                No code submissions logged yet. Start solving problems in the arena!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Code Inspection Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 text-gray-100 w-full max-w-2xl rounded-xl border border-gray-800 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800">
              <div>
                <h4 className="font-semibold text-sm text-white">
                  {selectedSubmission.problem?.title || 'Submission Code Inspection'}
                </h4>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                  Language: {selectedSubmission.language?.toUpperCase()} | Status: {selectedSubmission.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="btn-icon text-gray-400 hover:text-white p-1"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-emerald-400 bg-gray-950">
              <pre className="leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            <div className="p-3 bg-gray-950 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="btn-secondary !bg-gray-800 !text-white hover:!bg-gray-700 !border-gray-700 text-xs py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingResults;
