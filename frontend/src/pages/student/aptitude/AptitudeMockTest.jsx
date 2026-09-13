import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import Badge from '../../../components/ui/Badge';
import { getAptitudeMockTestRequest, submitAptitudeMockTestRequest } from '../../../api/aptitude';
import {
  FiArrowLeft,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiFlag,
  FiRotateCcw,
  FiAward,
  FiArrowRight,
  FiX
} from 'react-icons/fi';

const AptitudeMockTest = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes (1800s)
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  const topicName = topicId 
    ? topicId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Quantitative Aptitude';

  const loadMockTest = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAptitudeMockTestRequest();
      if (data.success && data.data.length > 0) {
        setQuestions(data.data);
        setTimeLeft((data.duration || 30) * 60);
      } else {
        throw new Error('No questions available in mock test pool');
      }
    } catch (err) {
      console.error('Error loading mock test:', err);
      setError(err.response?.data?.message || 'Unable to prepare mock test.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    await loadMockTest();
    setStarted(true);
  };

  // Timer Countdown logic
  useEffect(() => {
    if (started && !resultData && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest(true);
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

  const handleClearAnswer = (qId) => {
    if (resultData) return;
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleReview = (qId) => {
    if (resultData) return;
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitTest = async (auto = false) => {
    if (submitting || resultData) return;
    setSubmitting(true);
    setShowConfirmModal(false);
    clearInterval(timerRef.current);

    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOption: selectedAnswers[q._id] || ''
      }));

      const timeTaken = 1800 - timeLeft;
      const { data } = await submitAptitudeMockTestRequest({
        answers: payloadAnswers,
        timeTaken: timeTaken > 0 ? timeTaken : 60
      });

      if (data.success) {
        setResultData(data.data);
      }
    } catch (err) {
      console.error('Error submitting mock test:', err);
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <PageHeader
          title="Quantitative Aptitude Mock Test"
          subtitle={
            resultData
              ? 'Mock test evaluation & topic breakdown'
              : started
              ? 'Comprehensive 30-question recruitment simulation'
              : 'Standardized assessment modeling campus recruitment exams'
          }
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            ...(topicId ? [{ label: topicName, to: `/student/aptitude/${topicId}` }] : []),
            { label: 'Mock Test' }
          ]}
          actions={
            started && !resultData ? (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 font-mono font-bold rounded-lg border text-base ${
                  timeLeft < 300
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/50'
                }`}
              >
                <FiClock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            ) : null
          }
        />

        {/* 1. Exam Instructions Pre-Screen */}
        {!started && !resultData && (
          <div className="card p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/50">
              <FiAlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Placement Mock Test Instructions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto leading-relaxed">
                This full-length test mirrors real recruitment aptitude assessments (TCS NQT, Infosys, Cognizant, Wipro). Review the examination rules below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Questions</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">30 MCQs</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Duration</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">30 Minutes</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Marking Scheme</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">+1.00 / -0.25</p>
              </div>
            </div>

            <div className="card p-4 text-left max-w-xl mx-auto space-y-2">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Exam Guidelines
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-disc pl-4">
                <li>Contains 30 balanced questions across all 15 aptitude topics.</li>
                <li>Each correct answer adds +1.00 mark; incorrect answers deduct 0.25 marks.</li>
                <li>You can flag questions for review and jump between them via the palette.</li>
                <li>The exam will auto-submit when the countdown reaches 00:00.</li>
              </ul>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg text-xs border border-rose-200 dark:border-rose-900 max-w-xl mx-auto">
                {error}
              </div>
            )}

            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleStart}
                className="btn-primary px-8 py-3 text-sm bg-rose-600 hover:bg-rose-700"
              >
                {loading ? 'Preparing 30-Q Mock Test...' : 'Start Mock Test Now'}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Active Mock Test Screen */}
        {started && !resultData && currentQ && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Question Area (3 Cols) */}
            <div className="lg:col-span-3 card p-5 sm:p-6 flex flex-col justify-between min-h-[480px] space-y-6">
              <div>
                {/* Meta info */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">
                      Question {currentIndex + 1} of {questions.length}
                    </Badge>
                    <Badge variant="neutral">
                      {currentQ.topic || 'General Aptitude'}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Marks: <strong className="text-emerald-600 dark:text-emerald-400">+1.00</strong> / <strong className="text-rose-600 dark:text-rose-400">-0.25</strong>
                  </span>
                </div>

                {/* Question Statement */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-5">
                  {currentQ.questionText}
                </h3>

                {/* Options List */}
                <div className="space-y-3">
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
              </div>

              {/* Action Toolbar */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleReview(currentQ._id)}
                    className={`btn-secondary text-xs ${
                      markedForReview[currentQ._id]
                        ? 'border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-300'
                        : ''
                    }`}
                  >
                    <FiFlag className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQ._id] ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!selectedAnswers[currentQ._id]}
                    onClick={() => handleClearAnswer(currentQ._id)}
                    className="btn-ghost text-xs disabled:opacity-40"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="btn-secondary text-xs"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="btn-primary text-xs"
                  >
                    <span>Save & Next</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Question Palette (1 Col) */}
            <div className="lg:col-span-1 card p-5 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Question Palette ({questions.length})
                </h4>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500" />
                    <span>Marked ({reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-gray-200 dark:bg-gray-700" />
                    <span>Left ({unansweredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded border border-indigo-600" />
                    <span>Current</span>
                  </div>
                </div>

                {/* 30-Question Grid */}
                <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                  {questions.map((q, i) => {
                    const isAns = !!selectedAnswers[q._id];
                    const isRev = !!markedForReview[q._id];
                    const isCurr = i === currentIndex;

                    let bgClass = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
                    if (isRev) {
                      bgClass = 'bg-purple-600 text-white font-bold';
                    } else if (isAns) {
                      bgClass = 'bg-emerald-600 text-white font-bold';
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${bgClass} ${
                          isCurr ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-gray-900' : ''
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Test Trigger */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="btn-danger w-full"
              >
                Submit Mock Test
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Mock Test?</h3>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-icon"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                You have attempted <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions. Please review your attempt status:
              </p>

              <div className="space-y-2 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Answered Questions:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{answeredCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Unanswered Questions:</span>
                  <strong className="text-rose-600 dark:text-rose-400">{unansweredCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Marked for Review:</span>
                  <strong className="text-purple-600 dark:text-purple-400">{reviewCount}</strong>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitTest(false)}
                  className="btn-danger text-xs"
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit Test'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Comprehensive Mock Test Result & Topic-Wise Analysis View */}
        {resultData && (
          <div className="space-y-8">
            {/* Scorecard Hero Banner */}
            <div className="card p-6 sm:p-8 text-center space-y-6">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mx-auto">
                <FiAward className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mock Test Performance Scorecard
                </h2>
                <div className="mt-2">
                  <Badge variant={resultData.status === 'Passed' ? 'success' : 'warning'}>
                    Status: {resultData.status}
                  </Badge>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Obtained Marks</p>
                  <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {resultData.obtainedMarks} / {resultData.totalMarks}
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score %</p>
                  <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {resultData.percentage}%
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correct (+1.0)</p>
                  <h4 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {resultData.correctCount}
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Incorrect (-0.25)</p>
                  <h4 className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    {resultData.wrongCount}
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                  <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {resultData.accuracy}%
                  </h4>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Time Taken</p>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {Math.floor(resultData.timeTaken / 60)}m {resultData.timeTaken % 60}s
                  </h4>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  to="/student/aptitude"
                  className="btn-primary"
                >
                  Return to Aptitude Hub
                </Link>
                <Link
                  to={`/student/aptitude/${topicId || 'number-system'}/results`}
                  className="btn-secondary"
                >
                  View All Past Results
                </Link>
              </div>
            </div>

            {/* Topic-Wise Breakdown Analysis */}
            {resultData.topicAnalysis && resultData.topicAnalysis.length > 0 && (
              <div className="card p-5 sm:p-6 space-y-4">
                <SectionHeader
                  title="Topic-Wise Performance Breakdown"
                  subtitle="Detailed subject strength and weakness distribution"
                  badge={`${resultData.topicAnalysis.length} Topics`}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resultData.topicAnalysis.map((ta, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-gray-900 dark:text-white">{ta.topic}</span>
                        <span className={ta.percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {ta.correct} / {ta.total} ({ta.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ta.percentage >= 60 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, ta.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question-by-Question Detailed Review */}
            <div className="space-y-4">
              <SectionHeader
                title="Exam Question Review & Solutions"
                subtitle="Complete answer key with marking breakdown"
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
                      Q{idx + 1}. <span className="font-normal text-gray-400 dark:text-gray-500">[{ans.topic}]</span>
                    </span>
                    <Badge variant={ans.isCorrect ? 'success' : ans.selectedOption === 'Not Attempted' ? 'neutral' : 'danger'}>
                      {ans.isCorrect ? '+1.00 Mark' : ans.selectedOption === 'Not Attempted' ? '0.00 Marks' : '-0.25 Marks'}
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

export default AptitudeMockTest;
