import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const EnglishMockTest = () => {
  const { topicId } = useParams();
  const topicName = topicId
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Verbal Ability';
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    let timer;
    if (started && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const breadcrumbs = [
    { label: 'English & Verbal', to: '/student/english' },
    ...(topicId ? [{ label: topicName, to: `/student/english/${topicId}` }] : []),
    { label: 'Mock Test' }
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={`${topicName} - Mock Test`}
        subtitle="Standardized verbal assessment simulation with timed countdown and negative marking."
        breadcrumbs={breadcrumbs}
        actions={
          started && (
            <div
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono font-bold text-sm ${
                timeLeft < 180
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 animate-pulse'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )
        }
      />

      <div className="card p-6 sm:p-8">
        {!started ? (
          <div className="max-w-xl mx-auto text-center py-6 space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Exam Instructions & Marking Scheme
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Please read the instructions carefully before commencing the simulation.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-left text-xs text-gray-600 dark:text-gray-300 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Total Questions: <strong>25 Multiple Choice Questions</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Time Limit: <strong>20 Minutes Countdown</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Correct Answer: <strong>+3 marks</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Incorrect Answer: <strong>-1 mark (Negative Marking)</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>Pay close attention to paragraph structure and context clues.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStarted(true)}
              className="btn-primary px-8 py-3 text-sm"
            >
              Begin Mock Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Question */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <span className="badge-primary mb-2">
                  Question 1 of 25
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  Read the passage and answer the following question for {topicName}.
                </h3>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 italic text-xs leading-relaxed">
                "Effective verbal agility in recruitment drives requires a dual mastery of precise syntactic frameworks and inferential deduction. Candidates must identify subtle tone shifts, idiomatic nuances, and subject-verb concordance under timed conditions."
              </div>

              <div className="space-y-2.5">
                {[
                  "Syntax concordance and inferential precision",
                  "Memorization of extensive dictionary indexes",
                  "Arbitrary grammatical rule application",
                  "Unstructured paragraph skimming without comprehension"
                ].map((opt, i) => {
                  const isSelected = selectedOption === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`p-3.5 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3 ${
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
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedOption(null)}
                  disabled={selectedOption === null}
                  className="btn-ghost text-xs"
                >
                  Clear Answer
                </button>
                <button
                  type="button"
                  className="btn-primary text-xs"
                >
                  Save & Next
                </button>
              </div>
            </div>

            {/* Right Column: Palette */}
            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-6 lg:pt-0 lg:pl-6 space-y-4">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                Question Palette
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center cursor-pointer transition-colors ${
                      i === 0
                        ? 'border-indigo-600 bg-indigo-600 text-white font-bold ring-2 ring-indigo-500/30'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-200 dark:hover:border-indigo-800'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-primary w-full text-xs mt-4"
              >
                Submit Mock Test
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnglishMockTest;
