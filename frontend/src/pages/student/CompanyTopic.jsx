import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiBriefcase,
  FiFileText,
  FiUsers,
  FiCode,
  FiMessageSquare,
  FiArrowRight,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
  FiLayers
} from 'react-icons/fi';

const CompanyTopic = () => {
  const { companyId } = useParams();

  // Format slug back to title string
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const tracks = [
    {
      title: 'Placement Process',
      slug: 'process',
      desc: `Detailed recruitment workflow, stage-by-stage selection rounds, timeline, and eligibility criteria for ${companyName}.`,
      icon: FiBriefcase,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      badge: 'Recruitment Blueprint',
      badgeClass: 'badge-primary',
    },
    {
      title: 'Previous Questions',
      slug: 'previous-questions',
      desc: `Archived quantitative aptitude, logical reasoning, and verbal questions asked in past ${companyName} placement drives.`,
      icon: FiFileText,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      badge: 'Past Papers',
      badgeClass: 'badge-neutral',
    },
    {
      title: 'HR Questions',
      slug: 'hr-questions',
      desc: `Frequently asked behavioral questions, cultural fit expectations, and STAR method response guidelines for ${companyName}.`,
      icon: FiUsers,
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      badge: 'Behavioral & STAR',
      badgeClass: 'badge-warning',
    },
    {
      title: 'Coding Questions',
      slug: 'coding-questions',
      desc: `Curated DSA and algorithmic coding challenges standard to ${companyName} technical assessment rounds.`,
      icon: FiCode,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      badge: 'Algorithm Challenges',
      badgeClass: 'badge-success',
    },
    {
      title: 'Interview Experience',
      slug: 'interview-experience',
      desc: `First-hand interview journals, round transcripts, and key advice shared by students placed at ${companyName}.`,
      icon: FiMessageSquare,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      badge: 'Alumni Journals',
      badgeClass: 'badge-neutral',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} Preparation Hub`}
          subtitle={`Structured recruitment roadmaps, authentic previous year question papers, and interview strategy for ${companyName}.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName },
          ]}
          actions={
            <Link
              to="/student/company-prep"
              className="btn-secondary"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>All Companies</span>
            </Link>
          }
        />

        {/* Company Overview Summary Card */}
        <div className="card p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-transparent">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                  Recruitment Blueprint
                </span>
                <span className="text-xs text-indigo-200 flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Syllabus
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Master the {companyName} Hiring Drive
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
                Explore comprehensive track-by-track modules tailored specifically to {companyName}&apos;s current selection pattern, scoring weights, and technical expectations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-lg text-center min-w-[90px]">
                <div className="text-base font-bold text-white">5</div>
                <div className="text-[11px] text-indigo-200 font-medium">Prep Tracks</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-lg text-center min-w-[90px]">
                <div className="text-base font-bold text-white">100%</div>
                <div className="text-[11px] text-indigo-200 font-medium">Authentic Qs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preparation Tracks Section */}
        <div>
          <SectionHeader
            title="Preparation Tracks"
            subtitle="Choose a specialized module to focus your practice and preparation"
            badge="5 Modules"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <Link
                  to={`/student/company-prep/${companyId}/${track.slug}`}
                  key={track.title}
                  className="card card-hover p-5 sm:p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${track.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={track.badgeClass}>
                        {track.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {track.title}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                      {track.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Enter Track</span>
                    <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Preparation Advice Banner */}
        <div className="card p-5 sm:p-6 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Recommended Study Path
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                  Start with the <strong>Placement Process</strong> to understand test patterns, practice <strong>Previous Questions</strong>, then solve <strong>Coding Questions</strong> and prepare your <strong>HR Responses</strong>.
                </p>
              </div>
            </div>
            <Link
              to={`/student/company-prep/${companyId}/process`}
              className="btn-primary shrink-0 text-xs w-full sm:w-auto"
            >
              <span>Start with Process</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyTopic;
