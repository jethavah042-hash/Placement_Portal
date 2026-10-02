import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import LoadingState from '../../components/ui/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { getProfileRequest, updateProfileRequest, changePasswordRequest } from '../../api/user';
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
  FiEdit3,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiX,
  FiTag,
  FiBriefcase,
  FiCheck
} from 'react-icons/fi';

const Profile = () => {
  const { user, setUser, refreshUser, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    branch: '',
    course: '',
    semester: '',
    graduationYear: '',
    registrationNumber: '',
    bio: '',
    skills: '',
    targetCompanies: ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ text: '', isError: false });
  const [passwordFeedback, setPasswordFeedback] = useState({ text: '', isError: false });

  // Sync state when user object updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || '',
        branch: user.branch || '',
        course: user.course || '',
        semester: user.semester || '',
        graduationYear: user.graduationYear || '',
        registrationNumber: user.registrationNumber || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        targetCompanies: Array.isArray(user.targetCompanies)
          ? user.targetCompanies.join(', ')
          : (user.targetCompanies || '')
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback({ text: '', isError: false });

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        course: formData.course.trim(),
        semester: formData.semester.trim(),
        graduationYear: formData.graduationYear.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        bio: formData.bio.trim(),
        skills: formData.skills
          ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        targetCompanies: formData.targetCompanies
          ? formData.targetCompanies.split(',').map((c) => c.trim()).filter(Boolean)
          : []
      };

      const res = await updateProfileRequest(payload);
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
        setProfileFeedback({ text: 'Profile updated successfully!', isError: false });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      setProfileFeedback({
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
        isError: true
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ text: '', isError: false });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordFeedback({ text: 'New passwords do not match.', isError: true });
    }

    if (passwordData.newPassword.length < 8) {
      return setPasswordFeedback({
        text: 'Password must be at least 8 characters long with uppercase, lowercase, number and symbol.',
        isError: true
      });
    }

    setSavingPassword(true);
    try {
      await changePasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordFeedback({ text: 'Password changed successfully!', isError: false });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      console.error(err);
      setPasswordFeedback({
        text: err.response?.data?.message || 'Failed to change password.',
        isError: true
      });
    } finally {
      setSavingPassword(false);
    }
  };

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
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Please sign in to view your candidate profile.
          </p>
          <Link to="/login" className="btn-primary mt-4 text-xs inline-flex">
            Go to Login
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const skillList = Array.isArray(user.skills) && user.skills.length > 0
    ? user.skills
    : ['JavaScript', 'React', 'Node.js', 'Data Structures', 'Algorithms', 'SQL'];

  const targetList = Array.isArray(user.targetCompanies) && user.targetCompanies.length > 0
    ? user.targetCompanies
    : ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Accenture'];

  return (
    <DashboardLayout>
      <PageHeader
        title="Candidate Profile"
        subtitle="Manage your student account information and recruitment credentials."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setIsChangingPassword(false);
                setProfileFeedback({ text: '', isError: false });
              }}
              className="btn-primary text-xs inline-flex items-center gap-1.5"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            {user.authProvider === 'local' && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  setIsEditing(false);
                  setPasswordFeedback({ text: '', isError: false });
                }}
                className="btn-secondary text-xs inline-flex items-center gap-1.5"
              >
                <FiLock className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>
            )}
          </div>
        }
      />

      {/* Global Feedback Messages */}
      {profileFeedback.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
            profileFeedback.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {profileFeedback.isError ? (
              <FiAlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <FiCheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setProfileFeedback({ text: '', isError: false })}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {passwordFeedback.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 ${
            passwordFeedback.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {passwordFeedback.isError ? (
              <FiAlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <FiCheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setPasswordFeedback({ text: '', isError: false })}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Profile Details or Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Form Card */}
          {isEditing ? (
            <div className="card p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg border border-indigo-100 dark:border-indigo-900/40">
                    <FiEdit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Edit Profile Information
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your academic records and placement preferences.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g. John Doe"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Contact Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">College / University</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      placeholder="e.g. Marwadi University"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Course / Degree</label>
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      placeholder="e.g. MCA, B.Tech, BCA"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Branch / Department</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="e.g. Computer Applications / CSE"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Current Semester</label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      placeholder="e.g. Semester 3"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Graduation Year</label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      placeholder="e.g. 2026"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Registration / Enrollment ID</label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. 23010401000"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Technical Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, Python, MongoDB, DSA"
                    className="input"
                  />
                </div>

                <div>
                  <label className="input-label">Target Companies (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.targetCompanies}
                    onChange={(e) => setFormData({ ...formData, targetCompanies: e.target.value })}
                    placeholder="e.g. Google, Microsoft, TCS, Infosys, Amazon"
                    className="input"
                  />
                </div>

                <div>
                  <label className="input-label">Professional Bio / Candidate Summary</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief overview of your career aspirations, strengths, and achievements..."
                    className="input resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {savingProfile ? (
                      'Saving Changes...'
                    ) : (
                      <>
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Profile Display Card */
            <div className="card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm overflow-hidden">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {user.name || 'Candidate'}
                    </h2>
                    <span className="badge-primary text-[10px] uppercase">
                      {user.role || 'Student'}
                    </span>
                    {user.isEmailVerified && (
                      <span className="badge-success text-[10px] inline-flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {user.college || 'Marwadi University'} • Class of {user.graduationYear || '2026'}
                    {user.course && ` • ${user.course}`}
                  </p>
                </div>
              </div>

              {/* Bio if available */}
              {user.bio && (
                <div className="mb-6 p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                  <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold block mb-0.5">
                    About Candidate
                  </span>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* Academic & Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Email Address</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 truncate">
                    {user.email || 'Not provided'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Contact Number</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                    {user.phone || 'Not provided'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Degree / Course</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                    {user.course || 'MCA'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Academic Branch</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                    {user.branch || 'Computer Applications'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Semester</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                    {user.semester || 'Semester 3'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 font-medium block">Registration / Enrollment ID</span>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 font-mono">
                    {user.registrationNumber || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Card */}
          {isChangingPassword && user.authProvider === 'local' && (
            <div className="card p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg border border-emerald-100 dark:border-emerald-900/40">
                    <FiLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Security & Password
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Update your portal password to maintain account security.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="btn-ghost p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                    placeholder="Enter your current password"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                      placeholder="Enter new password (8+ chars)"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="input-label">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      required
                      placeholder="Re-enter new password"
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    {savingPassword ? (
                      'Updating Password...'
                    ) : (
                      <>
                        <FiCheck className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Technical Skills Section */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Technical Skills & Competencies"
              subtitle="Core programming languages, frameworks, and tools in your profile"
            />

            <div className="flex flex-wrap gap-2 mt-3">
              {skillList.map((skill, idx) => (
                <span key={idx} className="badge-primary text-xs py-1 px-3">
                  <FiTag className="w-3 h-3 mr-1 opacity-70" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Target Placement Preparation Info */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Target Placement Focus"
              subtitle="Target companies and interview preferences"
            />

            <div className="space-y-3 mt-3">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Target Recruiters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {targetList.map((comp, idx) => (
                    <span key={idx} className="badge-neutral text-xs py-1 px-2.5">
                      <FiBriefcase className="w-3 h-3 mr-1 opacity-70" />
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation & Stats */}
        <div className="space-y-4">
          {/* Readiness & Streak Quick Card */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Placement Readiness
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Readiness Score</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {user.readinessScore || 78}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${user.readinessScore || 78}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Preparation Streak
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  🔥 {user.streak || 5} Days
                </span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Navigation
            </h3>
            <div className="space-y-2">
              <Link
                to="/student/resume-scanner"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiFileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  ATS Resume Scanner
                </span>
              </Link>

              <Link
                to="/student/bookmarks"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiBookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Saved Bookmarks
                </span>
              </Link>

              <Link
                to="/student/notifications"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiBell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Placement Notifications
                </span>
              </Link>

              <Link
                to="/student/mock-tests"
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 flex items-center gap-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors group"
              >
                <FiAward className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Mock Assessments
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
