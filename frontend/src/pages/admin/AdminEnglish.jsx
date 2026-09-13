import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getAdminEnglishDashboardRequest,
  getAdminEnglishTopicsRequest,
  createAdminEnglishTopicRequest,
  updateAdminEnglishTopicRequest,
  deleteAdminEnglishTopicRequest,
  getAdminEnglishQuestionsRequest,
  createAdminEnglishQuestionRequest,
  updateAdminEnglishQuestionRequest,
  deleteAdminEnglishQuestionRequest,
  duplicateAdminEnglishQuestionRequest,
  getAdminEnglishNotesRequest,
  createAdminEnglishNoteRequest,
  updateAdminEnglishNoteRequest,
  deleteAdminEnglishNoteRequest,
  getAdminEnglishVocabularyRequest,
  createAdminEnglishVocabularyRequest,
  updateAdminEnglishVocabularyRequest,
  deleteAdminEnglishVocabularyRequest,
  getAdminEnglishPassagesRequest,
  createAdminEnglishPassageRequest,
  updateAdminEnglishPassageRequest,
  deleteAdminEnglishPassageRequest,
  getAdminEnglishReportsRequest,
  resolveAdminEnglishReportRequest,
  deleteAdminEnglishReportRequest
} from '../../api/english';
import {
  FiBookOpen,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCopy,
  FiCheckCircle,
  FiFeather,
  FiLayers,
  FiFlag,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiFileText,
  FiHelpCircle
} from 'react-icons/fi';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const QUESTION_TYPES = [
  { value: 'All', label: 'All Question Types' },
  { value: 'mcq', label: 'Standard MCQ' },
  { value: 'para_jumble', label: 'Para Jumble' },
  { value: 'error_detection', label: 'Error Detection' },
  { value: 'sentence_correction', label: 'Sentence Correction' }
];

const AdminEnglish = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, topics, questions, vocabulary, passages, notes, reports

  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Topics state
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicModal, setTopicModal] = useState(null);
  const [savingTopic, setSavingTopic] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [qTopic, setQTopic] = useState('All');
  const [qDiff, setQDiff] = useState('All');
  const [qType, setQType] = useState('All');
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

  // Vocabulary state
  const [vocabList, setVocabList] = useState([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [vSearch, setVSearch] = useState('');
  const [vPage, setVPage] = useState(1);
  const [vTotalPages, setVTotalPages] = useState(1);
  const [vTotal, setVTotal] = useState(0);
  const [vocabModal, setVocabModal] = useState(null);
  const [savingVocab, setSavingVocab] = useState(false);

  // Passages state
  const [passages, setPassages] = useState([]);
  const [loadingPassages, setLoadingPassages] = useState(false);
  const [passageModal, setPassageModal] = useState(null);
  const [savingPassage, setSavingPassage] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [resolveModal, setResolveModal] = useState(null);
  const [savingResolve, setSavingResolve] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: '', // 'topic' | 'question' | 'vocab' | 'passage' | 'note' | 'report'
    item: null,
    loading: false
  });

  // Fetch Dashboard
  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const res = await getAdminEnglishDashboardRequest();
      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        setDashboardError(res.data.message || 'Failed to fetch dashboard');
      }
    } catch (err) {
      console.error('Error fetching admin English dashboard:', err);
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
      const res = await getAdminEnglishTopicsRequest();
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
      if (qType !== 'All') params.questionType = qType;
      if (qSearch.trim()) params.search = qSearch.trim();

      const res = await getAdminEnglishQuestionsRequest(params);
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
  }, [activeTab, qPage, qTopic, qDiff, qType]);

  // Fetch Notes
  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await getAdminEnglishNotesRequest();
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

  // Fetch Vocabulary
  const fetchVocab = async (page = vPage) => {
    setLoadingVocab(true);
    try {
      const params = { page, limit: 15 };
      if (vSearch.trim()) params.search = vSearch.trim();
      const res = await getAdminEnglishVocabularyRequest(params);
      if (res.data.success) {
        setVocabList(res.data.data || []);
        setVTotal(res.data.total || 0);
        setVTotalPages(res.data.pages || 1);
        setVPage(res.data.page || page);
      }
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
    } finally {
      setLoadingVocab(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vocabulary') fetchVocab(vPage);
  }, [activeTab, vPage]);

  // Fetch Passages
  const fetchPassages = async () => {
    setLoadingPassages(true);
    try {
      const res = await getAdminEnglishPassagesRequest();
      if (res.data.success) setPassages(res.data.data || []);
    } catch (err) {
      console.error('Error fetching passages:', err);
    } finally {
      setLoadingPassages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'passages') fetchPassages();
  }, [activeTab]);

  // Fetch Reports
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await getAdminEnglishReportsRequest();
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

  // Topic Handlers
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    setSavingTopic(true);
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      difficulty: formData.get('difficulty'),
      estimatedStudyTime: formData.get('estimatedStudyTime') || '30 mins',
      status: formData.get('status') || 'active',
      displayOrder: Number(formData.get('displayOrder')) || 0
    };

    try {
      if (topicModal._id) {
        await updateAdminEnglishTopicRequest(topicModal._id, payload);
      } else {
        await createAdminEnglishTopicRequest(payload);
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

  // Question Handlers
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
      category: formData.get('category'),
      topic: formData.get('category'),
      questionText: formData.get('questionText'),
      options: optionsRaw,
      correctAnswer,
      difficulty: formData.get('difficulty') || 'Medium',
      questionType: formData.get('questionType') || 'mcq',
      marks: Number(formData.get('marks')) || 1,
      negativeMarks: Number(formData.get('negativeMarks')) !== undefined ? Number(formData.get('negativeMarks')) : 0.25,
      explanation: formData.get('explanation') || '',
      rule: formData.get('rule') || '',
      status: formData.get('status') || 'published'
    };

    try {
      if (questionModal._id) {
        await updateAdminEnglishQuestionRequest(questionModal._id, payload);
      } else {
        await createAdminEnglishQuestionRequest(payload);
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
      await duplicateAdminEnglishQuestionRequest(id);
      await fetchQuestions(qPage);
      fetchDashboard();
    } catch (err) {
      console.error('Error duplicating question:', err);
    }
  };

  // Vocabulary Handlers
  const handleSaveVocab = async (e) => {
    e.preventDefault();
    setSavingVocab(true);
    const formData = new FormData(e.target);
    const payload = {
      word: formData.get('word'),
      meaning: formData.get('meaning'),
      partOfSpeech: formData.get('partOfSpeech') || 'noun',
      synonyms: formData.get('synonyms') ? formData.get('synonyms').split(',').map(s => s.trim()).filter(Boolean) : [],
      antonyms: formData.get('antonyms') ? formData.get('antonyms').split(',').map(a => a.trim()).filter(Boolean) : [],
      exampleSentence: formData.get('exampleSentence') || '',
      usage: formData.get('usage') || '',
      difficulty: formData.get('difficulty') || 'Medium',
      status: formData.get('status') || 'published'
    };

    try {
      if (vocabModal._id) {
        await updateAdminEnglishVocabularyRequest(vocabModal._id, payload);
      } else {
        await createAdminEnglishVocabularyRequest(payload);
      }
      setVocabModal(null);
      await fetchVocab(vPage);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving vocabulary word');
    } finally {
      setSavingVocab(false);
    }
  };

  // Passage Handlers
  const handleSavePassage = async (e) => {
    e.preventDefault();
    setSavingPassage(true);
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      passageText: formData.get('passageText'),
      difficulty: formData.get('difficulty') || 'Medium',
      status: formData.get('status') || 'published'
    };

    try {
      if (passageModal._id) {
        await updateAdminEnglishPassageRequest(passageModal._id, payload);
      } else {
        await createAdminEnglishPassageRequest(payload);
      }
      setPassageModal(null);
      await fetchPassages();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving passage');
    } finally {
      setSavingPassage(false);
    }
  };

  // Note Handlers
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
        await updateAdminEnglishNoteRequest(noteModal._id, payload);
      } else {
        await createAdminEnglishNoteRequest(payload);
      }
      setNoteModal(null);
      await fetchNotes();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving study guide');
    } finally {
      setSavingNote(false);
    }
  };

  // Report Handlers
  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!resolveModal) return;
    setSavingResolve(true);
    const formData = new FormData(e.target);
    try {
      await resolveAdminEnglishReportRequest(resolveModal._id, {
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

  // Confirm Delete Handler
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
        await deleteAdminEnglishTopicRequest(item._id);
        await fetchTopics();
      } else if (type === 'question') {
        await deleteAdminEnglishQuestionRequest(item._id);
        await fetchQuestions(qPage);
      } else if (type === 'vocab') {
        await deleteAdminEnglishVocabularyRequest(item._id);
        await fetchVocab(vPage);
      } else if (type === 'passage') {
        await deleteAdminEnglishPassageRequest(item._id);
        await fetchPassages();
      } else if (type === 'note') {
        await deleteAdminEnglishNoteRequest(item._id);
        await fetchNotes();
      } else if (type === 'report') {
        await deleteAdminEnglishReportRequest(item._id);
        await fetchReports();
      }
      setDeleteConfirm({ isOpen: false, type: '', item: null, loading: false });
      fetchDashboard();
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

  const getSelectedChoice = (q) => {
    if (!q || !q.options || !q.correctAnswer) return 'A';
    const idx = q.options.indexOf(q.correctAnswer);
    return idx === 1 ? 'B' : idx === 2 ? 'C' : idx === 3 ? 'D' : 'A';
  };

  const metrics = dashboardData?.metrics || {
    totalTopics: 20,
    activeTopics: 20,
    totalNotes: 20,
    totalQuestions: 0,
    publishedQuestions: 0,
    draftQuestions: 0,
    totalVocab: 0,
    totalPassages: 0,
    totalAttempts: 0,
    averageAccuracy: 0,
    pendingReports: 0
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <PageHeader
        title="English Prep Governance"
        subtitle="Govern topics, verbal question bank, vocabulary repository, RC passages, and audit student issue reports."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'English Governance' }
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
          ) : activeTab === 'vocabulary' ? (
            <button
              type="button"
              onClick={() => setVocabModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Word</span>
            </button>
          ) : activeTab === 'passages' ? (
            <button
              type="button"
              onClick={() => setPassageModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Passage</span>
            </button>
          ) : activeTab === 'notes' ? (
            <button
              type="button"
              onClick={() => setNoteModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Guide</span>
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
            { id: 'vocabulary', label: `Vocab (${metrics.totalVocab})` },
            { id: 'passages', label: `RC Passages (${metrics.totalPassages})` },
            { id: 'notes', label: `Guides (${metrics.totalNotes})` },
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
          <span className="badge-primary">Verbal Suite Active</span>
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
                    Verbal Modules
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
                    Vocabulary Repository
                  </span>
                  <strong className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 block">
                    {metrics.totalVocab}
                  </strong>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 block">
                    {metrics.totalPassages} Reading Passages
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
                    {metrics.totalAttempts} Assessment Attempts
                  </span>
                </div>
              </div>

              {/* Verbal Curriculum Matrix Table */}
              <div className="card overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Verbal Ability Curriculum Matrix
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Grammar, vocabulary, and reading comprehension syllabus coverage.
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
                              <span className="badge-success">Active Guide</span>
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
              English Verbal Topics ({topics.length})
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
                title="No English Topics Configured"
                description="Create grammar and verbal modules to start adding practice questions."
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
                      {topic.description || 'English grammar & verbal module.'}
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
      {/* TAB 3: QUESTION BANK */}
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

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type:</span>
                <select
                  value={qType}
                  onChange={(e) => { setQType(e.target.value); setQPage(1); }}
                  className="input py-1.5 px-3 text-xs w-auto font-medium"
                >
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-full md:w-64">
                <SearchBar
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  placeholder="Search verbal questions..."
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

          {/* Table */}
          {loadingQuestions ? (
            <LoadingState variant="table" rows={6} />
          ) : questions.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiHelpCircle}
                title="No English Questions Found"
                description={
                  qSearch || qTopic !== 'All' || qDiff !== 'All' || qType !== 'All'
                    ? 'No questions match the current filters. Try changing or clearing your search.'
                    : 'Get started by creating verbal questions for the English question bank.'
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
                        Type
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
                          {q.rule && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                              Rule: {q.rule}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="badge-neutral font-medium">
                            {q.category || q.topic || 'Grammar'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap capitalize font-mono text-xs text-gray-500 dark:text-gray-400">
                          {q.questionType?.replace('_', ' ') || 'MCQ'}
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
      {/* TAB 4: VOCABULARY MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-6">
          <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Words: <span className="badge-primary font-semibold">{vTotal} Entries</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <SearchBar
                  value={vSearch}
                  onChange={(e) => setVSearch(e.target.value)}
                  placeholder="Search words or meanings..."
                />
              </div>
              <button
                type="button"
                onClick={() => setVocabModal({})}
                className="btn-primary shrink-0"
              >
                <FiPlus className="w-4 h-4" />
                <span>New Word</span>
              </button>
            </div>
          </div>

          {loadingVocab ? (
            <LoadingState variant="page" />
          ) : vocabList.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiFeather}
                title="No Vocabulary Words Found"
                description={
                  vSearch
                    ? 'No words match your search term. Try searching another root or definition.'
                    : 'Build the vocabulary repository by adding high-frequency placement words.'
                }
                action={
                  <button
                    type="button"
                    onClick={() => setVocabModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Word</span>
                  </button>
                }
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocabList.map(v => (
                  <div
                    key={v._id}
                    className="card p-5 flex flex-col justify-between space-y-3 card-hover"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="badge-primary text-[10px] uppercase font-mono font-semibold">
                          {v.partOfSpeech || 'noun'} &bull; {v.difficulty || 'Medium'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setVocabModal(v)}
                            className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                            title="Edit Word"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete('vocab', v)}
                            className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                            title="Delete Word"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                        {v.word}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                        {v.meaning}
                      </p>

                      {v.synonyms && v.synonyms.length > 0 && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                          <strong className="text-gray-700 dark:text-gray-300">Synonyms:</strong> {v.synonyms.join(', ')}
                        </p>
                      )}

                      {v.exampleSentence && (
                        <p className="text-[11px] text-gray-400 italic mt-1.5 line-clamp-2">
                          "{v.exampleSentence}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {vTotalPages > 1 && (
                <div className="card p-3.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    Showing page <span className="font-semibold text-gray-700 dark:text-gray-200">{vPage}</span> of{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{vTotalPages}</span> ({vTotal} words)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVPage(p => Math.max(1, p - 1))}
                      disabled={vPage === 1}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <FiChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVPage(p => Math.min(vTotalPages, p + 1))}
                      disabled={vPage === vTotalPages}
                      className="btn-secondary px-2.5 py-1.5 text-xs disabled:opacity-40"
                    >
                      <span>Next</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: READING COMPREHENSION PASSAGES */}
      {/* ===================================================================== */}
      {activeTab === 'passages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Reading Comprehension Passages ({passages.length})
            </h3>
            <button
              type="button"
              onClick={() => setPassageModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Passage</span>
            </button>
          </div>

          {loadingPassages ? (
            <LoadingState variant="page" />
          ) : passages.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiFileText}
                title="No Reading Passages Configured"
                description="Upload reading comprehension passages and attach sub-questions for students."
                action={
                  <button
                    type="button"
                    onClick={() => setPassageModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Passage</span>
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passages.map(p => (
                <div
                  key={p._id}
                  className="card p-5 flex flex-col justify-between space-y-3 card-hover"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-primary font-semibold truncate max-w-[200px]">
                        {p.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={getDifficultyBadgeClass(p.difficulty)}>
                          {p.difficulty || 'Medium'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPassageModal(p)}
                          className="btn-ghost p-1.5 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                          title="Edit Passage"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete('passage', p)}
                          className="btn-ghost p-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-lg"
                          title="Delete Passage"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
                      {p.passageText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-mono">
                    <span>{p.wordCount || p.passageText?.split(/\s+/).length || 300} words</span>
                    <span>{p.questions?.length || 0} Sub-Questions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: STUDY GUIDES & NOTES */}
      {/* ===================================================================== */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              English Study Guides & Grammar Rules ({notes.length})
            </h3>
            <button
              type="button"
              onClick={() => setNoteModal({})}
              className="btn-primary"
            >
              <FiPlus className="w-4 h-4" />
              <span>New Guide</span>
            </button>
          </div>

          {loadingNotes ? (
            <LoadingState variant="page" />
          ) : notes.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiBookOpen}
                title="No English Study Guides"
                description="Add grammar rules, idiomatic expressions, and verbal ability references."
                action={
                  <button
                    type="button"
                    onClick={() => setNoteModal({})}
                    className="btn-primary"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Create Guide</span>
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
                      <span className="font-semibold">{n.rules.length} Grammar Rules Defined</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: REPORTS AUDIT */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Reported English Issues ({reports.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Questions flagged by students for grammar discrepancies or typos.
              </p>
            </div>
          </div>

          {loadingReports ? (
            <LoadingState variant="list" rows={4} />
          ) : reports.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                icon={FiCheckCircle}
                title="All Clear — No Open English Reports"
                description="Students have not reported any unresolved question issues in the verbal suite."
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
                      Target: {rep.questionId?.questionText || 'Question removed'}
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
                {topicModal._id ? `Edit Topic: ${topicModal.name}` : 'Create English Topic'}
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
                    placeholder="e.g. Subject-Verb Agreement"
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Slug</label>
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
                  placeholder="Topic summary and grammar rules overview..."
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
                {questionModal._id ? 'Edit English Question' : 'Create English Question'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="input-label">English Topic</label>
                  <select
                    name="category"
                    defaultValue={questionModal.category || questionModal.topic || topics[0]?.name || 'Grammar'}
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
                <div>
                  <label className="input-label">Question Type</label>
                  <select
                    name="questionType"
                    defaultValue={questionModal.questionType || 'mcq'}
                    className="input font-semibold"
                  >
                    <option value="mcq">Standard MCQ</option>
                    <option value="para_jumble">Para Jumble</option>
                    <option value="error_detection">Error Detection</option>
                    <option value="sentence_correction">Sentence Correction</option>
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
                  placeholder="Enter problem statement or sentence for correction..."
                  className="input font-medium"
                />
              </div>

              {/* 2x2 Options Grid */}
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

              {/* Correct Choice, Marks, Negative Marks */}
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
                <label className="input-label">Detailed Solution / Grammatical Explanation</label>
                <textarea
                  name="explanation"
                  rows={2}
                  defaultValue={questionModal.explanation || ''}
                  placeholder="Explain the grammatical rule and why other options are invalid..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Grammar / Structure Rule Reference</label>
                <input
                  type="text"
                  name="rule"
                  defaultValue={questionModal.rule || ''}
                  placeholder="e.g. Rule of Proximity with correlative conjunctions"
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
      {/* MODAL: VOCABULARY CREATE / EDIT */}
      {/* ===================================================================== */}
      {vocabModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {vocabModal._id ? `Edit Word: ${vocabModal.word}` : 'Add Vocabulary Word'}
              </h3>
              <button
                type="button"
                onClick={() => setVocabModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVocab} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Word</label>
                  <input
                    type="text"
                    name="word"
                    defaultValue={vocabModal.word || ''}
                    required
                    placeholder="e.g. Ephemeral"
                    className="input capitalize"
                  />
                </div>
                <div>
                  <label className="input-label">Part of Speech</label>
                  <select
                    name="partOfSpeech"
                    defaultValue={vocabModal.partOfSpeech || 'noun'}
                    className="input font-semibold"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="idiom">Idiom</option>
                    <option value="phrase">Phrase</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Meaning / Definition</label>
                <input
                  type="text"
                  name="meaning"
                  defaultValue={vocabModal.meaning || ''}
                  required
                  placeholder="Brief and precise definition..."
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Synonyms (comma-separated)</label>
                  <input
                    type="text"
                    name="synonyms"
                    defaultValue={vocabModal.synonyms?.join(', ') || ''}
                    placeholder="e.g. transient, fleeting"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Antonyms (comma-separated)</label>
                  <input
                    type="text"
                    name="antonyms"
                    defaultValue={vocabModal.antonyms?.join(', ') || ''}
                    placeholder="e.g. permanent, eternal"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Example Sentence</label>
                <input
                  type="text"
                  name="exampleSentence"
                  defaultValue={vocabModal.exampleSentence || ''}
                  placeholder="Sentence demonstrating proper grammatical context..."
                  className="input"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVocabModal(null)}
                  disabled={savingVocab}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVocab}
                  className="btn-primary"
                >
                  {savingVocab ? 'Saving...' : 'Save Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: PASSAGE CREATE / EDIT */}
      {/* ===================================================================== */}
      {passageModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {passageModal._id ? 'Edit Reading Passage' : 'Create Reading Passage'}
              </h3>
              <button
                type="button"
                onClick={() => setPassageModal(null)}
                className="btn-ghost p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Passage Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={passageModal.title || ''}
                    required
                    placeholder="e.g. The Philosophy of Artificial Intelligence"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Difficulty</label>
                  <select
                    name="difficulty"
                    defaultValue={passageModal.difficulty || 'Medium'}
                    className="input font-semibold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Passage Text</label>
                <textarea
                  name="passageText"
                  rows={8}
                  defaultValue={passageModal.passageText || ''}
                  required
                  placeholder="Paste or write the complete reading comprehension passage here..."
                  className="input leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPassageModal(null)}
                  disabled={savingPassage}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassage}
                  className="btn-primary"
                >
                  {savingPassage ? 'Saving...' : 'Save Passage'}
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
                {noteModal._id ? `Edit Guide: ${noteModal.title || noteModal.topic}` : 'Add English Study Guide'}
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
                <label className="input-label">English Topic</label>
                <select
                  name="topic"
                  defaultValue={noteModal.topic || topics[0]?.name || 'Grammar'}
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
                  placeholder="e.g. Master Guide: Tenses & Conditional Clauses"
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
                  placeholder="Introduce the grammatical rules and usage context..."
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Rules / Principles (1 per line)</label>
                <textarea
                  name="rules"
                  rows={3}
                  defaultValue={noteModal.rules?.join('\n') || ''}
                  placeholder="Rule 1: Present perfect connects past actions to current relevance&#10;Rule 2: Avoid dangling modifiers in passive sentences"
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
                Resolve English Question Report
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
                  Report Reason: <strong className="text-rose-600 dark:text-rose-400">{resolveModal.reason}</strong>
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
                  <option value="resolved">Resolved (Correction Applied)</option>
                  <option value="rejected">Rejected (Verified Grammatically Correct)</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="input-label">Admin Audit Notes</label>
                <textarea
                  name="adminNotes"
                  rows={3}
                  placeholder="Describe corrective grammar fixes applied or reference justifications..."
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
        title={`Delete ${deleteConfirm.type === 'topic' ? 'Topic' : deleteConfirm.type === 'question' ? 'Question' : deleteConfirm.type === 'vocab' ? 'Vocabulary Word' : deleteConfirm.type === 'passage' ? 'Passage' : deleteConfirm.type === 'note' ? 'Study Guide' : 'Report Record'}`}
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </AdminLayout>
  );
};

export default AdminEnglish;
