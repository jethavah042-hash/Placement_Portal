import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { getAdminResultsRequest, getAdminCodingSubmissionsRequest } from '../../api/admin';
import {
  FiAward,
  FiCode,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser
} from 'react-icons/fi';

const ManageResults = () => {
  const [activeTab, setActiveTab] = useState('tests');

  // Test Results State
  const [testResults, setTestResults] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testError, setTestError] = useState(null);
  const [testPage, setTestPage] = useState(1);
  const [testTotalPages, setTestTotalPages] = useState(1);
  const [testTotal, setTestTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Coding Submissions State
  const [codingSubmissions, setCodingSubmissions] = useState([]);
  const [loadingCoding, setLoadingCoding] = useState(false);
  const [codingError, setCodingError] = useState(null);
  const [codingPage, setCodingPage] = useState(1);
  const [codingTotalPages, setCodingTotalPages] = useState(1);
  const [codingTotal, setCodingTotal] = useState(0);

  const fetchTestResults = async () => {
    setLoadingTests(true);
    setTestError(null);
    try {
      const params = { page: testPage, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const { data } = await getAdminResultsRequest(params);
      if (data.success) {
        setTestResults(data.data || []);
        setTestTotalPages(data.pages || 1);
        setTestTotal(data.total || 0);
      } else {
        setTestError(data.message || 'Failed to fetch test results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setTestError(err.response?.data?.message || 'Error communicating with results server');
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchCodingSubmissions = async () => {
    setLoadingCoding(true);
    setCodingError(null);
    try {
      const params = { page: codingPage, limit: 15 };
      const { data } = await getAdminCodingSubmissionsRequest(params);
      if (data.success) {
        setCodingSubmissions(data.data || []);
        setCodingTotalPages(data.pages || 1);
        setCodingTotal(data.total || 0);
      } else {
        setCodingError(data.message || 'Failed to fetch coding submissions');
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setCodingError(err.response?.data?.message || 'Error communicating with submission server');
    } finally {
      setLoadingCoding(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tests') {
      fetchTestResults();
    }
  }, [activeTab, testPage, statusFilter]);

  useEffect(() => {
    if (activeTab === 'coding') {
      fetchCodingSubmissions();
    }
  }, [activeTab, codingPage]);

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title="Results & Submissions Log"
        subtitle="Review student exam attempts, scoring diagnostics, and code execution telemetry across the platform."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Results & Audit' }
        ]}
      />

      {/* Tabs Switcher */}
      <div className="card p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="tab-list">
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={activeTab === 'tests' ? 'tab-item-active' : 'tab-item'}
          >
            Mock Test Results ({testTotal})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coding')}
            className={activeTab === 'coding' ? 'tab-item-active' : 'tab-item'}
          >
            Coding Submissions ({codingTotal})
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="badge-primary">Live Audit Stream</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MOCK TEST RESULTS */}
      {/* ===================================================================== */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {/* Status Filter Toolbar */}
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1.5">Outcome:</span>
              {['all', 'Passed', 'Failed'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setStatusFilter(st); setTestPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {st === 'all' ? 'All Outcomes' : st}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Attempts: <span className="font-semibold text-gray-900 dark:text-white">{testTotal}</span>
            </div>
          </div>

          {/* Table / Content */}
          {loadingTests ? (
            <LoadingState variant="table" rows={6} />
          ) : testError ? (
            <div className="card p-6">
              <ErrorState message={testError} onRetry={fetchTestResults} />
            </div>
          ) : testResults.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiAward}
                title="No Test Results Logged"
                description="Student test attempts and scores will automatically stream into this audit log."
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student Candidate
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assessment Title
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score / %
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time Taken
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Attempted Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {testResults.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {r.userId?.name ? r.userId.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {r.userId?.name || 'Candidate Student'}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {r.userId?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs font-medium text-gray-900 dark:text-white truncate">
                          {r.title || 'Placement Assessment'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {r.obtainedMarks} / {r.totalMarks} ({r.percentage}%)
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                          {r.accuracy !== undefined ? `${r.accuracy}%` : '-'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                          {r.timeTaken ? `${Math.round(r.timeTaken / 60)} mins` : '-'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={r.status === 'Passed' ? 'badge-success' : 'badge-danger'}>
                            {r.status || 'Completed'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {testTotalPages > 1 && (
                <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{testPage}</span> of{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{testTotalPages}</span> ({testTotal} attempts)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTestPage(prev => Math.max(1, prev - 1))}
                      disabled={testPage === 1}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestPage(prev => Math.min(testTotalPages, prev + 1))}
                      disabled={testPage === testTotalPages}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CODING SUBMISSIONS */}
      {/* ===================================================================== */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          {loadingCoding ? (
            <LoadingState variant="table" rows={6} />
          ) : codingError ? (
            <div className="card p-6">
              <ErrorState message={codingError} onRetry={fetchCodingSubmissions} />
            </div>
          ) : codingSubmissions.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiCode}
                title="No Coding Submissions Logged"
                description="Student DSA compiler executions and submissions will show up here."
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Challenge Title
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Language
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Verdict Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Passed Tests
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Execution Time
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {codingSubmissions.map((s) => (
                      <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                              {s.userId?.name ? s.userId.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {s.userId?.name || 'Student Candidate'}
                              </p>
                              <p className="text-xs text-gray-400 font-mono">
                                {s.userId?.email || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {s.problemId?.title || 'Coding Challenge'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="badge-neutral uppercase font-mono text-[11px] font-bold">
                            {s.language || 'javascript'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={s.status === 'Accepted' ? 'badge-success' : 'badge-danger'}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                          {s.passedTestCases} / {s.totalTestCases}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                          {s.executionTime || '12'} ms
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {codingTotalPages > 1 && (
                <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{codingPage}</span> of{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{codingTotalPages}</span> ({codingTotal} submissions)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCodingPage(prev => Math.max(1, prev - 1))}
                      disabled={codingPage === 1}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodingPage(prev => Math.min(codingTotalPages, prev + 1))}
                      disabled={codingPage === codingTotalPages}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageResults;
