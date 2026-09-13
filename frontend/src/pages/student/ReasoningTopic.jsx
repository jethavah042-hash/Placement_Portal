import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import {
  getStudentReasoningTopicBySlugRequest,
  markStudentReasoningNotesCompletedRequest
} from '../../api/reasoning';
import {
  FiArrowLeft,
  FiFileText,
  FiList,
  FiCheckSquare,
  FiPieChart,
  FiBookOpen,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiArrowRight
} from 'react-icons/fi';

const ReasoningTopic = () => {
  const { topicId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  const fetchTopicDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentReasoningTopicBySlugRequest(topicId);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching topic detail:', err);
      setError('Unable to load topic details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await markStudentReasoningNotesCompletedRequest(topicId);
      await fetchTopicDetails();
    } catch (err) {
      console.error('Error marking complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const topic = data?.topic || {
    name: topicId ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Topic Overview',
    description: 'Master analytical logic, deductive reasoning rules, and problem patterns.',
    difficulty: 'Medium',
    estimatedStudyTime: '45 mins'
  };

  const progress = data?.progress || { completed: false, mcqsAttempted: 0, accuracy: 0 };

  const difficultyVariant =
    topic.difficulty === 'Easy'
      ? 'success'
      : topic.difficulty === 'Hard'
      ? 'danger'
      : 'primary';

  const headerActions = (
    <div className="flex items-center gap-3">
      {progress.completed ? (
        <span className="badge-success px-3 py-1.5 text-xs font-semibold gap-1.5">
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Topic Completed</span>
        </span>
      ) : (
        <button
          onClick={handleMarkComplete}
          disabled={markingComplete}
          className="btn-primary text-xs"
        >
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>{markingComplete ? 'Saving...' : 'Mark as Complete'}</span>
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={topic.name}
        subtitle={topic.description || 'Master logical rules, practice categorized questions, and evaluate your speed.'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning', to: '/student/reasoning' },
          { label: topic.name }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant="page" rows={3} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchTopicDetails} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress & Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Available Questions"
              value={`${data?.questionCount || 0}`}
              icon={FiBookOpen}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />
            <StatCard
              label="Estimated Study Time"
              value={topic.estimatedStudyTime || '45 mins'}
              icon={FiClock}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-50 dark:bg-blue-950/40"
            />
            <StatCard
              label="Your Solved Attempts"
              value={`${progress.mcqsAttempted}`}
              icon={FiTarget}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/40"
            />
            <StatCard
              label="Topic Accuracy Rate"
              value={`${progress.accuracy}%`}
              icon={FiCheckCircle}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />
          </div>

          {/* Action Tracks Section Header */}
          <div>
            <SectionHeader
              title="Learning Tracks & Modules"
              subtitle="Choose a track below to begin studying, practicing, or testing your proficiency."
              badge={
                <Badge variant={difficultyVariant} size="sm">
                  {topic.difficulty || 'Medium'}
                </Badge>
              }
            />

            {/* 4 Tracks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Track 1: Study Guide */}
              <Link
                to={`/student/reasoning/${topicId}/notes`}
                className="card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Study Guide & Notes
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    Read core logic rules, formulas, shortcuts, and solved placement examples.
                  </p>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Notes</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Track 2: Practice Arena */}
              <Link
                to={`/student/reasoning/${topicId}/mcqs`}
                className="card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FiList className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Practice Arena
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    Solve topic questions with instant verification and step-by-step logic.
                  </p>
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Practice</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Track 3: Timed Quiz */}
              <Link
                to={`/student/reasoning/${topicId}/quiz`}
                className="card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FiCheckSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Timed Quiz
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    Test your problem-solving speed under exam conditions with auto-scoring.
                  </p>
                </div>
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Take Quiz</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              {/* Track 4: Results & Review */}
              <Link
                to={`/student/reasoning/${topicId}/results`}
                className="card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <FiPieChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Results & Review
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    Review detailed solutions, scores, and past assessment analytics.
                  </p>
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Analytics</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReasoningTopic;
