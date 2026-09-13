import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
  getAdminNotificationsRequest,
  createAdminNotificationRequest,
  deleteAdminNotificationRequest
} from '../../api/admin';
import {
  FiBell,
  FiPlus,
  FiTrash2,
  FiSend,
  FiRadio,
  FiX,
  FiInfo,
  FiExternalLink
} from 'react-icons/fi';

const typeBadgeMap = {
  general: 'badge-neutral',
  test: 'badge-warning',
  coding: 'badge-primary',
  company: 'badge-success',
  system: 'badge-danger'
};

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAdminNotificationsRequest();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      message: formData.get('message'),
      type: formData.get('type') || 'general',
      link: formData.get('link') || ''
    };

    setSubmitting(true);
    try {
      await createAdminNotificationRequest(payload);
      setModalOpen(false);
      await fetchNotifications();
    } catch (err) {
      console.error('Error sending notification:', err);
      const errMsg =
        err.response?.data?.message || err.message || 'Failed to send notification';
      alert(`Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;
    setDeleteLoading(true);
    try {
      await deleteAdminNotificationRequest(deleteModalId);
      setDeleteModalId(null);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Broadcast Notifications"
        subtitle="Dispatch announcements, scheduled mock test reminders, and recruitment drives to candidates."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Notifications' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary hidden sm:inline-flex">
              {notifications.length} Broadcasts
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              <FiSend className="w-4 h-4" />
              <span>Broadcast Alert</span>
            </button>
          </div>
        }
      />

      {/* Notifications Container */}
      {loading ? (
        <LoadingState variant="list" rows={5} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchNotifications} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiBell}
            title="No Active Broadcasts"
            description="No notifications have been sent yet. Click 'Broadcast Alert' to dispatch a new notice."
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary text-xs"
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>Broadcast First Alert</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900/40">
                  <FiBell className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {n.title}
                    </h3>
                    <span
                      className={`${
                        typeBadgeMap[n.type] || 'badge-neutral'
                      } text-[10px] uppercase font-semibold`}
                    >
                      {n.type || 'General'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                    <span>
                      Target:{' '}
                      {n.userId?.name
                        ? `${n.userId.name} (${n.userId.email})`
                        : 'All Students (Broadcast)'}
                    </span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                    {n.link && (
                      <>
                        <span>•</span>
                        <a
                          href={n.link}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-sans flex items-center gap-1"
                        >
                          <span>Link</span>
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalId(n._id)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
                title="Delete Notification"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal Dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Broadcast Alert to Students
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="input-label">Notification Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. National Placement Mock Test Live"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Category / Tag</label>
                <select name="type" className="input text-xs">
                  <option value="general">General Announcement</option>
                  <option value="test">Mock Test Assessment</option>
                  <option value="coding">Coding Practice</option>
                  <option value="company">Company Recruitment Drive</option>
                  <option value="system">System Notice</option>
                </select>
              </div>

              <div>
                <label className="input-label">Announcement Body *</label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Write clear instructions or alerts for students..."
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Action Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  placeholder="/mock-tests or https://..."
                  className="input"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  <FiSend className="w-4 h-4" />
                  <span>{submitting ? 'Broadcasting...' : 'Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Notification"
        message="Are you sure you want to remove this broadcast notification from the platform history?"
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default ManageNotifications;
