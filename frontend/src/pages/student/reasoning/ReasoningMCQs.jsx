import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentReasoningQuestionsRequest,
  getStudentReasoningTopicsRequest,
  submitStudentReasoningAttemptRequest,
  toggleStudentReasoningBookmarkRequest,
  reportStudentReasoningQuestionRequest
} from '../../../api/reasoning';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiBookmark,
  FiFlag,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiZap,
  FiRefreshCw
} from 'react-icons/fi';

const ReasoningMCQs = () => {
  const { topicId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(
    topicId
      ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'All'
  );
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Practice state tracking: questionId -> { selectedOption, isSubmitted, isCorrect, correctAnswer, explanation }
  const [attemptState, setAttemptState] = useState({});
  const [bookmarkState, setBookmarkState] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Reporting modal
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('Wrong Answer');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load active topics list for filter
  useEffect(() => {
    getStudentReasoningTopicsRequest().then(res => {
      if (res.data.success) {
        setTopics(res.data.data);
        if (topicId) {
          const match = res.data.data.find(t => t.slug === topicId);
          if (match) setSelectedTopic(match.name);
        }
      }
    }).catch(() => {});
  }, [topicId]);

  // Load questions
  const fetchQuestions = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: 10 };
      if (selectedTopic !== 'All') params.topic = selectedTopic;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (search) params.search = search;

      const res = await getStudentReasoningQuestionsRequest(params);
      if (res.data.success) {
        setQuestions(res.data.data || []);
        setTotalQuestions(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || currentPage);

        // Update bookmarks state
        const bMap = {};
        (res.data.data || []).forEach(q => {
          if (q.isBookmarked) bMap[q._id] = true;
        });
        setBookmarkState(prev => ({ ...prev, ...bMap }));
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Unable to load practice questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [page, selectedTopic, difficulty]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchClear = () => {
    setSearch('');
    setPage(1);
    fetchQuestions(1);
  };

  const handleSelectOption = (qId, option) => {
    if (attemptState[qId]?.isSubmitted) return;
    setAttemptState(prev => ({
      ...prev,
      [qId]: { ...prev[qId], selectedOption: option }
    }));
  };

  const handleCheckAnswer = async (qId) => {
    const selectedOption = attemptState[qId]?.selectedOption;
    if (!selectedOption) return;

    setSubmittingId(qId);
    try {
      const res = await submitStudentReasoningAttemptRequest({
        questionId: qId,
        selectedOption
      });
      if (res.data.success) {
        setAttemptState(prev => ({
          ...prev,
          [qId]: {
            selectedOption,
            isSubmitted: true,
            isCorrect: res.data.data.isCorrect,
            correctAnswer: res.data.data.correctAnswer,
            explanation: res.data.data.explanation
          }
        }));
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleToggleBookmark = async (qId) => {
    try {
      const res = await toggleStudentReasoningBookmarkRequest({
        itemId: qId,
        itemType: 'Question'
      });
      if (res.data.success) {
        setBookmarkState(prev => ({ ...prev, [qId]: res.data.isBookmarked }));
      }
    } catch (err) {
      console.error('Error bookmarking question:', err);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportModal) return;
    setSubmittingReport(true);
    try {
      await reportStudentReasoningQuestionRequest({
        questionId: reportModal._id,
        reason: reportReason,
        description: reportDesc
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportModal(null);
        setReportSuccess(false);
        setReportDesc('');
      }, 1500);
    } catch (err) {
      console.error('Error reporting question:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const topicName = topicId 
    ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Logical Reasoning';

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <Link
        to={`/student/reasoning/${topicId || 'logical-reasoning'}/quiz`}
        className="btn-secondary text-xs"
      >
        <FiZap className="w-3.5 h-3.5" />
        <span>Timed Quiz</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Reasoning Practice Arena"
        subtitle="Untimed practice mode with instant answer evaluation and step-by-step logic proofs."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning', to: '/student/reasoning' },
          ...(topicId ? [{ label: topicName, to: `/student/reasoning/${topicId}` }] : []),
          { label: 'Practice' }
        ]}
        actions={headerActions}
      />

      {/* Filter Ribbon Card */}
      <div className="card p-4 mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
            className="input py-2 text-xs font-medium w-auto cursor-pointer max-w-[200px]"
          >
            <option value="All">All Reasoning Topics</option>
            {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
          </select>

          {/* Difficulty Select */}
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="input py-2 text-xs font-medium w-auto cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Search Bar */}
          <div className="flex-1 min-w-[200px] max-w-sm">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search question keywords..."
            />
          </div>
        </div>

        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
          Showing {questions.length} of {totalQuestions} questions
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <LoadingState variant="list" rows={4} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={() => fetchQuestions(page)} />
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            title="No questions found"
            description="No practice questions match the selected topic, difficulty, or search query."
            action={
              <button
                onClick={() => { setSelectedTopic('All'); setDifficulty('All'); setSearch(''); setPage(1); }}
                className="btn-secondary text-xs"
              >
                Reset Filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {questions.map((q, idx) => {
            const state = attemptState[q._id] || {};
            const isBookmarked = !!bookmarkState[q._id];

            const diffVariant =
              q.difficulty === 'Easy'
                ? 'success'
                : q.difficulty === 'Hard'
                ? 'danger'
                : 'primary';

            return (
              <div
                key={q._id}
                className="card p-5 sm:p-6 space-y-4 transition-all"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {(page - 1) * 10 + idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {q.topic || q.category}
                    </span>
                    <Badge variant={diffVariant} size="sm">
                      {q.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleBookmark(q._id)}
                      className={`btn-icon ${
                        isBookmarked ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
                    >
                      <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => setReportModal(q)}
                      className="btn-icon text-gray-400 hover:text-rose-500"
                      title="Report an Issue"
                    >
                      <FiFlag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                  {q.questionText}
                </h3>

                {/* Options List */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = state.selectedOption === opt;
                    const isSubmitted = state.isSubmitted;
                    const isCorrectChoice = state.correctAnswer === opt;

                    let optStyle =
                      'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-800 dark:text-gray-200';

                    if (isSubmitted) {
                      if (isCorrectChoice) {
                        optStyle =
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected && !state.isCorrect) {
                        optStyle =
                          'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold';
                      } else {
                        optStyle = 'border-gray-200 dark:border-gray-800 opacity-60';
                      }
                    } else if (isSelected) {
                      optStyle =
                        'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-semibold';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q._id, opt)}
                        className={`p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <span className="w-5 h-5 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="break-words">{opt}</span>
                        </div>

                        {isSubmitted && isCorrectChoice && (
                          <FiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0 ml-2" />
                        )}
                        {isSubmitted && isSelected && !state.isCorrect && (
                          <FiXCircle className="text-rose-500 w-4 h-4 shrink-0 ml-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action & Explanation */}
                <div className="pt-1">
                  {!state.isSubmitted ? (
                    <button
                      onClick={() => handleCheckAnswer(q._id)}
                      disabled={!state.selectedOption || submittingId === q._id}
                      className="btn-primary text-xs"
                    >
                      {submittingId === q._id ? 'Evaluating...' : 'Check Answer'}
                    </button>
                  ) : (
                    <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        <FiHelpCircle className="w-3.5 h-3.5" />
                        <span>Explanation & Logical Proof:</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {state.explanation || `The correct answer is "${state.correctAnswer}".`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="card p-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {page} of {totalPages} ({totalQuestions} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FiFlag className="text-rose-500 w-4 h-4" />
                <span>Report Question Issue</span>
              </h3>
              <button
                onClick={() => setReportModal(null)}
                className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-semibold text-xs space-y-2">
                <FiCheckCircle className="w-8 h-8 mx-auto text-emerald-500" />
                <p>Report submitted to portal administrators!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="input-label">Issue Category</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input text-xs font-semibold cursor-pointer"
                  >
                    <option value="Wrong Answer">Wrong Answer Marked</option>
                    <option value="Incorrect Explanation">Incorrect Explanation</option>
                    <option value="Question Error">Question Typo or Error</option>
                    <option value="Duplicate Question">Duplicate Question</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the issue..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="input text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReportModal(null)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="btn-danger text-xs"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReasoningMCQs;
