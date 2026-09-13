import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
  getAdminCompaniesRequest,
  createAdminCompanyRequest,
  updateAdminCompanyRequest,
  deleteAdminCompanyRequest
} from '../../api/admin';
import {
  FiBriefcase,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiDollarSign,
  FiGlobe,
  FiLayers,
  FiX
} from 'react-icons/fi';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [companyModal, setCompanyModal] = useState(null); // null, {} (for create), or company object
  const [deleteModalCompany, setDeleteModalCompany] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;

      const { data } = await getAdminCompaniesRequest(params);
      if (data.success) {
        setCompanies(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.response?.data?.message || 'Failed to load company profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      industry: formData.get('industry') || 'Information Technology',
      website: formData.get('website') || '',
      avgPackage: formData.get('avgPackage') || '6-9 LPA',
      eligibility: formData.get('eligibility') || '60% throughout 10th, 12th & Graduation',
      description: formData.get('description') || '',
      jobRoles: formData.get('jobRoles')
        ? formData.get('jobRoles').split(',').map((r) => r.trim()).filter(Boolean)
        : ['Software Engineer'],
      requiredSkills: formData.get('requiredSkills')
        ? formData.get('requiredSkills').split(',').map((s) => s.trim()).filter(Boolean)
        : ['Data Structures', 'JavaScript'],
      preparationTips: formData.get('preparationTips') || ''
    };

    try {
      if (companyModal._id) {
        await updateAdminCompanyRequest(companyModal._id, payload);
      } else {
        await createAdminCompanyRequest(payload);
      }
      setCompanyModal(null);
      fetchCompanies();
    } catch (err) {
      console.error('Error saving company:', err);
      alert(err.response?.data?.message || 'Error saving company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalCompany) return;
    setDeleteLoading(true);
    try {
      await deleteAdminCompanyRequest(deleteModalCompany._id);
      setDeleteModalCompany(null);
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company:', err);
      alert(err.response?.data?.message || 'Error deleting company');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Company Placement Profiles"
        subtitle="Manage target hiring companies, selection eligibility, packages, exam patterns, and preparation tips."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Companies' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary hidden sm:inline-flex">
              {companies.length} Corporate Recruiters
            </span>
            <button
              onClick={() => setCompanyModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Recruiter</span>
            </button>
          </div>
        }
      />

      {/* Search Toolbar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name..."
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            Showing {companies.length} hiring partners
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchCompanies} />
        </div>
      ) : companies.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiBriefcase}
            title="No Companies Found"
            description="No corporate recruiter profiles match your search criteria."
            action={
              <button
                onClick={() => setCompanyModal({})}
                className="btn-primary text-xs"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add First Company</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => (
            <div
              key={comp._id}
              className="card card-hover p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                      {comp.name ? comp.name.substring(0, 2).toUpperCase() : 'CO'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {comp.industry || 'Information Technology'}
                      </p>
                    </div>
                  </div>
                  <span className="badge-primary shrink-0 text-[11px]">
                    {comp.avgPackage || 'Competitive'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {comp.description || 'Global corporate placement partner.'}
                </p>

                {/* Job Roles */}
                {comp.jobRoles && comp.jobRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {comp.jobRoles.slice(0, 3).map((r, i) => (
                      <span key={i} className="badge-neutral text-[10px]">
                        {r}
                      </span>
                    ))}
                    {comp.jobRoles.length > 3 && (
                      <span className="badge-neutral text-[10px]">
                        +{comp.jobRoles.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 text-[11px] font-mono">
                  {comp.requiredSkills?.length || 0} Skills Needed
                </span>

                <div className="flex items-center gap-1">
                  {comp.website && (
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      title="Visit Careers Site"
                    >
                      <FiGlobe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setCompanyModal(comp)}
                    className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    title="Edit Profile"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalCompany(comp)}
                    className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    title="Delete Profile"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {companyModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {companyModal._id
                  ? `Edit ${companyModal.name}`
                  : 'Add New Target Recruiter'}
              </h3>
              <button
                type="button"
                onClick={() => setCompanyModal(null)}
                className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={companyModal.name || ''}
                    required
                    placeholder="e.g. Tata Consultancy Services"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    defaultValue={companyModal.industry || 'Information Technology'}
                    placeholder="e.g. IT Services / Fintech"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Average Package</label>
                  <input
                    type="text"
                    name="avgPackage"
                    placeholder="e.g. 7.5 LPA"
                    defaultValue={companyModal.avgPackage || ''}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Career Website</label>
                  <input
                    type="url"
                    name="website"
                    placeholder="https://tcs.com/careers"
                    defaultValue={companyModal.website || ''}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Eligibility Criteria</label>
                <input
                  type="text"
                  name="eligibility"
                  placeholder="e.g. 60% throughout 10th, 12th & Graduation"
                  defaultValue={companyModal.eligibility || '60% throughout 10th, 12th & Graduation'}
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Company Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Brief overview of the recruiter and hiring culture..."
                  defaultValue={companyModal.description || ''}
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">
                  Hiring Job Roles (Comma separated)
                </label>
                <input
                  type="text"
                  name="jobRoles"
                  placeholder="Software Engineer, Analyst, Cloud Architect"
                  defaultValue={
                    companyModal.jobRoles?.join(', ') ||
                    'Software Engineer, Systems Engineer, Analyst'
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  name="requiredSkills"
                  placeholder="DSA, Java, Python, SQL, DBMS"
                  defaultValue={
                    companyModal.requiredSkills?.join(', ') ||
                    'DSA, Java, Python, SQL, DBMS'
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">
                  Preparation Tips & Selection Pattern
                </label>
                <textarea
                  name="preparationTips"
                  rows={3}
                  defaultValue={companyModal.preparationTips || ''}
                  placeholder="Round 1: Online Aptitude + Coding, Round 2: Technical Interview..."
                  className="input"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompanyModal(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Recruiter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalCompany)}
        onClose={() => setDeleteModalCompany(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recruiter Profile"
        message={`Are you sure you want to delete "${deleteModalCompany?.name}"? All associated drive notes will be removed.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </AdminLayout>
  );
};

export default ManageCompanies;
