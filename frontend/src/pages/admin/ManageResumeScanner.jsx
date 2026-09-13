import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { getAdminResumeStatsRequest } from '../../api/admin';
import {
  FiFileText,
  FiAward,
  FiTrendingUp,
  FiRefreshCw,
  FiCheckCircle,
  FiUser
} from 'react-icons/fi';

const ManageResumeScanner = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminResumeStatsRequest();
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.message || 'Failed to fetch resume stats');
      }
    } catch (err) {
      console.error('Error fetching resume stats:', err);
      setError(err.response?.data?.message || 'Error communicating with ATS analytics server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGradeBadgeClass = (grade) => {
    const g = grade?.toUpperCase();
    if (g === 'A' || g === 'A+') return 'badge-success';
    if (g === 'B' || g === 'B+') return 'badge-primary';
    if (g === 'C') return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title="Resume Scanner Analytics"
        subtitle="Aggregate student resume quality metrics, ATS scoring distribution, and candidate diagnostic logs."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Resume Scanner Analytics' }
        ]}
        actions={
          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            className="btn-secondary"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchStats} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Aggregate Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-6 flex items-center justify-between card-hover">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Total Scans Analyzed
                </span>
                <strong className="text-3xl font-bold text-gray-900 dark:text-white mt-1.5 block">
                  {data?.totalScans || 0}
                </strong>
                <span className="text-xs text-gray-400 mt-1 block">
                  PDF & DOCX Submissions
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                <FiFileText className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-6 flex items-center justify-between card-hover">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Average ATS Score
                </span>
                <strong className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 block">
                  {data?.avgAtsScore || 0} <span className="text-base font-normal text-gray-400">/ 100</span>
                </strong>
                <span className="text-xs text-gray-400 mt-1 block">
                  10-Category Rule Evaluation
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
                <FiAward className="w-6 h-6" />
              </div>
            </div>

            <div className="card p-6 flex items-center justify-between card-hover">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Placement Readiness
                </span>
                <strong className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
                  {data?.avgReadiness || 0}%
                </strong>
                <span className="text-xs text-gray-400 mt-1 block">
                  Interview Ready Benchmark
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                <FiTrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Candidate Scans Table */}
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Candidate Scans
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Latest resume evaluation runs and candidate readiness scores.
                </p>
              </div>
              <span className="badge-primary">
                {data?.recentScans?.length || 0} Recent Logs
              </span>
            </div>

            {!data?.recentScans || data.recentScans.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={FiFileText}
                  title="No Resume Scans Logged"
                  description="When students upload and scan their resumes against ATS filters, evaluation reports will appear here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ATS Score
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Grade
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Placement Readiness
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Scanned Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {data.recentScans.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {s.userId?.name ? s.userId.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {s.userId?.name || 'Candidate'}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {s.userId?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {s.fileName || 'Resume.pdf'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {s.atsScore} / 100
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={getGradeBadgeClass(s.atsGrade)}>
                            Grade {s.atsGrade || 'B'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.placementReadiness}%
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageResumeScanner;
