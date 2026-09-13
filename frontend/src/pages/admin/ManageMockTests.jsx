import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getAdminMockTestsRequest,
  createAdminMockTestRequest,
  updateAdminMockTestRequest,
  deleteAdminMockTestRequest,
  getAdminQuestionsRequest
} from '../../api/admin';
import {
  FiCheckSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiAward,
  FiLayers,
  FiCheck,
  FiX,
  FiHelpCircle,
  FiSearch
} from 'react-icons/fi';

const ManageMockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [testModal, setTestModal] = useState(null); // null, 'create', or test object
  const [savingTest, setSavingTest] = useState(false);

  // Question Pool for Test Assembly
  const [allQuestions, setAllQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [qSearchInModal, setQSearchInModal] = useState('');
  const [qModuleFilter, setQModuleFilter] = useState('All');

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null, loading: false });

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAdminMockTestsRequest();
      if (data.success) {
        setTests(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch mock tests');
      }
    } catch (err) {
      console.error('Error fetching mock tests:', err);
      setError(err.response?.data?.message || 'Error connecting to test repository');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsPool = async () => {
    setLoadingQuestions(true);
    try {
      const { data } = await getAdminQuestionsRequest({ limit: 200 });
      if (data.success) {
        setAllQuestions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching question pool:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchQuestionsPool();
  }, []);

  const openCreateModal = () => {
    setSelectedQuestionIds([]);
    setQSearchInModal('');
    setQModuleFilter('All');
    setTestModal({});
  };

  const openEditModal = (test) => {
    const ids = (test.questions || []).map(q => typeof q === 'object' ? q._id : q);
    setSelectedQuestionIds(ids);
    setQSearchInModal('');
    setQModuleFilter('All');
    setTestModal(test);
  };

  const toggleQuestionSelection = (id) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllFilteredQuestions = (filteredList) => {
    const filteredIds = filteredList.map(q => q._id);
    const allSelected = filteredIds.every(id => selectedQuestionIds.includes(id));
    if (allSelected) {
      setSelectedQuestionIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least 1 question for this assessment');
      return;
    }

    setSavingTest(true);
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category') || 'Placement Simulation',
      difficulty: formData.get('difficulty') || 'Medium',
      duration: Number(formData.get('duration') || 45),
      passingPercentage: Number(formData.get('passingPercentage') || 60),
      negativeMarking: Number(formData.get('negativeMarking') || 0.25),
      description: formData.get('description') || '',
      questions: selectedQuestionIds,
      isPublished: true
    };

    try {
      if (testModal._id) {
        await updateAdminMockTestRequest(testModal._id, payload);
      } else {
        await createAdminMockTestRequest(payload);
      }
      setTestModal(null);
      fetchTests();
    } catch (err) {
      console.error('Error saving mock test:', err);
      alert(err.response?.data?.message || 'Failed to save mock test');
    } finally {
      setSavingTest(false);
    }
  };

  const promptDelete = (test) => {
    setDeleteConfirm({
      isOpen: true,
      item: test,
      loading: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;
    setDeleteConfirm(prev => ({ ...prev, loading: true }));
    try {
      await deleteAdminMockTestRequest(deleteConfirm.item._id);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      fetchTests();
    } catch (err) {
      console.error('Error deleting mock test:', err);
      setDeleteConfirm(prev => ({ ...prev, loading: false }));
      alert(err.response?.data?.message || 'Error deleting mock test');
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'badge-success';
      case 'hard':
        return 'badge-danger';
      case 'medium':
      default:
        return 'badge-warning';
    }
  };

  const filteredTests = tests.filter(t => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return t.title?.toLowerCase().includes(query) || t.category?.toLowerCase().includes(query);
  });

  const modalFilteredQuestions = allQuestions.filter(q => {
    const matchesModule = qModuleFilter === 'All' || q.moduleType === qModuleFilter;
    const matchesSearch = !qSearchInModal.trim() ||
      q.questionText?.toLowerCase().includes(qSearchInModal.toLowerCase()) ||
      q.category?.toLowerCase().includes(qSearchInModal.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title="Mock Test Arena Builder"
        subtitle="Construct full-length corporate simulation exams, configure timers, set negative marking penalties, and manage assessment pools."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Mock Test Arena' }
        ]}
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4" />
            <span>Assemble Test</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Active Tests:</span>
          <span className="badge-primary">{tests.length} Standard Tests</span>
        </div>

        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mock assessments..."
          />
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchTests} />
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={FiCheckSquare}
            title="No Mock Tests Configured"
            description={
              search
                ? 'No mock tests match your search query. Try clearing the filter.'
                : 'Assemble placement test simulations from the curated question pool.'
            }
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="btn-primary"
              >
                <FiPlus className="w-4 h-4" />
                <span>Assemble First Test</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test._id}
              className="card p-5 flex flex-col justify-between space-y-4 card-hover"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="badge-primary font-semibold truncate">
                    {test.category || 'Company Prep'}
                  </span>
                  <span className={getDifficultyBadgeClass(test.difficulty)}>
                    {test.difficulty || 'Medium'}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                  {test.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {test.description || 'Full-length company placement simulation exam.'}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                    <FiClock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{test.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-mono">
                    <FiAward className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{test.totalQuestions || test.questions?.length || 0} Qs</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {test.attemptsCount || 0} Student Attempts
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(test)}
                    className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                    title="Edit Assessment"
                    aria-label="Edit Assessment"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => promptDelete(test)}
                    className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                    title="Delete Assessment"
                    aria-label="Delete Assessment"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Builder Modal */}
      {testModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-3xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {testModal._id ? `Edit Test: ${testModal.title}` : 'Assemble New Mock Assessment'}
              </h3>
              <button
                type="button"
                onClick={() => setTestModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Assessment Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={testModal.title || ''}
                    placeholder="e.g. TCS NQT Full Diagnostic Exam"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={testModal.category || 'Company Prep'}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="input-label">Duration (Mins)</label>
                  <input
                    type="number"
                    name="duration"
                    defaultValue={testModal.duration || 60}
                    required
                    min={5}
                    max={300}
                    className="input font-mono"
                  />
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={testModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Pass Percentage (%)</label>
                  <input
                    type="number"
                    name="passingPercentage"
                    defaultValue={testModal.passingPercentage || 60}
                    min={1}
                    max={100}
                    className="input font-mono"
                  />
                </div>
                <div>
                  <label className="input-label">Negative Mark (-)</label>
                  <input
                    type="number"
                    step="0.05"
                    name="negativeMarking"
                    defaultValue={testModal.negativeMarking || 0.25}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Test Instructions & Summary</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={testModal.description || ''}
                  placeholder="Exam rules, negative marking guidelines, recommended time allocations..."
                  className="input"
                />
              </div>

              {/* Question Selection Box */}
              <div className="space-y-2 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="input-label mb-0 font-semibold">
                      Select Assessment Questions
                    </label>
                    <span className="badge-primary font-mono">
                      {selectedQuestionIds.length} Selected
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => selectAllFilteredQuestions(modalFilteredQuestions)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Toggle All Filtered ({modalFilteredQuestions.length})
                  </button>
                </div>

                {/* Sub-toolbar inside modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={qSearchInModal}
                    onChange={(e) => setQSearchInModal(e.target.value)}
                    placeholder="Search question pool..."
                    className="input text-xs py-1.5"
                  />
                  <select
                    value={qModuleFilter}
                    onChange={(e) => setQModuleFilter(e.target.value)}
                    className="input text-xs py-1.5"
                  >
                    <option value="All">All Modules (Aptitude, Reasoning, English)</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* Question List */}
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl p-2 space-y-1.5 bg-gray-50/50 dark:bg-gray-800/40 divide-y divide-gray-100 dark:divide-gray-800/50">
                  {modalFilteredQuestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                      No questions found matching criteria.
                    </div>
                  ) : (
                    modalFilteredQuestions.map((q) => {
                      const isChecked = selectedQuestionIds.includes(q._id);
                      return (
                        <div
                          key={q._id}
                          onClick={() => toggleQuestionSelection(q._id)}
                          className={`p-2.5 rounded-lg cursor-pointer text-xs flex items-center justify-between border transition-all ${
                            isChecked
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-medium'
                              : 'bg-white dark:bg-gray-900 border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="truncate mr-3">
                            <span className="badge-neutral text-[10px] mr-2">
                              {q.moduleType} &bull; {q.difficulty}
                            </span>
                            <span className="truncate">{q.questionText}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTestModal(null)}
                  disabled={savingTest}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="btn-primary"
                >
                  {savingTest ? 'Saving Assessment...' : 'Save Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null, loading: false })}
        onConfirm={confirmDelete}
        title="Delete Mock Test"
        message={`Are you sure you want to delete "${deleteConfirm.item?.title}"? All student attempt records for this test may be affected.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </AdminLayout>
  );
};

export default ManageMockTests;
