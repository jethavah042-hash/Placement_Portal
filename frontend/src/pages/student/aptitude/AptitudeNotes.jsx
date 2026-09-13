import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import Badge from '../../../components/ui/Badge';
import { getAptitudeTopicNotesRequest } from '../../../api/aptitude';
import {
  FiBook,
  FiAward,
  FiZap,
  FiAlertCircle,
  FiHelpCircle,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckSquare,
  FiList
} from 'react-icons/fi';

const AptitudeNotes = () => {
  const { topicId } = useParams();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAptitudeTopicNotesRequest(topicId);
      if (data.success) {
        setNotes(data.data);
      } else {
        throw new Error('Failed to load notes');
      }
    } catch (err) {
      console.error('Error loading notes:', err);
      setError(err.response?.data?.message || 'Unable to load notes for this topic.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [topicId]);

  const topicName = notes?.topic || (topicId 
    ? topicId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aptitude Topic');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingState variant="page" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="card p-8">
          <ErrorState message={error} onRetry={fetchNotes} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <PageHeader
          title={`${topicName} Notes`}
          subtitle="Comprehensive theory, formulas, shortcuts, and solved examples."
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            { label: topicName, to: `/student/aptitude/${topicId}` },
            { label: 'Notes' }
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/student/aptitude/${topicId}/mcqs`}
                className="btn-secondary"
              >
                <FiList className="w-4 h-4 text-amber-500" />
                <span>Practice MCQs</span>
              </Link>
              <Link
                to={`/student/aptitude/${topicId}/quiz`}
                className="btn-primary"
              >
                <FiCheckSquare className="w-4 h-4" />
                <span>Take Quiz</span>
              </Link>
            </div>
          }
        />

        {/* 1. Introduction Card */}
        {notes?.introduction && (
          <div className="card p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <FiBook className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Introduction & Overview
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {notes.introduction}
            </p>
          </div>
        )}

        {/* 2. Important Concepts */}
        {notes?.concepts && notes.concepts.length > 0 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <SectionHeader
              title="Core Concepts & Definitions"
              subtitle="Key principles and foundational theories"
              badge={`${notes.concepts.length} Concepts`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.concepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="surface-muted p-4 space-y-2"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                    {concept.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {concept.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Formulas & Equations */}
        {notes?.formulas && notes.formulas.length > 0 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <SectionHeader
              title="Key Formulas & Theorems"
              subtitle="Important equations for swift problem solving"
              badge={`${notes.formulas.length} Formulas`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.formulas.map((form, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      {form.name}
                    </span>
                    <Badge variant="success">Formula</Badge>
                  </div>
                  <div className="p-2.5 rounded-md bg-white dark:bg-gray-900 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-emerald-100 dark:border-gray-800">
                    {form.formula}
                  </div>
                  {form.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {form.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Shortcuts & Speed Techniques */}
        {notes?.shortcuts && notes.shortcuts.length > 0 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <SectionHeader
              title="Speed Hacks & Shortcuts"
              subtitle="Techniques to solve problems in under 30 seconds"
              badge={`${notes.shortcuts.length} Shortcuts`}
            />
            <div className="space-y-3">
              {notes.shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 space-y-1.5"
                >
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <FiZap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{sc.name}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {sc.tip}
                  </p>
                  {sc.example && (
                    <div className="text-xs font-mono text-amber-900 dark:text-amber-300 mt-2 bg-white dark:bg-gray-900 p-2 rounded-md border border-amber-100 dark:border-amber-900/30">
                      <strong className="text-gray-700 dark:text-gray-300">Example: </strong>
                      {sc.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Solved Examples */}
        {notes?.solvedExamples && notes.solvedExamples.length > 0 && (
          <div className="card p-5 sm:p-6 space-y-4">
            <SectionHeader
              title="Solved Examples with Step-by-Step Solutions"
              subtitle="Learn through worked-out application problems"
              badge={`${notes.solvedExamples.length} Examples`}
            />
            <div className="space-y-4">
              {notes.solvedExamples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-3"
                >
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">Example {idx + 1}:</span>
                    {ex.question}
                  </h4>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                    <strong className="text-indigo-600 dark:text-indigo-400">Solution: </strong>
                    {ex.solution}
                  </div>
                  {ex.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {ex.explanation}
                    </p>
                  )}
                  {ex.shortcut && (
                    <div className="text-xs font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-md flex items-center gap-1.5">
                      <FiZap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span><strong>Shortcut:</strong> {ex.shortcut}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Common Mistakes & Placement Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Common Mistakes */}
          <div className="card p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>Common Traps & Mistakes</span>
            </h3>
            <ul className="space-y-2">
              {notes?.commonMistakes?.map((m, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Placement Strategy */}
          <div className="card p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <FiAward className="w-4 h-4 shrink-0" />
              <span>Placement & Exam Strategy</span>
            </h3>
            <ul className="space-y-2">
              {notes?.placementTips?.map((tip, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Next Track Action */}
        <div className="card p-6 bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Ready to test what you learned?</h3>
            <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">
              Practice topic MCQs or take the 10-question timed assessment.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to={`/student/aptitude/${topicId}/mcqs`}
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition-colors"
            >
              Practice MCQs
            </Link>
            <Link
              to={`/student/aptitude/${topicId}/quiz`}
              className="px-4 py-2 bg-indigo-800/80 hover:bg-indigo-900 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>Take Quiz</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AptitudeNotes;
