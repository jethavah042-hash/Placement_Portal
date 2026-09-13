import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getAdminReasoningDashboardRequest,
  getAdminReasoningTopicsRequest,
  createAdminReasoningTopicRequest,
  updateAdminReasoningTopicRequest,
  deleteAdminReasoningTopicRequest,
  getAdminReasoningQuestionsRequest,
  createAdminReasoningQuestionRequest,
  updateAdminReasoningQuestionRequest,
  deleteAdminReasoningQuestionRequest,
  duplicateAdminReasoningQuestionRequest,
  getAdminReasoningNotesRequest,
  createAdminReasoningNoteRequest,
  updateAdminReasoningNoteRequest,
  deleteAdminReasoningNoteRequest,
  getAdminReasoningReportsRequest,
  resolveAdminReasoningReportRequest,
  deleteAdminReasoningReportRequest
} from '../../api/reasoning';
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiBookOpen,
  FiHelpCircle,
  FiFlag,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const AdminReasoning = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, topics, questions, notes, reports

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Topics state
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicModal, setTopicModal] = useState(null); // null or topic object
  const [savingTopic, setSavingTopic] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [qTopic, setQTopic] = useState('All');
  const [qDiff, setQDiff] = useState('All');
  const [qSearch, setQSearch] = useState('');
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [qTotal, setQTotal] = useState(0);
  const [questionModal, setQuestionModal] = useState(null);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const [savingNote, setSavingNote] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [resolveModal, setResolveModal] = useState(null);
  const [savingResolve, setSavingResolve] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: '', // 'topic' | 'question' | 'note' | 'report'
    item: null,
    loading: false
  });

  // Initial dashboard fetch
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const res = await getAdminReasoningDashboardRequest();
      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        setDashboardError(res.data.message || 'Failed to fetch dashboard');
      }
    } catch (err) {
      console.error('Error fetching admin reasoning dashboard:', err);
      setDashboardError(err.response?.data?.message || 'Error communicating with server');
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Fetch Topics
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const res = await getAdminReasoningTopicsRequest();
      if (res.data.success) setTopics(res.data.data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'topics') fetchTopics();
  }, [activeTab]);

  // Fetch Questions
  const fetchQuestions = async (page = qPage) => {
    setLoadingQuestions(true);
    try {
      const params = { page, limit: 15 };
      if (qTopic !== 'All') params.topic = qTopic;
      if (qDiff !== 'All') params.difficulty = qDiff;
      if (qSearch.trim()) params.search = qSearch.trim();

      const res = await getAdminReasoningQuestionsRequest(params);
      if (res.data.success) {
        setQuestions(res.data.data || []);
        setQTotal(res.data.total || 0);
        setQTotalPages(res.data.pages || 1);
        setQPage(res.data.page || page);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') fetchQuestions(qPage);
  }, [activeTab, qPage, qTopic, qDiff]);

  // Fetch Notes
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await getAdminReasoningNotesRequest();
      if (res.data.success) setNotes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notes') fetchNotes();
  }, [activeTab]);

  // Fetch Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await getAdminReasoningReportsRequest();
      if (res.data.success) setReports(res.data.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  // Topic Save Handler
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    setSavingTopic(true);
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      difficulty: formData.get('difficulty'),
      estimatedStudyTime: formData.get('estimatedStudyTime') || '45 mins',
      status: formData.get('status') || 'active',
      displayOrder: Number(formData.get('displayOrder')) || 0
    };

    try {
      if (topicModal._id) {
        await updateAdminReasoningTopicRequest(topicModal._id, payload);
      } else {
        await createAdminReasoningTopicRequest(payload);
      }
      setTopicModal(null);
      await fetchTopics();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving topic');
    } finally {
      setSavingTopic(false);
    }
  };

  // Question Save Handler
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
    const idxMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctAnswer = optionsRaw[idxMap[correctChoice]] || optionsRaw[0];

    const payload = {
      category: formData.get('category'),
      topic: formData.get('category'),
      questionText: formData.get('questionText'),
      options: optionsRaw,
      correctAnswer,
      difficulty: formData.get('difficulty') || 'Medium',
      marks: Number(formData.get('marks')) || 1,
      negativeMarks: Number(formData.get('negativeMarks')) !== undefined ? Number(formData.get('negativeMarks')) : 0.25,
      explanation: formData.get('explanation') || '',
      status: formData.get('status') || 'published'
    };

    try {
      if (questionModal._id) {
        await updateAdminReasoningQuestionRequest(questionModal._id, payload);
      } else {
        await createAdminReasoningQuestionRequest(payload);
      }
      setQuestionModal(null);
      await fetchQuestions(qPage);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDuplicateQuestion = async (id) => {
    try {
      await duplicateAdminReasoningQuestionRequest(id);
      await fetchQuestions(qPage);
      fetchDashboard();
    } catch (err) {
      console.error('Error duplicating question:', err);
    }
  };

  // Note Save Handler
  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    const formData = new FormData(e.target);
    const payload = {
      topic: formData.get('topic'),
      title: formData.get('title'),
      introduction: formData.get('introduction'),
      rules: formData.get('rules') ? formData.get('rules').split('\n').filter(Boolean) : [],
      status: formData.get('status') || 'published'
    };

    try {
      if (noteModal._id) {
        await updateAdminReasoningNoteRequest(noteModal._id, payload);
      } else {
        await createAdminReasoningNoteRequest(payload);
      }
      setNoteModal(null);
      await fetchNotes();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving guide');
    } finally {
      setSavingNote(false);
    }
  };

  // Report Resolve Handler
  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!resolveModal) return;
    setSavingResolve(true);
    const formData = new FormData(e.target);
    try {
      await resolveAdminReasoningReportRequest(resolveModal._id, {
        status: formData.get('status') || 'resolved',
        adminNotes: formData.get('adminNotes') || ''
      });
      setResolveModal(null);
      await fetchReports();
      fetchDashboard();
    } catch (err) {
      console.error('Error resolving report:', err);
    } finally {
      setSavingResolve(false);
    }
  };

  // Confirm Delete
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
      if (type === 'topic') {
        await deleteAdminReasoningTopicRequest(item._id);
        await fetchTopics();
      } else if (type === 'question') {
        await deleteAdminReasoningQuestionRequest(item._id);
        await fetchQuestions(qPage);
      } else if (type === 'note') {
        await deleteAdminReasoningNoteRequest(item._id);
        await fetchNotes();
      } else if (type === 'report') {
        await deleteAdminReasoningReportRequest(item._id);
        await fetchReports();
      }
      setDeleteConfirm({ isOpen: false, type: '', item: null, loading: false });
      fetchDashboard();
    } catch (err) {
      console.error('Delete error:', err);
      setDeleteConfirm(prev => ({ ...prev, loading: false }));
      alert(err.response?.data?.message || 'Error deleting item');
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

  const getSelectedChoice = (q) => {
    if (!q || !q.options || !q.correctAnswer) return 'A';
    const idx = q.options.indexOf(q.correctAnswer);
    return idx === 1 ? 'B' : idx === 2 ? 'C' : idx === 3 ? 'D' : 'A';
  };

  const metrics = dashboardData?.metrics || {
    totalTopics: 15,
    activeTopics: 15,
    totalNotes: 15,
    totalQuestions: 0,
    publishedQuestions: 0,
    draftQuestions: 0,
    totalStudentsPracticing: 0,
    totalAttempts: 0,
    averageAccuracy: 0,
    pendingReports: 0
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title="Reasoning Prep Governance"
        subtitle="Govern reasoning curriculum modules, question banks, rich concept guides, and audit student issue reports."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Reasoning Governance' }
        ]}
        actions={
          activeTab === 'topics' ? (
            <button
              type="button"
              onClick={() => setTopicModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Topic</span>
            </button>
          ) : activeTab === 'questions' ? (
            <button
              type="button"
              onClick={() => setQuestionModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          ) : activeTab === 'notes' ? (
            <button
              type="button"
              onClick={() => setNoteModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Study Guide</span>
            </button>
          ) : null
        }
      />

      {/* Tabs */}
      <div className="card p-2 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="tab-list flex-wrap">
          {[
            { id: 'dashboard', label: 'Analytics & Hub' },
            { id: 'topics', label: `Topics (${metrics.totalTopics})` },
            { id: 'questions', label: `Question Bank (${metrics.totalQuestions})` },
            { id: 'notes', label: `Study Guides (${metrics.totalNotes})` },
            { id: 'reports', label: `Reports (${metrics.pendingReports})` }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={activeTab === t.id ? 'tab-item-active' : 'tab-item'}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="badge-primary">Reasoning Suite Active</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DASHBOARD & ANALYTICS */}
      {/* ===================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loadingDashboard ? (
            <LoadingState variant="page" />
          ) : dashboardError ? (
            <div className="card p-6">
              <ErrorState message={dashboardError} onRetry={fetchDashboard} />
            </div>
          ) : (
            <>
              {/* Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="card p-5 card-hover">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Reasoning Topics
                  </span>
                  <strong className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 block">
                    {metrics.totalTopics}
                  </strong>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                    {metrics.activeTopics} Active Modules
                  </span>
                </div>

                <div className="card p-5 card-hover">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Question Bank
                  </span>
                  <strong className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {metrics.totalQuestions}
                  </strong>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {metrics.publishedQuestions} Published &bull; {metrics.draftQuestions} Draft
                  </span>
                </div>

                <div className="card p-5 card-hover">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Active Learners
                  </span>
                  <strong className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 block">
                    {metrics.totalStudentsPracticing}
                  </strong>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">
                    {metrics.totalAttempts} Assessment Logs
                  </span>
                </div>

                <div className="card p-5 card-hover">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                    Average Accuracy
                  </span>
                  <strong className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {metrics.averageAccuracy}%
                  </strong>
                  <span className="text-xs text-gray-400 mt-1 block">
                    Across All Candidates
                  </span>
                </div>
              </div>

              {/* Curriculum Matrix Table */}
              <div className="card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Reasoning Curriculum Matrix
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Overview of topics, question densities, and study guides.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('topics'); setTopicModal({}); }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Topic Name
                        </th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Question Density
                        </th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Study Guide
                        </th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      {dashboardData?.topics?.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">
                            {t.name}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={getDifficultyBadgeClass(t.difficulty)}>
                              {t.difficulty || 'Medium'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-300">
                            {t.questionCount || 0} Questions
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {t.hasNotes ? (
                              <span className="badge-success">
                                Active Guide
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">No Guide</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className={t.status === 'active' ? 'badge-success' : 'badge-neutral'}>
                              {t.status || 'active'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => { setActiveTab('topics'); setTopicModal(t); }}
                              className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                              title="Edit Topic"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TOPIC MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Reasoning Curriculum Topics ({topics.length})
            </h3>
            <button
              type="button"
              onClick={() => setTopicModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Topic</span>
            </button>
          </div>

          {loadingTopics ? (
            <LoadingState variant="page" />
          ) : topics.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiLayers}
                title="No Topics Configured"
                description="Create reasoning curriculum topics to start building question pools."
                action={
                  <button
                    type="button"
                    onClick={() => setTopicModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Topic</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(topic => (
                <div
                  key={topic._id}
                  className="card p-5 flex flex-col justify-between space-y-4 card-hover"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-primary text-[10px]">
                        Order: {topic.displayOrder || 0}
                      </span>
                      <span className={topic.status === 'active' ? 'badge-success' : 'badge-neutral'}>
                        {topic.status || 'active'}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                      {topic.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {topic.description || 'Reasoning prep study topic.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-500 dark:text-gray-400">
                      {topic.questionCount || 0} Questions
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTopicModal(topic)}
                        className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                        title="Edit Topic"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => promptDelete('topic', topic)}
                        className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                        title="Delete Topic"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: QUESTION BANK MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Controls Ribbon */}
          <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Topic:</span>
                <select
                  value={qTopic}
                  onChange={(e) => { setQTopic(e.target.value); setQPage(1); }}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  <option value="All">All Topics</option>
                  {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Difficulty:</span>
                <select
                  value={qDiff}
                  onChange={(e) => { setQDiff(e.target.value); setQPage(1); }}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SearchBar
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  placeholder="Search questions..."
                />
              </div>
              <button
                type="button"
                onClick={() => setQuestionModal({})}
                className="btn-primary shrink-0"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Questions Table */}
          {loadingQuestions ? (
            <LoadingState variant="table" rows={6} />
          ) : questions.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiHelpCircle}
                title="No Reasoning Questions Found"
                description={
                  qSearch || qTopic !== 'All' || qDiff !== 'All'
                    ? 'No questions match the selected filters. Try clearing your search.'
                    : 'Start by creating reasoning questions for students to practice.'
                }
                action={
                  <button
                    type="button"
                    onClick={() => setQuestionModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Question</span>
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
                        Topic
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Correct Answer
                      </th>
                      <th scope="col" className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
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
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
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
                          <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/50 truncate max-w-full">
                            <FiCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{q.correctAnswer}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={q.status === 'published' ? 'badge-success' : 'badge-warning'}>
                            {q.status || 'published'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(q._id)}
                              className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                              title="Duplicate as Draft"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuestionModal(q)}
                              className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                              title="Edit Question"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDelete('question', q)}
                              className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                              title="Delete Question"
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
              {qTotalPages > 1 && (
                <div className="px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{qPage}</span> of{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{qTotalPages}</span> ({qTotal} questions)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQPage(p => Math.max(1, p - 1))}
                      disabled={qPage === 1}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQPage(p => Math.min(qTotalPages, p + 1))}
                      disabled={qPage === qTotalPages}
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
      {/* TAB 4: STUDY GUIDES & NOTES */}
      {/* ===================================================================== */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Reasoning Concept Guides ({notes.length})
            </h3>
            <button
              type="button"
              onClick={() => setNoteModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Study Guide</span>
            </button>
          </div>

          {loadingNotes ? (
            <LoadingState variant="page" />
          ) : notes.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiBookOpen}
                title="No Concept Guides Found"
                description="Add reasoning concepts, quick tricks, and rule references for students."
                action={
                  <button
                    type="button"
                    onClick={() => setNoteModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Study Guide</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(n => (
                <div
                  key={n._id}
                  className="card p-5 flex flex-col justify-between space-y-3 card-hover"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="badge-primary font-semibold">{n.topic}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNoteModal(n)}
                          className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                          title="Edit Guide"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete('note', n)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                          title="Delete Guide"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {n.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-3 leading-relaxed">
                      {n.introduction}
                    </p>
                  </div>

                  {n.rules && n.rules.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">{n.rules.length} Rules / Formulas</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: STUDENT REPORTS & AUDIT */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Reported Question Issues ({reports.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Questions flagged by students for answer verification or typos.
              </p>
            </div>
          </div>

          {loadingReports ? (
            <LoadingState variant="list" rows={4} />
          ) : reports.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiCheckCircle}
                title="All Clear — No Open Reports"
                description="Students have not reported any open defects or question ambiguities."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(rep => (
                <div
                  key={rep._id}
                  className="card p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 card-hover"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge-danger font-semibold">
                        {rep.reason || 'Incorrect Answer'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Reported by <strong className="text-gray-800 dark:text-gray-200">{rep.userId?.name || 'Student'}</strong> ({rep.userId?.email || 'N/A'})
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Target Question: {rep.questionId?.questionText || 'Question removed'}
                    </h4>
                    {rep.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        "{rep.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setResolveModal(rep)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Resolve Issue
                    </button>
                    <button
                      type="button"
                      onClick={() => promptDelete('report', rep)}
                      className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                      title="Delete Report Record"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: TOPIC CREATE / EDIT */}
      {/* ===================================================================== */}
      {topicModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {topicModal._id ? `Edit Topic: ${topicModal.name}` : 'Create Reasoning Topic'}
              </h3>
              <button
                type="button"
                onClick={() => setTopicModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Topic Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={topicModal.name || ''}
                    placeholder="e.g. Syllogism, Blood Relations"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={topicModal.slug || ''}
                    placeholder="auto-generated if empty"
                    className="input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={topicModal.description || ''}
                  placeholder="Topic summary and scope..."
                  className="input"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={topicModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    defaultValue={topicModal.displayOrder || 0}
                    className="input font-mono"
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select
                    name="status"
                    defaultValue={topicModal.status || 'active'}
                    className="input font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTopicModal(null)}
                  disabled={savingTopic}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTopic}
                  className="btn-primary"
                >
                  {savingTopic ? 'Saving...' : 'Save Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: QUESTION CREATE / EDIT */}
      {/* ===================================================================== */}
      {questionModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {questionModal._id ? 'Edit Reasoning Question' : 'Create Reasoning Question'}
              </h3>
              <button
                type="button"
                onClick={() => setQuestionModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Reasoning Topic</label>
                  <select
                    name="category"
                    defaultValue={questionModal.category || questionModal.topic || topics[0]?.name || 'Logical Reasoning'}
                    className="input font-medium"
                  >
                    {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={questionModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Question Statement</label>
                <textarea
                  name="questionText"
                  rows={3}
                  defaultValue={questionModal.questionText || ''}
                  required
                  placeholder="Enter reasoning problem statement..."
                  className="input font-medium"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Option A</label>
                  <input
                    type="text"
                    name="optionA"
                    defaultValue={questionModal.options?.[0] || ''}
                    required
                    placeholder="Enter Option A"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Option B</label>
                  <input
                    type="text"
                    name="optionB"
                    defaultValue={questionModal.options?.[1] || ''}
                    required
                    placeholder="Enter Option B"
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

              <div>
                <label className="input-label">Detailed Solution / Logic Explanation</label>
                <textarea
                  name="explanation"
                  rows={3}
                  defaultValue={questionModal.explanation || ''}
                  placeholder="Explain the logical deductions and steps to arrive at the solution..."
                  className="input"
                />
              </div>

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
                  {savingQuestion ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: STUDY GUIDE CREATE / EDIT */}
      {/* ===================================================================== */}
      {noteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {noteModal._id ? `Edit Guide: ${noteModal.title || noteModal.topic}` : 'Add Reasoning Study Guide'}
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
                <label className="input-label">Reasoning Topic</label>
                <select
                  name="topic"
                  defaultValue={noteModal.topic || topics[0]?.name || 'Logical Reasoning'}
                  className="input font-medium"
                >
                  {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="input-label">Guide Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={noteModal.title || ''}
                  required
                  placeholder="e.g. Master Guide: Syllogisms & Venn Logic"
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Introduction / Core Concept</label>
                <textarea
                  name="introduction"
                  rows={3}
                  defaultValue={noteModal.introduction || ''}
                  required
                  placeholder="Introduce the reasoning pattern and problem structure..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Rules / Principles (1 per line)</label>
                <textarea
                  name="rules"
                  rows={3}
                  defaultValue={noteModal.rules?.join('\n') || ''}
                  placeholder="Rule 1: If all A are B and all B are C...&#10;Rule 2: Negative conclusions require negative premises"
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
      {/* MODAL: REPORT RESOLUTION */}
      {/* ===================================================================== */}
      {resolveModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Resolve Question Report
              </h3>
              <button
                type="button"
                onClick={() => setResolveModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveReport} className="space-y-4">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Issue Reason: <strong className="text-rose-600 dark:text-rose-400">{resolveModal.reason}</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  "{resolveModal.questionId?.questionText || 'Target Question'}"
                </p>
              </div>

              <div>
                <label className="input-label">Resolution Status</label>
                <select
                  name="status"
                  defaultValue="resolved"
                  className="input font-semibold"
                >
                  <option value="resolved">Resolved (Fix Applied)</option>
                  <option value="rejected">Rejected (Not a Bug / Verified Correct)</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="input-label">Admin Audit Notes</label>
                <textarea
                  name="adminNotes"
                  rows={3}
                  placeholder="Describe corrective actions taken or rationale..."
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResolveModal(null)}
                  disabled={savingResolve}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingResolve}
                  className="btn-primary"
                >
                  {savingResolve ? 'Saving Resolution...' : 'Complete Resolution'}
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
        title={`Delete ${deleteConfirm.type === 'topic' ? 'Topic' : deleteConfirm.type === 'question' ? 'Question' : deleteConfirm.type === 'note' ? 'Study Guide' : 'Report Record'}`}
        message="Are you sure you want to proceed with deletion? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </AdminLayout>
  );
};

export default AdminReasoning;
