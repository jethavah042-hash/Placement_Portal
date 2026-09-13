import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import {
  getAdminProfileRequest,
  updateAdminProfileRequest,
  changeAdminPasswordRequest
} from '../../api/admin';
import {
  FiSettings,
  FiUser,
  FiLock,
  FiCheckCircle,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';

const AdminSettings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    getAdminProfileRequest().then((res) => {
      if (res.data.success && res.data.data) {
        setProfile({
          name: res.data.data.name || '',
          email: res.data.data.email || ''
        });
      }
    });
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: '', isError: false });
    try {
      await updateAdminProfileRequest(profile);
      setProfileMsg({ text: 'Profile updated successfully!', isError: false });
    } catch (err) {
      console.error(err);
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile',
        isError: true
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg({ text: '', isError: false });
    try {
      await changeAdminPasswordRequest(passwordData);
      setPwdMsg({ text: 'Password changed successfully!', isError: false });
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      setPwdMsg({
        text: err.response?.data?.message || 'Failed to change password',
        isError: true
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Administrator Settings"
        subtitle="Manage administrator profile credentials, security configurations, and portal authentication."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Settings' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary">
              <FiShield className="w-3 h-3" />
              <span>Root Access</span>
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Card */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg border border-indigo-100 dark:border-indigo-900/40">
              <FiUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Admin Profile
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update display name and administration contact email.
              </p>
            </div>
          </div>

          {profileMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                profileMsg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
              }`}
            >
              {profileMsg.isError ? (
                <FiAlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <FiCheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="input-label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                className="input"
              />
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
                className="input"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="btn-primary"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg border border-emerald-100 dark:border-emerald-900/40">
              <FiLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Security & Password
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Change your administrator account authentication password.
              </p>
            </div>
          </div>

          {pwdMsg.text && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                pwdMsg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
              }`}
            >
              {pwdMsg.isError ? (
                <FiAlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <FiCheckCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="input-label">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })
                }
                required
                placeholder="Enter current password"
                className="input"
              />
            </div>

            <div>
              <label className="input-label">New Password (8+ chars)</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })
                }
                required
                placeholder="Enter new strong password"
                className="input"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwdLoading}
                className="btn-primary"
              >
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
