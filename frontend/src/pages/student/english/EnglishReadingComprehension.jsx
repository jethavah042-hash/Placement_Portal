import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentEnglishPassagesRequest,
  getStudentEnglishPassageByIdRequest,
  submitStudentEnglishPassageRequest
} from '../../../api/english';
import {
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiCheck
} from 'react-icons/fi';

const EnglishReadingComprehension = () => {
  const { passageId } = useParams();
  const navigate = useNavigate();

  const [passages, setPassages] = useState([]);
  const [activePassage, setActivePassage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Active testing state
  const [answers, setAnswers] = useState({}); // { [qId]: selectedOption }
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // 1. Fetch passages list
  const fetchPassages = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentEnglishPassagesRequest({ difficulty: difficultyFilter });
      if (res.data.success) {
        setPassages(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching passages:', err);
      setError('Unable to load reading passages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!passageId) {
      fetchPassages();
    }
  }, [passageId, difficultyFilter]);

  // 2. Fetch single active passage
  useEffect(() => {
    if (passageId) {
      setLoading(true);
      setError('');
      getStudentEnglishPassageByIdRequest(passageId)
        .then(res => {
          if (res.data.success) {
            setActivePassage(res.data.data);
            setAnswers({});
            setStartTime(Date.now());
          }
        })
        .catch(err => {
          console.error('Error loading passage:', err);
          setError('Unable to load reading passage.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setActivePassage(null);
    }
  }, [passageId]);

  const handleSelectOption = (qId, option) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmitPassage = async () => {
    if (submitting || !activePassage) return;
    setSubmitting(true);

    const elapsedSeconds = startTime
      ? Math.max(1, Math.round((Date.now() - startTime) / 1000))
      : 60;

    const answersPayload = activePassage.questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || ''
    }));

    try {
      const res = await submitStudentEnglishPassageRequest(activePassage._id, {
        answers: answersPayload,
        timeTaken: elapsedSeconds
      });
      if (res.data.success) {
        navigate(`/student/english/results?resultId=${res.data.data._id}`);
      }
    } catch (err) {
      console.error('Error submitting RC assessment:', err);
      alert('Error submitting reading comprehension assessment.');
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = activePassage?.questions?.length || 0;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={activePassage ? activePassage.title : 'Reading Comprehension Arena'}
        subtitle={
          activePassage
            ? `Read the passage carefully and answer the ${totalQuestions} comprehension questions.`
            : 'Develop passage scanning agility, inferential deduction, and tone identification skills.'
        }
        breadcrumbs={
          activePassage
            ? [
                { label: 'English & Verbal', to: '/student/english' },
                { label: 'Reading Comprehension', to: '/student/english/reading-comprehension' },
                { label: activePassage.title }
              ]
            : [
                { label: 'English & Verbal', to: '/student/english' },
                { label: 'Reading Comprehension' }
              ]
        }
        actions={
          activePassage && (
            <span className="badge-primary">
              {answeredCount} of {totalQuestions} Answered
            </span>
          )
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={passageId ? () => getStudentEnglishPassageByIdRequest(passageId) : fetchPassages}
        />
      ) : activePassage ? (
        /* Active Reading Comprehension Split Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Passage Text (Sticky) */}
          <div className="lg:col-span-7 card p-6 space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="badge-primary flex items-center gap-1.5">
                <FiBookOpen className="w-3.5 h-3.5" /> Reading Passage
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {activePassage.wordCount || 300} words &bull; ~{activePassage.estimatedReadTime || '3 mins'}
              </span>
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 max-h-[62vh] overflow-y-auto pr-2">
              {activePassage.passageText.split('\n\n').map((para, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Comprehension Questions */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              {activePassage.questions.map((q, idx) => (
                <div key={q._id} className="card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Question {idx + 1} of {totalQuestions}
                    </span>
                    <span className="badge-neutral">
                      +{q.marks || 1} Marks
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {q.questionText}
                  </h3>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q._id] === opt;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q._id, opt)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-3 ${
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
                          <span className="leading-snug">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmitPassage}
              disabled={submitting || answeredCount === 0}
              className="btn-primary w-full py-3 text-sm"
            >
              {submitting
                ? 'Evaluating Assessment...'
                : `Submit Passage Assessment (${answeredCount}/${totalQuestions})`}
            </button>
          </div>
        </div>
      ) : (
        /* Passages Catalog List */
        <div className="space-y-6 max-w-5xl">
          {/* Difficulty Filter Tabs */}
          <div className="tab-list w-fit">
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficultyFilter(d)}
                className={`tab-item ${
                  difficultyFilter === d
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                    : ''
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {passages.length === 0 ? (
            <EmptyState
              title="No passages available"
              description="No reading comprehension passages found for the selected difficulty."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passages.map(p => {
                const difficultyBadge =
                  p.difficulty === 'Easy'
                    ? 'badge-success'
                    : p.difficulty === 'Medium'
                    ? 'badge-primary'
                    : 'badge-danger';

                return (
                  <div
                    key={p._id}
                    className="card p-5 flex flex-col justify-between space-y-4 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={difficultyBadge}>
                          {p.difficulty}
                        </span>

                        {p.isCompleted && (
                          <span className="badge-success flex items-center gap-1">
                            <FiCheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {p.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{p.wordCount || 300} words</span>
                        <span>&bull;</span>
                        <span>~{p.estimatedReadTime || '3 mins'} read</span>
                        <span>&bull;</span>
                        <span>{p.questionCount || p.questions?.length || 0} Questions</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                      <Link
                        to={`/student/english/reading-comprehension/${p._id}`}
                        className="btn-primary"
                      >
                        <span>Start Reading</span>
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishReadingComprehension;
