import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import {
  getStudentReasoningTopicsRequest,
  generateStudentReasoningQuizRequest,
  submitStudentReasoningQuizRequest
} from '../../../api/reasoning';
import {
  FiArrowLeft,
  FiClock,
  FiCheckSquare,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiCheckCircle,
  FiZap
} from 'react-icons/fi';

const ReasoningQuiz = () => {
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
  const [quizData, setQuizData] = useState(null); // { title, duration, questions: [...] }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: selectedOption }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load available topics
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

  // Start Quiz generator
  const handleStartQuiz = async () => {
    setGenerating(true);
    setQuizError('');
    try {
      const res = await generateStudentReasoningQuizRequest({
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
      setQuizError(err.response?.data?.message || 'Unable to generate quiz for the selected parameters.');
    } finally {
      setGenerating(false);
    }
  };

  // Timer Countdown Effect
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
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
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
      const res = await submitStudentReasoningQuizRequest({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        timeTaken: elapsedSeconds,
        answers: answersPayload
      });

      if (res.data.success) {
        const resultId = res.data.data._id;
        navigate(`/student/reasoning/${topicId || 'logical-reasoning'}/results?resultId=${resultId}`);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert('Error submitting quiz. Please check your connection.');
      setSubmitting(false);
    }
  };

  // Format Time (MM:SS)
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Current Question Pointer
  const currentQuestion = quizData?.questions?.[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quizData?.questions?.length || 0;

  const topicName = topicId 
    ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Logical Reasoning';

  return (
    <DashboardLayout>
      {!isQuizActive ? (
        /* Pre-Quiz Configuration Screen */
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Page Header */}
          <PageHeader
            title="Reasoning Timed Quiz"
            subtitle="Configure your assessment environment, timer limits, and difficulty distribution."
            breadcrumbs={[
              { label: 'Dashboard', to: '/student/dashboard' },
              { label: 'Logical Reasoning', to: '/student/reasoning' },
              ...(topicId ? [{ label: topicName, to: `/student/reasoning/${topicId}` }] : []),
              { label: 'Quiz Setup' }
            ]}
          />

          {quizError && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              {quizError}
            </div>
          )}

          <div className="card p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Topic Select */}
              <div>
                <label className="input-label">Reasoning Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="input text-xs font-semibold cursor-pointer"
                >
                  <option value="All">All Topics (Mixed)</option>
                  {topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              {/* Difficulty Select */}
              <div>
                <label className="input-label">Difficulty Tier</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="input text-xs font-semibold cursor-pointer"
                >
                  <option value="All">Balanced (Mixed Difficulties)</option>
                  <option value="Easy">Easy (Speed Training)</option>
                  <option value="Medium">Medium (Standard Placement)</option>
                  <option value="Hard">Hard (High-Package / Advanced)</option>
                </select>
              </div>

              {/* Question Count */}
              <div>
                <label className="input-label">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input text-xs font-semibold cursor-pointer"
                >
                  <option value={5}>5 Questions (Express)</option>
                  <option value={10}>10 Questions (Standard)</option>
                  <option value={15}>15 Questions (Full Test)</option>
                </select>
              </div>
            </div>

            {/* Assessment Rules */}
            <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <FiAward className="w-3.5 h-3.5" />
                <span>Standard Assessment Rules</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Time Allotted:</strong> ~1.5 minutes per question ({Math.ceil(questionCount * 1.5)} minutes total).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Scoring Scheme:</strong> +1 mark per correct answer, -0.25 negative marks for incorrect answers.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">&bull;</span>
                  <span><strong>Auto-Submit:</strong> Test automatically submits when the countdown reaches 00:00.</span>
                </li>
              </ul>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartQuiz}
              disabled={generating}
              className="btn-primary w-full py-3 text-sm justify-center"
            >
              {generating ? (
                <span>Assembling Assessment...</span>
              ) : (
                <>
                  <FiZap className="w-4 h-4" />
                  <span>Start Assessment Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Active Quiz Screen */
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Control Bar with Countdown */}
          <div className="card p-4 flex items-center justify-between gap-4 sticky top-4 z-20 shadow-md">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Assessment In Progress
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                {quizData?.title}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold text-sm ${
                timeLeft < 60
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50'
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary text-xs"
            >
              Submit Test
            </button>
          </div>

          {/* Main Question & Navigation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Active Question */}
            <div className="lg:col-span-3 card p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {currentQuestion?.topic} &bull; {currentQuestion?.difficulty}
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
                      className={`p-3.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600/20 font-semibold'
                          : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-gray-50/50 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200'
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
                      <span className="break-words">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => handleClearOption(currentQuestion._id)}
                  disabled={!answers[currentQuestion._id]}
                  className="btn-ghost text-xs disabled:opacity-40"
                >
                  Clear Selection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                    disabled={currentIdx === 0}
                    className="btn-secondary text-xs disabled:opacity-40"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={() => setCurrentIdx(p => Math.min(totalQuestions - 1, p + 1))}
                    disabled={currentIdx === totalQuestions - 1}
                    className="btn-primary text-xs disabled:opacity-40"
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
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Answered ({answeredCount})</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                    <span>Left ({totalQuestions - answeredCount})</span>
                  </span>
                </div>
              </div>

              {/* Number Badges */}
              <div className="grid grid-cols-5 gap-2">
                {quizData?.questions?.map((q, idx) => {
                  const isAnswered = !!answers[q._id];
                  const isCurrent = idx === currentIdx;

                  let badgeStyle =
                    'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
                  if (isCurrent) {
                    badgeStyle =
                      'border-indigo-600 bg-indigo-600 text-white font-bold ring-2 ring-indigo-600/30';
                  } else if (isAnswered) {
                    badgeStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold';
                  }

                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${badgeStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="btn-primary w-full text-xs justify-center"
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
        <div className="modal-overlay">
          <div className="modal-content max-w-sm p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg mx-auto">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                Submit Reasoning Quiz?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions. Time remaining: {formatTime(timeLeft)}.
              </p>
            </div>
            <div className="pt-2 flex gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1 text-xs"
              >
                Resume
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); handleSubmitQuiz(false); }}
                disabled={submitting}
                className="btn-primary flex-1 text-xs"
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

export default ReasoningQuiz;
