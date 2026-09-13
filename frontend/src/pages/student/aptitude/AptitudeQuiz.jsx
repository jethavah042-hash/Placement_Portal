import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import Badge from '../../../components/ui/Badge';
import { getAptitudeTopicQuizRequest, submitAptitudeQuizRequest } from '../../../api/aptitude';
import {
  FiArrowLeft,
  FiClock,
  FiCheckSquare,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiArrowRight,
  FiHelpCircle,
  FiRotateCcw
} from 'react-icons/fi';

const AptitudeQuiz = () => {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const topicName = topicId 
    ? topicId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aptitude Topic';

  const loadQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAptitudeTopicQuizRequest(topicId);
      if (data.success && data.data.length > 0) {
        setQuestions(data.data);
        setTimeLeft((data.duration || 10) * 60);
      } else {
        throw new Error('No questions available for this quiz');
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError(err.response?.data?.message || 'Unable to load topic quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    await loadQuiz();
    setStarted(true);
  };

  // Timer countdown
  useEffect(() => {
    if (started && !resultData && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, resultData]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, option) => {
    if (resultData) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async (auto = false) => {
    if (submitting || resultData) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] || ''
      }));

      const totalTime = 600 - timeLeft;
      const { data } = await submitAptitudeQuizRequest({
        topic: topicName,
        answers: payloadAnswers,
        timeTaken: totalTime > 0 ? totalTime : 30
      });

      if (data.success) {
        setResultData(data.data);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <PageHeader
          title={`${topicName} Quiz`}
          subtitle={
            resultData
              ? 'Quiz evaluation and performance review'
              : started
              ? 'Timed 10-question assessment'
              : 'Test your speed and concept retention under timed conditions'
          }
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            { label: topicName, to: `/student/aptitude/${topicId}` },
            { label: 'Quiz' }
          ]}
          actions={
            started && !resultData ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-base">
                <FiClock className="w-4 h-4 animate-pulse text-indigo-600 dark:text-indigo-400" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            ) : null
          }
        />

        {/* 1. Pre-Quiz Instruction Screen */}
        {!started && !resultData && (
          <div className="card p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
              <FiCheckSquare className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Ready to take the {topicName} Quiz?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                You will be presented with 10 questions on {topicName}. You will have 10 minutes to finish. Your result will be saved to your performance record.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Questions</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">10 MCQs</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Time Limit</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">10 Minutes</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Passing</span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">60% Score</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleStart}
                className="btn-primary px-8 py-3 text-sm"
              >
                {loading ? 'Preparing Quiz...' : 'Start Quiz Now'}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Active Quiz Interface */}
        {started && !resultData && currentQ && (
          <div className="card p-5 sm:p-6 space-y-6">
            {/* Top Meta Bar */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <Badge variant="primary">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Attempted: <strong className="text-gray-900 dark:text-white">{Object.keys(selectedAnswers).length}</strong> / {questions.length}
              </span>
            </div>

            {/* Question Statement */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
              {currentQ.questionText}
            </h3>

            {/* 4 Options */}
            <div className="space-y-3 pt-1">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ._id] === opt;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ._id, opt)}
                    className={`p-3.5 border rounded-lg cursor-pointer transition-all flex items-center justify-between text-sm ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-semibold ring-1 ring-indigo-600'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Question Number Palette */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {questions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                    i === currentIndex
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-gray-900'
                      : selectedAnswers[q._id]
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Footer Navigation & Submit */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-5">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="btn-secondary"
              >
                ← Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit(false)}
                  className="btn-primary bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn-primary"
                >
                  <span>Next</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Quiz Result & Detailed Review View */}
        {resultData && (
          <div className="space-y-6">
            {/* Score Banner Card */}
            <div className="card p-6 sm:p-8 text-center space-y-6">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mx-auto">
                <FiAward className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {topicName} Quiz Result
                </h2>
                <div className="mt-2">
                  <Badge variant={resultData.status === 'Passed' ? 'success' : 'warning'}>
                    Status: {resultData.status}
                  </Badge>
                </div>
              </div>

              {/* Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score Percentage</p>
                  <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {resultData.percentage}%
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correct Answers</p>
                  <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {resultData.correctCount} / {resultData.totalQuestions}
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wrong Answers</p>
                  <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {resultData.wrongCount}
                  </h4>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Overall Accuracy</p>
                  <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {resultData.accuracy}%
                  </h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResultData(null);
                    setStarted(false);
                    setSelectedAnswers({});
                    setTimeLeft(600);
                  }}
                  className="btn-secondary"
                >
                  <FiRotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
                <Link
                  to={`/student/aptitude/${topicId}`}
                  className="btn-primary"
                >
                  <span>Back to {topicName} Hub</span>
                </Link>
              </div>
            </div>

            {/* Question-by-Question Review */}
            <div className="space-y-4">
              <SectionHeader
                title="Detailed Question Review"
                subtitle="Review your submitted answers alongside official solutions"
                badge={`${resultData.answers.length} Questions`}
              />

              {resultData.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`card p-5 space-y-3 ${
                    ans.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900/50'
                      : ans.selectedOption === 'Not Attempted'
                      ? 'border-gray-200 dark:border-gray-800'
                      : 'border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Question {idx + 1}
                    </span>
                    <Badge variant={ans.isCorrect ? 'success' : ans.selectedOption === 'Not Attempted' ? 'neutral' : 'danger'}>
                      {ans.isCorrect ? 'Correct' : ans.selectedOption === 'Not Attempted' ? 'Unattempted' : 'Incorrect'}
                    </Badge>
                  </div>

                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {ans.questionText}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">Your Answer: </span>
                      <strong className={ans.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {ans.selectedOption}
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-700 dark:text-emerald-400">Correct Answer: </span>
                      <strong className="text-emerald-800 dark:text-emerald-300">
                        {ans.correctAnswer}
                      </strong>
                    </div>
                  </div>

                  {ans.explanation && (
                    <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-xs text-gray-700 dark:text-gray-300 space-y-1">
                      <strong className="text-indigo-800 dark:text-indigo-300">Explanation: </strong>
                      <span>{ans.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AptitudeQuiz;
