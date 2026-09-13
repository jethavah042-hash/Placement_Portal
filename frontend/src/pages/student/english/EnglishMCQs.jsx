import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentEnglishQuestionsRequest,
  getStudentEnglishTopicsRequest,
  submitStudentEnglishAttemptRequest,
  toggleStudentEnglishBookmarkRequest,
  reportStudentEnglishQuestionRequest
} from '../../../api/english';
import {
  FiCheckCircle,
  FiXCircle,
  FiBookmark,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiZap,
  FiX
} from 'react-icons/fi';

const EnglishMCQs = () => {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(
    topicId ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'All'
  );
  const [difficulty, setDifficulty] = useState('All');
  const [questionType, setQuestionType] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Practice state tracking: questionId -> { selectedOption, isSubmitted, isCorrect, correctAnswer, explanation, rule }
  const [attemptState, setAttemptState] = useState({});
  const [bookmarkState, setBookmarkState] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Reporting modal
  const [reportModal, setReportModal] = useState(null);
  const [reportReason, setReportReason] = useState('Wrong Answer');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    getStudentEnglishTopicsRequest()
      .then(res => {
        if (res.data.success) {
          setTopics(res.data.data);
          if (topicId) {
            const match = res.data.data.find(t => t.slug === topicId);
            if (match) setSelectedTopic(match.name);
          }
        }
      })
      .catch(() => {});
  }, [topicId]);

  const fetchQuestions = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: 10 };
      if (selectedTopic !== 'All') params.topic = selectedTopic;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (questionType !== 'All') params.questionType = questionType;
      if (search) params.search = search;

      const res = await getStudentEnglishQuestionsRequest(params);
      if (res.data.success) {
        setQuestions(res.data.data || []);
        setTotalQuestions(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || currentPage);

        const bMap = {};
        (res.data.data || []).forEach(q => {
          if (q.isBookmarked) bMap[q._id] = true;
        });
        setBookmarkState(prev => ({ ...prev, ...bMap }));
      }
    } catch (err) {
      console.error('Error fetching English questions:', err);
      setError('Unable to load English questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(page);
  }, [page, selectedTopic, difficulty, questionType]);

  const handleSearchSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
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
      const res = await submitStudentEnglishAttemptRequest({
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
            explanation: res.data.data.explanation,
            rule: res.data.data.rule
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
      const res = await toggleStudentEnglishBookmarkRequest({
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
      await reportStudentEnglishQuestionRequest({
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

  const breadcrumbs = [
    { label: 'English & Verbal', to: '/student/english' },
    ...(topicId ? [{ label: selectedTopic, to: `/student/english/${topicId}` }] : []),
    { label: 'Practice Arena' }
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="English Practice Arena"
        subtitle="Select your choice and click Check Answer for instant grammatical breakdown and rule explanations."
        breadcrumbs={breadcrumbs}
        actions={
          <Link
            to={`/student/english/${topicId || 'grammar'}/quiz`}
            className="btn-secondary"
          >
            <FiZap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Switch to Timed Quiz</span>
          </Link>
        }
      />

      {/* Filter Ribbon */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
            className="input w-auto text-xs py-2 h-auto"
          >
            <option value="All">All English Topics</option>
            {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
          </select>

          {/* Difficulty Select */}
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="input w-auto text-xs py-2 h-auto"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Question Type */}
          <select
            value={questionType}
            onChange={(e) => { setQuestionType(e.target.value); setPage(1); }}
            className="input w-auto text-xs py-2 h-auto"
          >
            <option value="All">All Question Types</option>
            <option value="mcq">Standard MCQs</option>
            <option value="para_jumble">Para Jumbles</option>
            <option value="error_detection">Error Detection</option>
            <option value="sentence_correction">Sentence Correction</option>
          </select>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-60">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full"
            />
          </form>
        </div>

        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
          Showing {questions.length} of {totalQuestions} questions
        </span>
      </div>

      {/* Questions List */}
      {loading ? (
        <LoadingState variant="list" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchQuestions(page)} />
      ) : questions.length === 0 ? (
        <EmptyState
          title="No practice questions found"
          description="No questions match the current filters. Try changing topic or difficulty."
          action={
            <button
              type="button"
              onClick={() => {
                setSelectedTopic('All');
                setDifficulty('All');
                setQuestionType('All');
                setSearch('');
                setPage(1);
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="space-y-5 max-w-4xl">
          {questions.map((q, idx) => {
            const state = attemptState[q._id] || {};
            const isBookmarked = !!bookmarkState[q._id];

            const difficultyBadge =
              q.difficulty === 'Easy'
                ? 'badge-success'
                : q.difficulty === 'Medium'
                ? 'badge-primary'
                : 'badge-danger';

            return (
              <div
                key={q._id}
                className="card p-6 space-y-4 transition-all duration-150"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                      {(page - 1) * 10 + idx + 1}
                    </span>
                    <span className="badge-neutral">
                      {q.topic || q.category}
                    </span>
                    <span className={difficultyBadge}>
                      {q.difficulty}
                    </span>
                    {q.questionType && q.questionType !== 'mcq' && (
                      <span className="badge-primary capitalize">
                        {q.questionType.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(q._id)}
                      className="btn-icon text-gray-400 hover:text-amber-500"
                      title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
                      aria-label="Bookmark Question"
                    >
                      <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportModal(q)}
                      className="btn-icon text-gray-400 hover:text-rose-600"
                      title="Report an Issue"
                      aria-label="Report an Issue"
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
                      'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-800 text-gray-700 dark:text-gray-300';

                    if (isSubmitted) {
                      if (isCorrectChoice) {
                        optStyle =
                          'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected && !state.isCorrect) {
                        optStyle =
                          'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium';
                      } else {
                        optStyle =
                          'border-gray-200 dark:border-gray-800 opacity-60 bg-gray-50 dark:bg-gray-800/50';
                      }
                    } else if (isSelected) {
                      optStyle =
                        'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/30 font-medium';
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q._id, opt)}
                        className={`p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected && !isSubmitted
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : isSubmitted && isCorrectChoice
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isSubmitted && isSelected && !state.isCorrect
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'border-gray-300 dark:border-gray-700 text-gray-500'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isSubmitted && isCorrectChoice && (
                          <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 w-4 h-4 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !state.isCorrect && (
                          <FiXCircle className="text-rose-600 dark:text-rose-400 w-4 h-4 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action & Explanation */}
                <div className="pt-2">
                  {!state.isSubmitted ? (
                    <button
                      type="button"
                      onClick={() => handleCheckAnswer(q._id)}
                      disabled={!state.selectedOption || submittingId === q._id}
                      className="btn-primary"
                    >
                      {submittingId === q._id ? 'Evaluating...' : 'Check Answer'}
                    </button>
                  ) : (
                    <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        <FiHelpCircle className="w-4 h-4" />
                        <span>Grammatical Rule & Solution:</span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {state.explanation || `The correct answer is "${state.correctAnswer}".`}
                      </p>
                      {state.rule && (
                        <div className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-white dark:bg-gray-900 p-2.5 rounded-md border border-indigo-100 dark:border-indigo-900/30 mt-1">
                          <strong>Rule Reference:</strong> {state.rule}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="card p-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {page} of {totalPages} ({totalQuestions} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FiFlag className="text-rose-500 w-4 h-4" />
                <span>Report Question Issue</span>
              </h3>
              <button
                type="button"
                onClick={() => setReportModal(null)}
                className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-semibold text-xs space-y-2">
                <FiCheckCircle className="w-8 h-8 mx-auto" />
                <p>Report submitted to portal administrators!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="input-label">Issue Category</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="input"
                  >
                    <option value="Wrong Answer">Wrong Answer Marked</option>
                    <option value="Incorrect Explanation">Incorrect Explanation / Rule</option>
                    <option value="Question Error">Question Typo or Error</option>
                    <option value="Duplicate Question">Duplicate Question</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the grammatical issue..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="input resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportModal(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="btn-danger"
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

export default EnglishMCQs;
