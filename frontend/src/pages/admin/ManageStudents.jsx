import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
  getAdminStudentsRequest,
  toggleBlockStudentRequest,
  deleteStudentRequest
} from '../../api/admin';
import {
  FiUsers,
  FiEye,
  FiSlash,
  FiCheckCircle,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiFilter
} from 'react-icons/fi';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Block Modal State
  const [blockModalStudent, setBlockModalStudent] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Delete Confirm Modal State
  const [deleteModalStudent, setDeleteModalStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const { data } = await getAdminStudentsRequest(params);
      if (data.success) {
        setStudents(data.data || []);
        setTotalPages(data.pages || 1);
        setTotalStudents(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Unable to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, statusFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleBlock = async () => {
    if (!blockModalStudent) return;
    setActionLoading(true);
    try {
      await toggleBlockStudentRequest(blockModalStudent._id, { reason: blockReason });
      setBlockModalStudent(null);
      setBlockReason('');
      fetchStudents();
    } catch (err) {
      console.error('Error toggling block state:', err);
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalStudent) return;
    setDeleteLoading(true);
    try {
      await deleteStudentRequest(deleteModalStudent._id);
      setDeleteModalStudent(null);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Student Management"
        subtitle="Monitor registered candidate profiles, verify access status, and manage portal permissions."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Students' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary">
              {totalStudents} Candidates Registered
            </span>
          </div>
        }
      />

      {/* Filter and Search Ribbon */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="tab-list self-start sm:self-auto">
            {['all', 'active', 'blocked'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`tab-item capitalize text-xs ${
                  statusFilter === st ? 'tab-item-active font-semibold' : ''
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search name, email, college..."
            />
          </form>
        </div>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <LoadingState variant="table" rows={10} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchStudents} />
        </div>
      ) : students.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiUsers}
            title="No Candidates Found"
            description="No student accounts match your filter criteria or search query."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">College / Branch</th>
                  <th className="py-3 px-4 text-center">Readiness</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* College / Branch */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-800 dark:text-gray-200 block">
                        {student.college || 'Marwadi University'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-500">
                        {student.branch || 'MCA'}
                      </span>
                    </td>

                    {/* Readiness */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold font-mono text-indigo-600 dark:text-indigo-400 text-xs">
                        {student.readinessScore || 0}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={
                          student.isBlocked ? 'badge-danger' : 'badge-success'
                        }
                      >
                        {student.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/students/${student._id}`}
                          className="btn-ghost text-indigo-600 dark:text-indigo-400 p-1.5 text-xs font-semibold"
                          title="View Full Profile"
                        >
                          <FiEye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setBlockModalStudent(student)}
                          className={`btn-ghost p-1.5 text-xs ${
                            student.isBlocked
                              ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                          }`}
                          title={student.isBlocked ? 'Unblock Student' : 'Block Student'}
                        >
                          {student.isBlocked ? (
                            <FiCheckCircle className="w-4 h-4" />
                          ) : (
                            <FiSlash className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteModalStudent(student)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                          title="Deactivate Account"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {page} of {totalPages} ({totalStudents} total candidates)
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

      {/* Block / Unblock Modal Dialog */}
      {blockModalStudent && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md p-6 space-y-4 animate-scale-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {blockModalStudent.isBlocked
                  ? 'Unblock Student Access?'
                  : 'Block Student Access?'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {blockModalStudent.isBlocked
                  ? `Restore portal permissions and practice tests for ${blockModalStudent.name}.`
                  : `Restrict ${blockModalStudent.name} from taking tests and practicing on the platform.`}
              </p>
            </div>

            {!blockModalStudent.isBlocked && (
              <div>
                <label className="input-label text-xs">
                  Reason for Action (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Violation of assessment guidelines..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="input text-xs"
                />
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setBlockModalStudent(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBlock}
                disabled={actionLoading}
                className={`flex-1 ${
                  blockModalStudent.isBlocked ? 'btn-primary' : 'btn-danger'
                }`}
              >
                {actionLoading
                  ? 'Processing...'
                  : blockModalStudent.isBlocked
                  ? 'Confirm Unblock'
                  : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalStudent)}
        onClose={() => setDeleteModalStudent(null)}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Student Account"
        message={`Are you sure you want to deactivate candidate "${deleteModalStudent?.name}"? This action will remove portal access.`}
        confirmText="Deactivate"
        variant="danger"
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default ManageStudents;
