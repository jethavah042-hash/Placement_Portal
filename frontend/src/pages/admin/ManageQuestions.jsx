import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getAdminQuestionsRequest,
  createAdminQuestionRequest,
  updateAdminQuestionRequest,
  deleteAdminQuestionRequest
} from '../../api/admin';
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiHelpCircle,
  FiX
} from 'react-icons/fi';

const MODULES = ['Aptitude', 'Reasoning', 'English'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const ManageQuestions = ({ initialModule = 'Aptitude' }) => {
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Modals
  const [questionModal, setQuestionModal] = useState(null); // null or question object
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, item: null, loading: false });

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        moduleType: selectedModule
      };
      if (difficultyFilter !== 'All') params.difficulty = difficultyFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await getAdminQuestionsRequest(params);
      if (data.success) {
        setQuestions(data.data || []);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);
      } else {
        setError(data.message || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedModule, difficultyFilter, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setSavingQuestion(true);
    const formData = new FormData(e.target);

    const optionsRaw = [
      formData.get('optionA'),
      formData.get('optionB'),
      formData.get('optionC'),
      formData.get('optionD')
    ].filter(Boolean);

    const correctChoice = formData.get('correctChoice') || 'A';
    const choiceMap = { A: 0, B: 1, C: 2, D: 3 };
    const selectedIdx = choiceMap[correctChoice] ?? 0;
    const correctAnswer = optionsRaw[selectedIdx] || optionsRaw[0];

    const payload = {
      moduleType: selectedModule,
      category: formData.get('category'),
      topic: formData.get('category'),
      difficulty: formData.get('difficulty') || 'Medium',
      questionText: formData.get('questionText'),
      options: optionsRaw,
      correctAnswer,
      explanation: formData.get('explanation') || '',
      marks: Number(formData.get('marks')) || 1,
      negativeMarks: Number(formData.get('negativeMarks')) !== undefined ? Number(formData.get('negativeMarks')) : 0.25,
      status: formData.get('status') || 'published'
    };

    try {
      if (questionModal._id) {
        await updateAdminQuestionRequest(questionModal._id, payload);
      } else {
        await createAdminQuestionRequest(payload);
      }
      setQuestionModal(null);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      alert(err.response?.data?.message || 'Error saving question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDelete = (question) => {
    setDeleteConfirm({
      isOpen: true,
      item: question,
      loading: false
    });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm.item) return;
    setDeleteConfirm(prev => ({ ...prev, loading: true }));
    try {
      await deleteAdminQuestionRequest(deleteConfirm.item._id);
      setDeleteConfirm({ isOpen: false, item: null, loading: false });
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
      setDeleteConfirm(prev => ({ ...prev, loading: false }));
      alert(err.response?.data?.message || 'Error deleting question');
    }
  };

  const getSelectedChoice = (q) => {
    if (!q || !q.options || !q.correctAnswer) return 'A';
    const idx = q.options.indexOf(q.correctAnswer);
    return idx === 1 ? 'B' : idx === 2 ? 'C' : idx === 3 ? 'D' : 'A';
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

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title={`${selectedModule} Question Bank`}
        subtitle="Manage practice questions, assessment pools, difficulty weights, and step-by-step solutions."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Question Bank' },
          { label: selectedModule }
        ]}
        actions={
          <button
            type="button"
            onClick={() => setQuestionModal({})}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        }
      />

      {/* Module Switcher Tabs */}
      <div className="card p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="tab-list">
          {MODULES.map(mod => (
            <button
              key={mod}
              type="button"
              onClick={() => { setSelectedModule(mod); setPage(1); }}
              className={selectedModule === mod ? 'tab-item-active' : 'tab-item'}
            >
              {mod}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Total:</span>
          <span className="badge-primary">{totalCount} Questions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1.5">Difficulty:</span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => { setDifficultyFilter(diff); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                difficultyFilter === diff
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search questions or topics..."
          />
        </form>
      </div>

      {/* Content Body */}
      {loading ? (
        <LoadingState variant="table" rows={6} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchQuestions} />
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={FiBookOpen}
            title={`No ${selectedModule} Questions Found`}
            description={
              search || difficultyFilter !== 'All'
                ? 'Try adjusting your search criteria or difficulty filter.'
                : 'Get started by creating the first question for this question bank.'
            }
            action={
              <button
                type="button"
                onClick={() => setQuestionModal({})}
                className="btn-primary"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create New Question</span>
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Question Statement
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Topic / Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Correct Answer
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Marking
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3.5 max-w-md">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                        {q.questionText}
                      </p>
                      {q.explanation && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                          {q.explanation}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="badge-neutral font-medium">
                        {q.category || q.topic || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={getDifficultyBadgeClass(q.difficulty)}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/50 truncate max-w-full">
                        <FiCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{q.correctAnswer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                      +{q.marks || 1} / -{q.negativeMarks !== undefined ? q.negativeMarks : 0.25}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuestionModal(q)}
                          className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                          title="Edit Question"
                          aria-label="Edit Question"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                          title="Delete Question"
                          aria-label="Delete Question"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>
                Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{page}</span> of{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span> ({totalCount} total)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                  aria-label="Previous Page"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {questionModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {questionModal._id ? `Edit ${selectedModule} Question` : `New ${selectedModule} Question`}
              </h3>
              <button
                type="button"
                onClick={() => setQuestionModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {/* Row 1: Topic & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">{selectedModule} Topic / Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={questionModal.category || questionModal.topic || ''}
                    placeholder="e.g. Percentage, Blood Relations, Grammar..."
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Difficulty Level</label>
                  <select
                    name="difficulty"
                    defaultValue={questionModal.difficulty || 'Medium'}
                    className="input"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Question Statement */}
              <div>
                <label className="input-label">Question Statement</label>
                <textarea
                  name="questionText"
                  rows={3}
                  defaultValue={questionModal.questionText || ''}
                  placeholder="Enter complete problem statement or passage question..."
                  required
                  className="input font-medium"
                />
              </div>

              {/* Row 3: 2x2 Grid of Options (Option A, B, C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Option A</label>
                  <input
                    type="text"
                    name="optionA"
                    defaultValue={questionModal.options?.[0] || ''}
                    placeholder="Enter Option A"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Option B</label>
                  <input
                    type="text"
                    name="optionB"
                    defaultValue={questionModal.options?.[1] || ''}
                    placeholder="Enter Option B"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Option C</label>
                  <input
                    type="text"
                    name="optionC"
                    defaultValue={questionModal.options?.[2] || ''}
                    placeholder="Enter Option C"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Option D</label>
                  <input
                    type="text"
                    name="optionD"
                    defaultValue={questionModal.options?.[3] || ''}
                    placeholder="Enter Option D"
                    className="input"
                  />
                </div>
              </div>

              {/* Row 4: Correct Choice, Marks, Negative Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Correct Option</label>
                  <select
                    name="correctChoice"
                    defaultValue={getSelectedChoice(questionModal)}
                    className="input font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Marks (+)</label>
                  <input
                    type="number"
                    step="0.25"
                    name="marks"
                    defaultValue={questionModal.marks || 1}
                    className="input font-mono"
                  />
                </div>
                <div>
                  <label className="input-label">Negative Marks (-)</label>
                  <input
                    type="number"
                    step="0.25"
                    name="negativeMarks"
                    defaultValue={questionModal.negativeMarks !== undefined ? questionModal.negativeMarks : 0.25}
                    className="input font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Step-by-Step Explanation */}
              <div>
                <label className="input-label">Detailed Solution / Explanation</label>
                <textarea
                  name="explanation"
                  rows={3}
                  defaultValue={questionModal.explanation || ''}
                  placeholder="Provide step-by-step logic, formula applied, or rationale..."
                  className="input"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuestionModal(null)}
                  disabled={savingQuestion}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="btn-primary"
                >
                  {savingQuestion ? 'Saving Question...' : 'Save Question'}
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
        onConfirm={confirmDeleteAction}
        title="Delete Question"
        message="Are you sure you want to delete this question from the question bank? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </AdminLayout>
  );
};

export default ManageQuestions;
