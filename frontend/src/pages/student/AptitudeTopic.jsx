import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import Badge from '../../components/ui/Badge';
import { getAptitudeTopicDetailsRequest } from '../../api/aptitude';
import {
  FiArrowLeft,
  FiFileText,
  FiList,
  FiCheckSquare,
  FiTarget,
  FiPieChart,
  FiBookOpen,
  FiArrowRight
} from 'react-icons/fi';

const AptitudeTopic = () => {
  const { topicId } = useParams();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await getAptitudeTopicDetailsRequest(topicId);
        if (data.success) {
          setTopicData(data.data);
        }
      } catch (err) {
        console.error('Error fetching topic details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [topicId]);

  const topicName = topicData?.name || (topicId 
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aptitude Topic');

  const tracks = [
    {
      title: "Notes & Concepts",
      slug: "notes",
      desc: `Theoretical formulas, shortcuts, and solved examples for ${topicName}.`,
      icon: FiFileText,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      badge: "Formulas & Tricks",
      badgeVariant: "primary",
    },
    {
      title: "Topic MCQs",
      slug: "mcqs",
      desc: `Practice untimed, topic-wise questions with instant answers and explanations.`,
      icon: FiList,
      iconBg: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-600 dark:text-amber-400",
      badge: "Practice Mode",
      badgeVariant: "warning",
    },
    {
      title: "Topic Quiz",
      slug: "quiz",
      desc: `Take a 10-question timed quiz to test your speed and concept retention.`,
      icon: FiCheckSquare,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      badge: "10-Min Quiz",
      badgeVariant: "success",
    },
    {
      title: "Full Mock Test",
      slug: "mock-test",
      desc: `Attempt the 30-question balanced Aptitude exam with 30-minute timer.`,
      icon: FiTarget,
      iconBg: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-600 dark:text-rose-400",
      badge: "30-Q Standard",
      badgeVariant: "danger",
    },
    {
      title: "Result Analysis",
      slug: "results",
      desc: `Analyze your past Aptitude attempts, accuracy rates, and answer keys.`,
      icon: FiPieChart,
      iconBg: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      badge: "Performance",
      badgeVariant: "neutral",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={topicName}
          subtitle={
            topicData?.questionCount
              ? `${topicData.questionCount} Questions in Question Bank`
              : 'Select a study track below to begin practicing.'
          }
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            { label: topicName }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link
                to="/student/aptitude"
                className="btn-secondary"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>All Topics</span>
              </Link>
              <Link
                to={`/student/aptitude/${topicId}/notes`}
                className="btn-primary"
              >
                <FiBookOpen className="w-4 h-4" />
                <span>Study Notes</span>
              </Link>
            </div>
          }
        />

        {loading ? (
          <LoadingState variant="page" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((item) => (
              <Link
                to={`/student/aptitude/${topicId}/${item.slug}`}
                key={item.title}
                className="card card-hover p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <Badge variant={item.badgeVariant}>
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
                  <span>Open Section</span>
                  <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AptitudeTopic;
