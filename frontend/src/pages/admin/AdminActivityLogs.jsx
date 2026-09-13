import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getAdminActivityLogsRequest } from '../../api/admin';
import {
  FiActivity,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';

const actionBadgeStyle = (action = '') => {
  const act = action.toUpperCase();
  if (act.includes('DELETE') || act.includes('BLOCK') || act.includes('REMOVE')) {
    return 'badge-danger';
  }
  if (act.includes('CREATE') || act.includes('ADD') || act.includes('UNBLOCK')) {
    return 'badge-success';
  }
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
    return 'badge-warning';
  }
  return 'badge-primary';
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAdminActivityLogsRequest({ page, limit: 20 });
      if (data.success) {
        setLogs(data.data || []);
        setTotalPages(data.pages || 1);
        setTotalLogs(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.response?.data?.message || 'Unable to retrieve audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <AdminLayout>
      <PageHeader
        title="Administrator Audit Logs"
        subtitle="Complete chronological record of all administrative operations, governance interventions, and content revisions."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Audit Logs' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary hidden sm:inline-flex">
              {totalLogs} Recorded Actions
            </span>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="btn-secondary"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* Logs Table */}
      {loading ? (
        <LoadingState variant="table" rows={12} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchLogs} />
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiShield}
            title="No Activity Logs"
            description="No administrative actions or modifications have been logged yet."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin User</th>
                  <th className="py-3 px-4 text-center">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      {log.adminName || 'Admin'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`${actionBadgeStyle(
                          log.action
                        )} text-[10px] uppercase font-bold`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600 dark:text-gray-300">
                      {log.entity}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 max-w-md truncate">
                      {log.details || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {page} of {totalPages} ({totalLogs} audit actions)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminActivityLogs;
