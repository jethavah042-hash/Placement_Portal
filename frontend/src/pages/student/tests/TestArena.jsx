import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTestDetailRequest, submitTestRequest } from '../../../api/test';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import {
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiFlag,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCcw,
  FiAward,
  FiBarChart2,
  FiLayers,
  FiCheck,
  FiArrowLeft,
  FiTrendingUp,
  FiShield
} from 'react-icons/fi';

const TestArena = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Test State
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Active Test Navigation & Answers
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [initialDuration, setInitialDuration] = useState(3600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultData, setResultData] = useState(null);

  const timerRef = useRef(null);

  // Fetch Test Details
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getTestDetailRequest(testId);
        if (data.success && data.data) {
          setTest(data.data);
          setQuestions(data.data.questions || []);
          const durationSeconds = (data.data.duration || 60) * 60;
          setTimeLeft(durationSeconds);
          setInitialDuration(durationSeconds);
        } else {
          throw new Error('Test could not be retrieved');
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err.response?.data?.message || 'Unable to load test questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  // Mark first question as visited when test starts
  const startTest = () => {
    if (questions.length > 0) {
      setVisited({ [questions[0]._id]: true });
    }
    setHasStarted(true);
  };

  // Live Timer Countdown
  useEffect(() => {
    if (!hasStarted || resultData) return;

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
  }, [hasStarted, resultData]);

  // Handle Option Select
  const handleSelectOption = (option) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: option
    }));
  };

  // Clear Selection
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQuestion._id];
      return updated;
    });
  };

  // Mark for Review Toggle
  const handleToggleReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQuestion._id]: !prev[currentQuestion._id]
    }));
  };

  // Navigation
  const handleNavigateQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    const targetQ = questions[index];
    if (targetQ) {
      setVisited(prev => ({ ...prev, [targetQ._id]: true }));
    }
    setCurrentIndex(index);
  };

  // Submit Test
  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          questionId: qId,
          selectedOption: answers[qId]
        })),
        timeTaken: initialDuration - timeLeft
      };

      const { data } = await submitTestRequest(testId, payload);
      if (data.success) {
        setResultData(data.data);
        setShowConfirmModal(false);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      alert(err.response?.data?.message || 'Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    await handleSubmitTest();
  };

  // Helper Formatter
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <LoadingState variant="page" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 1: PRE-EXAM INSTRUCTION VIEW
  // ----------------------------------------------------
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
        <div className="card max-w-2xl w-full p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <span className="badge-primary mb-1">Standardized Assessment</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {test?.title || 'Mock Test Examination'}
              </h1>
            </div>
            <Link
              to="/student/mock-tests"
              className="btn-ghost text-xs py-1.5"
            >
              Cancel & Exit
            </Link>
          </div>

          {/* Test Meta Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-medium block">Total Questions</span>
              <strong className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                {questions.length} Questions
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-medium block">Allocated Time</span>
              <strong className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                {test?.duration || 60} Minutes
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-medium block">Total Marks</span>
              <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {test?.totalMarks || questions.length} Pts
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 font-medium block">Negative Penalty</span>
              <strong className="text-sm font-bold text-rose-500 font-mono mt-0.5 block">
                -{test?.negativeMarking || 0.25} / error
              </strong>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <FiShield className="w-4 h-4 text-indigo-600" />
              <span>Assessment Rules & Guidelines:</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Each correct answer earns marks as indicated on the top right of the question card.</li>
              <li>Incorrect responses incur a negative mark deduction. Unattempted questions carry zero penalty.</li>
              <li>You may jump between questions at any time using the Question Palette sidebar.</li>
              <li>The test will automatically submit when the countdown timer reaches zero.</li>
              <li>Ensure a stable network connection before starting.</li>
            </ul>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/student/mock-tests"
              className="btn-secondary text-xs"
            >
              Back to Catalog
            </Link>

            <button
              onClick={startTest}
              className="btn-primary text-xs py-2.5 px-6 font-semibold"
            >
              Begin Examination Now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 3: POST-SUBMISSION RESULTS VIEW
  // ----------------------------------------------------
  if (resultData) {
    const accuracy = resultData.accuracy || Math.round((resultData.score / (resultData.totalMarks || 1)) * 100) || 0;
    const isPassed = accuracy >= (test?.passingPercentage || 60);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <PageHeader
            title="Assessment Result Scorecard"
            subtitle={`Detailed diagnostic evaluation for ${test?.title || 'Mock Test'}`}
            actions={
              <div className="flex items-center gap-2">
                <Link
                  to={`/student/mock-tests/${testId}/leaderboard`}
                  className="btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <FiAward className="w-3.5 h-3.5" />
                  <span>View Leaderboard</span>
                </Link>
                <Link
                  to="/student/mock-tests"
                  className="btn-primary text-xs"
                >
                  Back to Assessments
                </Link>
              </div>
            }
          />

          {/* Overall Performance Banner */}
          <div className={`card p-6 border ${isPassed ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${isPassed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'}`}>
                  {isPassed ? '🎉' : '📊'}
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className={isPassed ? 'badge-success' : 'badge-warning'}>
                      {isPassed ? 'Assessment Cleared' : 'Needs Practice'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    Score: {resultData.score} / {test?.totalMarks || questions.length} Pts
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Percentage: {accuracy}% • Time Taken: {formatTime(resultData.timeTaken || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 font-medium block">Correct</span>
                  <strong className="text-sm font-bold text-emerald-600">{resultData.correctCount || 0}</strong>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 font-medium block">Incorrect</span>
                  <strong className="text-sm font-bold text-rose-600">{resultData.incorrectCount || 0}</strong>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <span className="text-[10px] text-gray-400 font-medium block">Skipped</span>
                  <strong className="text-sm font-bold text-gray-500">{resultData.unattemptedCount || (questions.length - (resultData.correctCount || 0) - (resultData.incorrectCount || 0))}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Detailed Review */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Question-by-Question Model Review
            </h3>

            {questions.map((q, idx) => {
              const studentAnswer = answers[q._id];
              const isCorrect = studentAnswer === q.correctAnswer;
              const isSkipped = !studentAnswer;

              return (
                <div
                  key={q._id || idx}
                  className="card p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge-neutral text-[10px]">Q{idx + 1}</span>
                      <span className="text-xs font-medium text-gray-400">{q.topic || 'General'}</span>
                    </div>

                    {isCorrect ? (
                      <span className="badge-success flex items-center gap-1 text-[10px]">
                        <FiCheckCircle className="w-3 h-3" /> Correct (+{q.marks || 1})
                      </span>
                    ) : isSkipped ? (
                      <span className="badge-neutral text-[10px]">
                        Skipped (0 pts)
                      </span>
                    ) : (
                      <span className="badge-danger flex items-center gap-1 text-[10px]">
                        <FiXCircle className="w-3 h-3" /> Incorrect (-{test?.negativeMarking || 0.25})
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options?.map((opt, oIdx) => {
                      const isThisSelected = studentAnswer === opt;
                      const isThisCorrect = q.correctAnswer === opt;

                      let optClasses = "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300";
                      if (isThisCorrect) {
                        optClasses = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 font-semibold";
                      } else if (isThisSelected && !isThisCorrect) {
                        optClasses = "border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200";
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${optClasses}`}
                        >
                          <span>{opt}</span>
                          {isThisCorrect && <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isThisSelected && !isThisCorrect && <FiXCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
                      <strong className="text-gray-900 dark:text-white block mb-0.5">Solution & Step-by-Step Logic:</strong>
                      <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SCREEN 2: ACTIVE STANDARDIZED TEST ARENA
  // ----------------------------------------------------
  const currentQuestion = questions[currentIndex];
  const isMarked = currentQuestion && markedForReview[currentQuestion._id];
  const isAnswered = currentQuestion && answers[currentQuestion._id] !== undefined;

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unvisitedCount = questions.filter(q => !visited[q._id]).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {test?.title || 'Mock Test Examination'}
          </h1>
          <p className="text-[11px] text-gray-400">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Live Timer & Submit */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs ${
            timeLeft < 300
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 animate-pulse'
              : 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 text-indigo-400'
          }`}>
            <FiClock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn-primary text-xs py-1.5 px-4 font-semibold"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Columns: Active Question Arena */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5 sm:p-6 space-y-5">
            
            {/* Question Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="badge-primary text-xs font-bold">
                  Question #{currentIndex + 1}
                </span>
                <span className="badge-neutral text-xs">
                  {currentQuestion?.topic || 'General Subject'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-600 font-semibold">+{currentQuestion?.marks || 1} pt</span>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <span className="text-rose-500 font-mono">-{test?.negativeMarking || 0.25}</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-line">
                {currentQuestion?.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion?.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion._id] === option;
                const optLetter = String.fromCharCode(65 + idx);

                return (
                  <label
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className={`p-3.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {optLetter}
                    </span>
                    <span className="flex-1">{option}</span>
                  </label>
                );
              })}
            </div>

            {/* Bottom Actions for Question */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleReview}
                  className={`btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 ${
                    isMarked ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' : ''
                  }`}
                >
                  <FiFlag className="w-3.5 h-3.5" />
                  <span>{isMarked ? 'Unmark Review' : 'Mark for Review'}</span>
                </button>

                {isAnswered && (
                  <button
                    onClick={handleClearResponse}
                    className="btn-ghost text-xs py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Choice</span>
                  </button>
                )}
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigateQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                >
                  <FiChevronLeft className="w-4 h-4 mr-0.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => handleNavigateQuestion(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                  className="btn-primary text-xs py-1.5 px-4 font-semibold disabled:opacity-40"
                >
                  <span>Next</span>
                  <FiChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Question Palette & Legend */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Question Palette
            </h3>

            {/* Grid of question buttons */}
            <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAns = answers[q._id] !== undefined;
                const isRev = markedForReview[q._id];
                const isVis = visited[q._id];

                let btnClasses = "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700";
                if (isRev) {
                  btnClasses = "bg-amber-500 text-white font-bold border-amber-600";
                } else if (isAns) {
                  btnClasses = "bg-emerald-600 text-white font-bold border-emerald-700";
                } else if (isVis) {
                  btnClasses = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
                }

                return (
                  <button
                    key={q._id || idx}
                    onClick={() => handleNavigateQuestion(idx)}
                    className={`h-8 rounded-md text-xs font-semibold border flex items-center justify-center transition-all ${btnClasses} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 shrink-0" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 shrink-0" />
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-200 dark:bg-rose-900 shrink-0" />
                <span>Visited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-gray-200 dark:bg-gray-700 shrink-0" />
                <span>Unvisited ({unvisitedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSubmitTest}
          title="Submit Examination?"
          message={`You have answered ${answeredCount} of ${questions.length} questions. You still have ${formatTime(timeLeft)} remaining. Are you sure you want to end and submit?`}
          confirmText="Yes, Submit Test"
          cancelText="Continue Test"
          variant="primary"
          loading={isSubmitting}
        />
      )}
    </div>
  );
};

export default TestArena;
