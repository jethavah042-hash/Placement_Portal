import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getAdminCodingProblemsRequest,
  createAdminCodingProblemRequest,
  updateAdminCodingProblemRequest,
  deleteAdminCodingProblemRequest,
  getAdminCodingNotesRequest,
  createAdminCodingNoteRequest,
  updateAdminCodingNoteRequest,
  deleteAdminCodingNoteRequest,
  getAdminInterviewQuestionsRequest,
  createAdminInterviewQuestionRequest,
  updateAdminInterviewQuestionRequest,
  deleteAdminInterviewQuestionRequest
} from '../../api/admin';
import {
  FiCode,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiBookOpen,
  FiMessageSquare,
  FiLayers,
  FiX,
  FiTag,
  FiCheck
} from 'react-icons/fi';

const CODING_TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Trees', 'Graphs', 'Recursion', 'Sorting', 'Searching', 'Dynamic Programming'
];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const ManageCoding = () => {
  const [activeTab, setActiveTab] = useState('problems');

  // Dynamic counts for all tabs
  const [totalProblemsCount, setTotalProblemsCount] = useState(0);
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [totalInterviewQsCount, setTotalInterviewQsCount] = useState(0);

  // Problems State
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchProblem, setSearchProblem] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;
  const [problemModal, setProblemModal] = useState(null); // null, 'create', or problem object
  const [savingProblem, setSavingProblem] = useState(false);

  // Notes State
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const [savingNote, setSavingNote] = useState(false);

  // Interview Questions State
  const [interviewQs, setInterviewQs] = useState([]);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [interviewModal, setInterviewModal] = useState(null);
  const [savingInterview, setSavingInterview] = useState(false);

  // Error States
  const [problemsError, setProblemsError] = useState(null);
  const [notesError, setNotesError] = useState(null);
  const [interviewError, setInterviewError] = useState(null);

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: '', // 'problem' | 'note' | 'interview'
    item: null,
    loading: false
  });

  // Load Problems
  const fetchProblems = async (currentPage = page) => {
    setLoadingProblems(true);
    setProblemsError(null);
    try {
      const params = { page: currentPage, limit };
      if (selectedTopic !== 'All') params.topic = selectedTopic;
      if (difficultyFilter !== 'All') params.difficulty = difficultyFilter;
      if (searchProblem.trim()) params.search = searchProblem.trim();

      const { data } = await getAdminCodingProblemsRequest(params);
      if (data.success) {
        setProblems(data.data || []);
        setTotalProblemsCount(data.total || 0);
        setTotalPages(data.pages || 1);
        setPage(data.page || currentPage);
      } else {
        setProblemsError(data.message || 'Failed to fetch coding problems');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setProblemsError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoadingProblems(false);
    }
  };

  // Load Notes
  const fetchNotes = async () => {
    setLoadingNotes(true);
    setNotesError(null);
    try {
      const { data } = await getAdminCodingNotesRequest();
      if (data.success) {
        setNotes(data.data || []);
        setTotalNotesCount(data.data?.length || 0);
      } else {
        setNotesError(data.message || 'Failed to fetch topic notes');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotesError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoadingNotes(false);
    }
  };

  // Load Interview Qs
  const fetchInterviewQs = async () => {
    setLoadingInterview(true);
    setInterviewError(null);
    try {
      const { data } = await getAdminInterviewQuestionsRequest();
      if (data.success) {
        setInterviewQs(data.data || []);
        setTotalInterviewQsCount(data.data?.length || 0);
      } else {
        setInterviewError(data.message || 'Failed to fetch interview questions');
      }
    } catch (err) {
      console.error('Error fetching interview questions:', err);
      setInterviewError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoadingInterview(false);
    }
  };

  // Initial load of counts on mount
  useEffect(() => {
    fetchProblems(1);
    fetchNotes();
    fetchInterviewQs();
  }, []);

  // Fetch when filters or page change
  useEffect(() => {
    if (activeTab === 'problems') {
      fetchProblems(page);
    }
  }, [page, selectedTopic, difficultyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProblems(1);
  };

  // Handle Save Problem
  const handleSaveProblem = async (e) => {
    e.preventDefault();
    setSavingProblem(true);
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      topic: formData.get('topic'),
      difficulty: formData.get('difficulty'),
      description: formData.get('description'),
      constraints: formData.get('constraints') ? formData.get('constraints').split('\n').filter(Boolean) : [],
      tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (problemModal._id) {
        await updateAdminCodingProblemRequest(problemModal._id, payload);
      } else {
        payload.testCases = [{ input: '1, 2', expectedOutput: '3', isHidden: false }];
        await createAdminCodingProblemRequest(payload);
      }
      setProblemModal(null);
      await fetchProblems(page);
    } catch (err) {
      console.error('Error saving problem:', err);
      alert(err.response?.data?.message || 'Error saving coding problem');
    } finally {
      setSavingProblem(false);
    }
  };

  // Handle Save Note
  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    const formData = new FormData(e.target);
    const payload = {
      topic: formData.get('topic'),
      summary: formData.get('summary'),
      concepts: formData.get('concepts') ? formData.get('concepts').split('\n').map(c => ({ title: c.trim(), content: c.trim() })).filter(c => c.title) : []
    };

    try {
      if (noteModal._id) {
        await updateAdminCodingNoteRequest(noteModal._id, payload);
      } else {
        await createAdminCodingNoteRequest(payload);
      }
      setNoteModal(null);
      await fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
      alert(err.response?.data?.message || 'Error saving note');
    } finally {
      setSavingNote(false);
    }
  };

  // Handle Save Interview Q
  const handleSaveInterviewQ = async (e) => {
    e.preventDefault();
    setSavingInterview(true);
    const formData = new FormData(e.target);
    const payload = {
      topic: formData.get('topic'),
      difficulty: formData.get('difficulty'),
      question: formData.get('question'),
      answer: formData.get('answer'),
      companyTags: formData.get('companyTags') ? formData.get('companyTags').split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      if (interviewModal._id) {
        await updateAdminInterviewQuestionRequest(interviewModal._id, payload);
      } else {
        await createAdminInterviewQuestionRequest(payload);
      }
      setInterviewModal(null);
      await fetchInterviewQs();
    } catch (err) {
      console.error('Error saving interview question:', err);
      alert(err.response?.data?.message || 'Error saving interview question');
    } finally {
      setSavingInterview(false);
    }
  };

  // Confirm delete triggers
  const promptDelete = (type, item) => {
    setDeleteConfirm({
      isOpen: true,
      type,
      item,
      loading: false
    });
  };

  const executeDelete = async () => {
    const { type, item } = deleteConfirm;
    if (!item) return;

    setDeleteConfirm(prev => ({ ...prev, loading: true }));
    try {
      if (type === 'problem') {
        await deleteAdminCodingProblemRequest(item._id);
        await fetchProblems(page);
      } else if (type === 'note') {
        await deleteAdminCodingNoteRequest(item._id);
        await fetchNotes();
      } else if (type === 'interview') {
        await deleteAdminInterviewQuestionRequest(item._id);
        await fetchInterviewQs();
      }
      setDeleteConfirm({ isOpen: false, type: '', item: null, loading: false });
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteConfirm(prev => ({ ...prev, loading: false }));
      alert(err.response?.data?.message || 'Error executing delete');
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

  return (
    <AdminLayout>
      {/* Header */}
      <PageHeader
        title="Coding Practice Control"
        subtitle="Maintain programming challenges, algorithms, starter templates, theory notes, and technical interview questions."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'DSA & Coding Control' }
        ]}
        actions={
          activeTab === 'problems' ? (
            <button
              type="button"
              onClick={() => setProblemModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Challenge</span>
            </button>
          ) : activeTab === 'notes' ? (
            <button
              type="button"
              onClick={() => setNoteModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Topic Guide</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setInterviewModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Interview Q</span>
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="card p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="tab-list">
          <button
            type="button"
            onClick={() => setActiveTab('problems')}
            className={activeTab === 'problems' ? 'tab-item-active' : 'tab-item'}
          >
            Coding Challenges ({totalProblemsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={activeTab === 'notes' ? 'tab-item-active' : 'tab-item'}
          >
            Topic Notes ({totalNotesCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={activeTab === 'interview' ? 'tab-item-active' : 'tab-item'}
          >
            Interview Q&A ({totalInterviewQsCount})
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="badge-primary">DSA Suite Active</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CODING PROBLEMS */}
      {/* ===================================================================== */}
      {activeTab === 'problems' && (
        <div className="space-y-6">
          {/* Controls Ribbon */}
          <div className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Topic Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Topic:</span>
                <select
                  value={selectedTopic}
                  onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  <option value="All">All Topics</option>
                  {CODING_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Difficulty Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Difficulty:</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => { setDifficultyFilter(e.target.value); setPage(1); }}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-80">
              <SearchBar
                value={searchProblem}
                onChange={(e) => setSearchProblem(e.target.value)}
                placeholder="Search coding challenges..."
              />
            </form>
          </div>

          {/* Problems Table */}
          {loadingProblems ? (
            <LoadingState variant="table" rows={6} />
          ) : problemsError ? (
            <div className="card p-6">
              <ErrorState message={problemsError} onRetry={() => fetchProblems(page)} />
            </div>
          ) : problems.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiCode}
                title="No Coding Challenges Found"
                description={
                  searchProblem || selectedTopic !== 'All' || difficultyFilter !== 'All'
                    ? 'No challenges match your active filters. Try resetting them.'
                    : 'Start by creating the first coding challenge in the library.'
                }
                action={
                  <button
                    type="button"
                    onClick={() => setProblemModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Problem</span>
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
                        Problem Title
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        DSA Topic
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Test Cases
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tags
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                    {problems.map((prob) => (
                      <tr key={prob._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {prob.title}
                          </p>
                          {prob.description && (
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                              {prob.description.replace(/[#*`_]/g, '')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="badge-neutral font-medium">
                            {prob.topic}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={getDifficultyBadgeClass(prob.difficulty)}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                          {prob.sampleTestCases?.length || prob.testCases?.length || 1} Test Cases
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {prob.tags && prob.tags.length > 0 ? (
                              prob.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">DSA</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProblemModal(prob)}
                              className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                              title="Edit Problem"
                              aria-label="Edit Problem"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete('problem', prob)}
                              className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                              title="Delete Problem"
                              aria-label="Delete Problem"
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
                <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{page}</span> of{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span> ({totalProblemsCount} challenges)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
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
      {/* TAB 2: TOPIC NOTES */}
      {/* ===================================================================== */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {loadingNotes ? (
            <LoadingState variant="page" />
          ) : notesError ? (
            <div className="card p-6">
              <ErrorState message={notesError} onRetry={fetchNotes} />
            </div>
          ) : notes.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiBookOpen}
                title="No Topic Notes Found"
                description="Create comprehensive topic notes and algorithms cheat sheets for students."
                action={
                  <button
                    type="button"
                    onClick={() => setNoteModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Topic Guide</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(note => (
                <div key={note._id} className="card p-5 flex flex-col justify-between space-y-3 card-hover">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-primary font-semibold">{note.topic}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNoteModal(note)}
                          className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                          title="Edit Guide"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete('note', note)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                          title="Delete Guide"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                      {note.summary || 'Detailed conceptual algorithms and complexity notes.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{note.concepts?.length || 0} Key Concepts</span>
                    <span className="text-[11px] text-gray-400">DSA Quick Guide</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: INTERVIEW QUESTIONS */}
      {/* ===================================================================== */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          {loadingInterview ? (
            <LoadingState variant="list" rows={5} />
          ) : interviewError ? (
            <div className="card p-6">
              <ErrorState message={interviewError} onRetry={fetchInterviewQs} />
            </div>
          ) : interviewQs.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiMessageSquare}
                title="No Technical Interview Questions"
                description="Add frequently asked company interview questions and model solutions."
                action={
                  <button
                    type="button"
                    onClick={() => setInterviewModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Interview Q</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="space-y-3">
              {interviewQs.map(iq => (
                <div key={iq._id} className="card p-5 space-y-2 card-hover">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="badge-primary font-semibold">{iq.topic}</span>
                      <span className={getDifficultyBadgeClass(iq.difficulty)}>
                        {iq.difficulty || 'Medium'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {iq.companyTags && iq.companyTags.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <FiTag className="w-3 h-3" />
                          <span>{iq.companyTags.slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setInterviewModal(iq)}
                        className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                        title="Edit Question"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => promptDelete('interview', iq)}
                        className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                        title="Delete Question"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white pt-1">
                    {iq.question}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {iq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PROBLEM CREATE/EDIT */}
      {/* ===================================================================== */}
      {problemModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {problemModal._id ? `Edit Challenge: ${problemModal.title}` : 'Create New Coding Problem'}
              </h3>
              <button
                type="button"
                onClick={() => setProblemModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Problem Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={problemModal.title || ''}
                    placeholder="e.g. Two Sum, Reverse Linked List..."
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={problemModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">DSA Topic Category</label>
                <select
                  name="topic"
                  defaultValue={problemModal.topic || 'Arrays'}
                  className="input"
                >
                  {CODING_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Problem Description (Markdown Supported)</label>
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={problemModal.description || ''}
                  placeholder="Provide problem statement, examples, and expected input/output..."
                  required
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <label className="input-label">Constraints (1 per line)</label>
                <textarea
                  name="constraints"
                  rows={2}
                  defaultValue={problemModal.constraints?.join('\n') || '1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9'}
                  placeholder="1 <= nums.length <= 10^4"
                  className="input font-mono text-xs"
                />
              </div>

              <div>
                <label className="input-label">Tags (Comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={problemModal.tags?.join(', ') || 'Arrays, Hash Table, Two Pointers'}
                  placeholder="Arrays, Two Pointers, TCS, Amazon"
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProblemModal(null)}
                  disabled={savingProblem}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProblem}
                  className="btn-primary"
                >
                  {savingProblem ? 'Saving...' : 'Save Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: TOPIC NOTE CREATE/EDIT */}
      {/* ===================================================================== */}
      {noteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {noteModal._id ? `Edit Guide: ${noteModal.topic}` : 'Add DSA Topic Guide'}
              </h3>
              <button
                type="button"
                onClick={() => setNoteModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="input-label">DSA Topic</label>
                <select
                  name="topic"
                  defaultValue={noteModal.topic || 'Arrays'}
                  className="input font-semibold"
                >
                  {CODING_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Topic Summary / Overview</label>
                <textarea
                  name="summary"
                  rows={3}
                  defaultValue={noteModal.summary || ''}
                  required
                  placeholder="Overview of data structure concepts, use cases, and complexity..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Concepts / Bullet Points (1 per line)</label>
                <textarea
                  name="concepts"
                  rows={3}
                  defaultValue={noteModal.concepts?.map(c => c.title || c).join('\n') || ''}
                  placeholder="Contiguous memory allocation&#10;O(1) random access&#10;Two Pointer optimization"
                  className="input font-mono text-xs"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNoteModal(null)}
                  disabled={savingNote}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="btn-primary"
                >
                  {savingNote ? 'Saving...' : 'Save Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: INTERVIEW QUESTION CREATE/EDIT */}
      {/* ===================================================================== */}
      {interviewModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {interviewModal._id ? 'Edit Interview Question' : 'Add Interview Question'}
              </h3>
              <button
                type="button"
                onClick={() => setInterviewModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterviewQ} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">DSA Topic</label>
                  <select
                    name="topic"
                    defaultValue={interviewModal.topic || 'Arrays'}
                    className="input font-semibold"
                  >
                    {CODING_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={interviewModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Interview Question</label>
                <input
                  type="text"
                  name="question"
                  defaultValue={interviewModal.question || ''}
                  required
                  placeholder="e.g. Explain how Two Pointers works in dynamic subarrays..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Model Solution / Explanation</label>
                <textarea
                  name="answer"
                  rows={4}
                  defaultValue={interviewModal.answer || ''}
                  required
                  placeholder="Provide structured answer covering approach, edge cases, and complexity..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Target Companies (Comma separated)</label>
                <input
                  type="text"
                  name="companyTags"
                  defaultValue={interviewModal.companyTags?.join(', ') || 'Amazon, Microsoft, TCS, Infosys'}
                  placeholder="e.g. Amazon, Google, TCS, Wipro"
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setInterviewModal(null)}
                  disabled={savingInterview}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInterview}
                  className="btn-primary"
                >
                  {savingInterview ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: '', item: null, loading: false })}
        onConfirm={executeDelete}
        title={`Delete ${deleteConfirm.type === 'problem' ? 'Coding Challenge' : deleteConfirm.type === 'note' ? 'Topic Guide' : 'Interview Question'}`}
        message={`Are you sure you want to delete this ${deleteConfirm.type === 'problem' ? 'challenge' : deleteConfirm.type === 'note' ? 'guide' : 'interview question'}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </AdminLayout>
  );
};

export default ManageCoding;
