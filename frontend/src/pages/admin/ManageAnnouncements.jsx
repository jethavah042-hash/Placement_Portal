import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import AnnouncementFormModal from '../../components/announcements/AnnouncementFormModal';
import AnnouncementModal from '../../components/announcements/AnnouncementModal';
import {
  getAllAnnouncementsRequest,
  createAnnouncementRequest,
  updateAnnouncementRequest,
  deleteAnnouncementRequest,
  updateAnnouncementStatusRequest
} from '../../api/announcement';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi';

const priorityBadgeClasses = {
  Urgent: 'badge-danger',
  High: 'badge-warning',
  Medium: 'badge-primary',
  Low: 'badge-neutral'
};

const statusBadgeClasses = {
  Published: 'badge-success',
  Draft: 'badge-neutral',
  Expired: 'badge-warning'
};

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form and Preview Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState(null);

  // Delete Confirm Modal
  const [deleteModalAnn, setDeleteModalAnn] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAnnouncements = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        priority: priorityFilter,
        search
      };
      const res = await getAllAnnouncementsRequest(params);
      if (res.data.success) {
        setAnnouncements(res.data.data || []);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || currentPage);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(page);
  }, [page, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnnouncements(1);
  };

  const handleCreateNew = () => {
    setSelectedForEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ann) => {
    setSelectedForEdit(ann);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (formData, id) => {
    if (id) {
      await updateAnnouncementRequest(id, formData);
    } else {
      await createAnnouncementRequest(formData);
    }
    await fetchAnnouncements(page);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalAnn) return;
    setDeleteLoading(true);
    try {
      await deleteAnnouncementRequest(deleteModalAnn._id);
      setDeleteModalAnn(null);
      await fetchAnnouncements(page);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    try {
      await updateAnnouncementStatusRequest(id, nextStatus);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update announcement status');
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Drive Announcements"
        subtitle="Broadcast upcoming recruitment drives, eligibility rules, and CTC packages to candidate dashboards."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Announcements' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary hidden sm:inline-flex">
              {totalCount} Total Alerts
            </span>
            <button
              onClick={handleCreateNew}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Announcement</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Ribbon */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input w-auto text-xs py-2"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published Only</option>
              <option value="Draft">Drafts Only</option>
              <option value="Expired">Expired</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="input w-auto text-xs py-2"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="w-full sm:w-64">
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, role..."
              />
            </form>
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {announcements.length} of {totalCount} records
          </span>
        </div>
      </div>

      {/* Announcements Table */}
      {loading ? (
        <LoadingState variant="table" rows={8} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={() => fetchAnnouncements(page)} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiBriefcase}
            title="No Announcements Found"
            description="Create your first company requirement or drive notice to notify students."
            action={
              <button
                onClick={handleCreateNew}
                className="btn-primary text-xs"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Create Announcement</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Drive / Due</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {announcements.map((ann) => (
                  <tr
                    key={ann._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* Company & Role */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">
                        {ann.companyName}
                      </div>
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-xs">
                        {ann.jobRole}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-[11px] truncate max-w-xs mt-0.5">
                        {ann.title}
                      </div>
                    </td>

                    {/* Package */}
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 text-xs font-mono">
                      {ann.package || 'Competitive'}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-xs text-gray-600 dark:text-gray-400">
                      {ann.location || 'Pan India'}
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-4 font-mono text-xs space-y-0.5">
                      {ann.driveDate && (
                        <div className="text-gray-800 dark:text-gray-200">
                          Drive: {new Date(ann.driveDate).toLocaleDateString()}
                        </div>
                      )}
                      {ann.applicationDeadline && (
                        <div className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">
                          Due: {new Date(ann.applicationDeadline).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={
                          priorityBadgeClasses[ann.priority] || 'badge-neutral'
                        }
                      >
                        {ann.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Status & Quick Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(ann._id, ann.status)}
                        className={`cursor-pointer transition-opacity hover:opacity-80 ${
                          statusBadgeClasses[ann.status] || 'badge-neutral'
                        }`}
                        title="Click to toggle status (Published / Draft)"
                      >
                        {ann.status === 'Published'
                          ? '✓ Published'
                          : ann.status === 'Draft'
                          ? '📝 Draft'
                          : '⌛ Expired'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewAnnouncement(ann)}
                          className="btn-ghost p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                          title="Preview Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(ann)}
                          className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          title="Edit Announcement"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalAnn(ann)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                          title="Delete Announcement"
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
                Page {page} of {totalPages} ({totalCount} total announcements)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Form Modal */}
      <AnnouncementFormModal
        announcement={selectedForEdit}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedForEdit(null);
        }}
        onSave={handleSaveForm}
      />

      {/* Preview Modal */}
      <AnnouncementModal
        announcement={previewAnnouncement}
        isOpen={Boolean(previewAnnouncement)}
        onClose={() => setPreviewAnnouncement(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalAnn)}
        onClose={() => setDeleteModalAnn(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        message={`Are you sure you want to delete drive notice "${deleteModalAnn?.title}"?`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default ManageAnnouncements;
