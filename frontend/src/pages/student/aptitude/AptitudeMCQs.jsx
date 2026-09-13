import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import { getAptitudeTopicQuestionsRequest, toggleAptitudeBookmarkRequest } from '../../../api/aptitude';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiXCircle,
  FiBookmark,
  FiRefreshCw,
  FiArrowRight,
  FiHelpCircle,
  FiCheckSquare
} from 'react-icons/fi';

const AptitudeMCQs = () => {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;
      const { data } = await getAptitudeTopicQuestionsRequest(topicId, params);
      if (data.success) {
        setQuestions(data.data || []);
        const bMap = {};
        (data.data || []).forEach((q) => {
          if (q.isBookmarked) bMap[q._id] = true;
        });
        setBookmarkedMap(bMap);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error fetching topic questions:', err);
      setError(err.response?.data?.message || 'Unable to load practice questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicId, difficulty]);

  const topicName = topicId 
    ? topicId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aptitude Topic';

  const handleSelectOption = (qId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  const handleToggleBookmark = async (qId) => {
    try {
      const { data } = await toggleAptitudeBookmarkRequest({ questionId: qId });
      if (data.success) {
        setBookmarkedMap((prev) => ({ ...prev, [qId]: data.bookmarked }));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const currentQ = questions[currentIndex];

  const getDifficultyBadgeVariant = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <PageHeader
          title={`${topicName} Practice MCQs`}
          subtitle="Untimed practice mode with step-by-step solutions and explanations."
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            { label: topicName, to: `/student/aptitude/${topicId}` },
            { label: 'Practice MCQs' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link
                to={`/student/aptitude/${topicId}/quiz`}
                className="btn-primary"
              >
                <FiCheckSquare className="w-4 h-4" />
                <span>Take Timed Quiz</span>
              </Link>
            </div>
          }
        />

        {/* Difficulty Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="tab-list w-fit">
            {['', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={difficulty === diff ? 'tab-item-active' : 'tab-item'}
              >
                {diff || 'All Levels'}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {questions.length} Question{questions.length !== 1 ? 's' : ''} Available
          </span>
        </div>

        {/* Question Area */}
        {loading ? (
          <div className="card p-6">
            <LoadingState variant="card" />
          </div>
        ) : error ? (
          <div className="card p-8">
            <ErrorState message={error} onRetry={fetchQuestions} />
          </div>
        ) : questions.length === 0 ? (
          <div className="card p-8">
            <EmptyState
              title="No questions found"
              description="No questions match the selected difficulty filter."
              action={
                <button
                  type="button"
                  onClick={() => { setDifficulty(''); setSearch(''); }}
                  className="btn-secondary text-xs"
                >
                  Reset Filter
                </button>
              }
            />
          </div>
        ) : currentQ ? (
          <div className="card p-5 sm:p-6 space-y-6">
            {/* Question Header Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Badge variant="primary">
                  Question {currentIndex + 1} of {questions.length}
                </Badge>
                <Badge variant={getDifficultyBadgeVariant(currentQ.difficulty)}>
                  {currentQ.difficulty || 'Standard'}
                </Badge>
              </div>

              {/* Bookmark Toggle */}
              <button
                type="button"
                onClick={() => handleToggleBookmark(currentQ._id)}
                className={`btn-icon ${
                  bookmarkedMap[currentQ._id]
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : ''
                }`}
                title={bookmarkedMap[currentQ._id] ? 'Bookmarked' : 'Bookmark this question'}
              >
                <FiBookmark
                  className={`w-4 h-4 ${bookmarkedMap[currentQ._id] ? 'fill-current' : ''}`}
                />
              </button>
            </div>

            {/* Question Statement */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* Options List */}
            <div className="space-y-3 pt-1">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ._id] === opt;
                const isCorrect = opt.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
                const isRevealed = revealed[currentQ._id];

                let optionStyles = 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-600';

                if (isRevealed) {
                  if (isCorrect) {
                    optionStyles = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 font-semibold ring-1 ring-rose-500';
                  }
                }

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ._id, opt)}
                    className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-center justify-between text-sm ${optionStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-semibold text-gray-500 shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isRevealed && (
                      <div className="shrink-0 ml-2">
                        {isCorrect && <FiCheckCircle className="text-emerald-500 w-5 h-5" />}
                        {isSelected && !isCorrect && <FiXCircle className="text-rose-500 w-5 h-5" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation Box */}
            {revealed[currentQ._id] && (
              <div className="p-4 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                  <FiHelpCircle className="w-4 h-4" />
                  <span>Explanation & Solution</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentQ.explanation || `The correct answer is ${currentQ.correctAnswer}.`}
                </p>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="btn-secondary"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none px-2 py-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === currentIndex
                        ? 'bg-indigo-600 w-6'
                        : selectedAnswers[questions[i]?._id]
                        ? 'bg-emerald-500 w-2.5'
                        : 'bg-gray-200 dark:bg-gray-700 w-2.5'
                    }`}
                    aria-label={`Question ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="btn-primary"
              >
                <span>Next</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default AptitudeMCQs;
