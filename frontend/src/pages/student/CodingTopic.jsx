import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { getCodingTopicDetailsRequest } from '../../api/coding';
import {
  FiArrowLeft,
  FiCode,
  FiBookOpen,
  FiMessageCircle,
  FiPieChart,
  FiCheckCircle,
  FiLayers,
  FiZap,
  FiArrowRight
} from 'react-icons/fi';

const CodingTopic = () => {
  const { topicId } = useParams();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topicName = topicId
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Topic';

  const fetchTopicDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCodingTopicDetailsRequest(topicId);
      if (data.success) {
        setTopicData(data.data);
      }
    } catch (err) {
      console.error('Error fetching topic details:', err);
      setError(err.response?.data?.message || 'Failed to load topic overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicDetails();
  }, [topicId]);

  const pathways = [
    {
      title: 'Theoretical Notes',
      slug: 'notes',
      desc: `Master core definitions, time/space complexities, algorithms, pseudocode, and placement traps for ${topicName}.`,
      icon: FiBookOpen,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: topicData?.hasNotes ? 'Verified Guide' : 'Study Notes',
      badgeVariant: 'primary'
    },
    {
      title: 'Interview Questions',
      slug: 'interview',
      desc: `Top technical placement interview questions with hidden answers and explanations for ${topicName}.`,
      icon: FiMessageCircle,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      badge: `${topicData?.interviewQuestionsCount || 10}+ Questions`,
      badgeVariant: 'neutral'
    },
    {
      title: 'Coding Challenges',
      slug: 'challenges',
      desc: `Interactive multi-language IDE arena to solve algorithmic problems with live test case evaluation.`,
      icon: FiCode,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: `${topicData?.totalProblems || 12}+ Problems`,
      badgeVariant: 'success'
    },
    {
      title: 'Result Analysis',
      slug: 'results',
      desc: `Track your accuracy, submission history, weak topic breakdown, and personalized recommendations.`,
      icon: FiPieChart,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: 'Deep Analytics',
      badgeVariant: 'warning'
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeader
        title={`${topicData?.name || topicName} Hub`}
        subtitle={
          topicData?.description ||
          `Master theoretical foundations, interview questions, and solve algorithmic challenges for ${topicName}.`
        }
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA', to: '/student/coding' },
          { label: topicData?.name || topicName }
        ]}
        actions={
          <Link
            to="/student/coding"
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>All DSA Topics</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchTopicDetails} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dynamic Topic Stats Bar */}
          {topicData && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Topic Problems"
                value={topicData.totalProblems || 0}
                icon={FiLayers}
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/40"
              />
              <StatCard
                label="Problems Solved"
                value={`${topicData.solvedProblems || 0} / ${topicData.totalProblems || 0}`}
                icon={FiCheckCircle}
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              />
              <StatCard
                label="Interview Q&As"
                value={topicData.interviewQuestionsCount || 0}
                icon={FiMessageCircle}
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/40"
              />
              <StatCard
                label="Topic Progress"
                value={`${topicData.progressPercentage || 0}%`}
                icon={FiZap}
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
              />
            </div>
          )}

          {/* Section Header */}
          <SectionHeader
            title="Learning Pathways"
            subtitle={`Structured learning tracks and practice arenas for ${topicData?.name || topicName}`}
          />

          {/* Pathways 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pathways.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  to={`/student/coding/${topicId}/${item.slug}`}
                  key={item.title}
                  className="card card-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badge}
                      </Badge>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Explore Pathway</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingTopic;
