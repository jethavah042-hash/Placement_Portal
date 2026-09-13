import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import {
  getStudentEnglishTopicsRequest,
  generateStudentEnglishQuizRequest,
  submitStudentEnglishQuizRequest
} from '../../../api/english';
import {
  FiClock,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';

const EnglishQuiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  // Pre-quiz setup state
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [quizError, setQuizError] = useState('');

  // Active quiz state
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

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

  const handleStartQuiz = async () => {
    setGenerating(true);
    setQuizError('');
    try {
      const res = await generateStudentEnglishQuizRequest({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        count: questionCount
      });
      if (res.data.success) {
        const data = res.data.data;
        setQuizData(data);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(data.duration * 60);
        setIsQuizActive(true);
        startTimeRef.current = Date.now();
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
      setQuizError(err.response?.data?.message || 'Unable to assemble quiz for the selected parameters.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!isQuizActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isQuizActive]);

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleClearOption = (qId) => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleAutoSubmit = () => {
    handleSubmitQuiz(true);
  };

  const handleSubmitQuiz = async (isAuto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const elapsedSeconds = startTimeRef.current
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      : (quizData.duration * 60 - timeLeft);

    const answersPayload = (quizData?.questions || []).map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || ''
    }));

    try {
      const res = await submitStudentEnglishQuizRequest({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        timeTaken: elapsedSeconds,
        answers: answersPayload
      });

      if (res.data.success) {
        const resultId = res.data.data._id;
        navigate(`/student/english/${topicId || 'grammar'}/results?resultId=${resultId}`);
      }
    } catch (err) {
      console.error('Error submitting English quiz:', err);
      alert('Error submitting assessment. Please check your connection.');
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quizData?.questions?.[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData?.questions?.length || 0;

  const breadcrumbs = [
    { label: 'English & Verbal', to: '/student/english' },
    ...(topicId ? [{ label: selectedTopic, to: `/student/english/${topicId}` }] : []),
    { label: 'Timed Quiz' }
  ];

  return (
    <DashboardLayout>
      {!isQuizActive ? (
        /* Pre-Quiz Configuration Screen */
        <div className="max-w-3xl mx-auto space-y-6">
          <PageHeader
            title="English Timed Quiz Setup"
            subtitle="Configure your verbal testing environment, timer, and difficulty profile."
            breadcrumbs={breadcrumbs}
          />

          {quizError && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              {quizError}
            </div>
          )}

          <div className="card p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Topic Select */}
              <div className="space-y-1.5">
                <label className="input-label">English Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="input"
                >
                  <option value="All">All English Topics (Mixed)</option>
                  {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              {/* Difficulty Select */}
              <div className="space-y-1.5">
                <label className="input-label">Difficulty Tier</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="input"
                >
                  <option value="All">Balanced (Mixed)</option>
                  <option value="Easy">Easy (Speed Training)</option>
                  <option value="Medium">Medium (Placement Standard)</option>
                  <option value="Hard">Hard (High-Package / CAT)</option>
                </select>
              </div>

              {/* Question Count */}
              <div className="space-y-1.5">
                <label className="input-label">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input"
                >
                  <option value={5}>5 Questions (Express)</option>
                  <option value={10}>10 Questions (Standard)</option>
                  <option value={15}>15 Questions (Full Test)</option>
                </select>
              </div>
            </div>

            {/* Assessment Rules */}
            <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <FiAward className="w-4 h-4" />
                <span>Standard Verbal Assessment Rules</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Time Allotted:</strong> ~1.5 minutes per question ({Math.ceil(questionCount * 1.5)} minutes total).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Scoring:</strong> +1 mark per correct answer, -0.25 negative marks for incorrect answers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Auto-Submit:</strong> When the timer expires, the assessment submits automatically.</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={generating}
              className="btn-primary w-full py-3 text-sm"
            >
              {generating ? 'Assembling Verbal Assessment...' : 'Start Assessment Now'}
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Control Bar with Countdown */}
          <div className="card p-4 sm:p-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Verbal Assessment Active
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                {quizData?.title}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold text-sm ${
                timeLeft < 60
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary"
            >
              Submit Test
            </button>
          </div>

          {/* Main Question & Navigation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Active Question */}
            <div className="lg:col-span-3 card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {currentQuestion?.topic || currentQuestion?.category} &bull; {currentQuestion?.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                {currentQuestion?.questionText}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {currentQuestion?.options?.map((opt, optIdx) => {
                  const isSelected = answers[currentQuestion._id] === opt;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestion._id, opt)}
                      className={`p-3.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/30 font-medium'
                          : 'border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 dark:border-gray-700 text-gray-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleClearOption(currentQuestion._id)}
                  disabled={!answers[currentQuestion._id]}
                  className="btn-ghost text-xs"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                    disabled={currentIdx === 0}
                    className="btn-secondary text-xs"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIdx(p => Math.min(totalQuestions - 1, p + 1))}
                    disabled={currentIdx === totalQuestions - 1}
                    className="btn-primary text-xs"
                  >
                    <span>Next</span>
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Question Palette */}
            <div className="card p-5 space-y-5 h-fit">
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                  Question Palette
                </h4>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Answered ({answeredCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" /> Left ({totalQuestions - answeredCount})
                  </span>
                </div>
              </div>

              {/* Palette Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {quizData?.questions?.map((q, idx) => {
                  const isAnswered = !!answers[q._id];
                  const isCurrent = idx === currentIdx;

                  let badgeStyle =
                    'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
                  if (isCurrent) {
                    badgeStyle = 'border-indigo-600 bg-indigo-600 text-white font-bold ring-2 ring-indigo-500/30';
                  } else if (isAnswered) {
                    badgeStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold';
                  }

                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center transition-all ${badgeStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="btn-primary w-full text-xs"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg mx-auto">
              <FiAlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-gray-900 dark:text-white">
              Submit Verbal Assessment?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions. Time remaining: {formatTime(timeLeft)}.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmitQuiz(false);
                }}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Evaluating...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishQuiz;
