import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { FiArrowLeft, FiCode, FiBookOpen, FiFileText, FiMessageCircle, FiList, FiCheckSquare } from 'react-icons/fi';

const LanguagePractice = () => {
  const { langId } = useParams();
  const langName = langId ? langId.charAt(0).toUpperCase() + langId.slice(1) : 'Language';

  const tracks = [
    { title: "Syntax Notes & Rules", desc: `In-depth language syntax, memory allocation, and core standard libraries for ${langName}.`, icon: FiFileText, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40" },
    { title: "Solved Code Examples", desc: `Boilerplate paradigms, pattern implementations, and reference code snippets in ${langName}.`, icon: FiBookOpen, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" },
    { title: "Interview Questions", desc: `Curated technical interview questions asked by top tech recruiters for ${langName}.`, icon: FiMessageCircle, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40" },
    { title: "Theoretical MCQs", desc: `Multiple-choice conceptual questions to test compilation and runtime fundamentals.`, icon: FiList, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40" },
    { title: "Timed Assessment Quiz", desc: `Speed-based diagnostic assessment evaluating comprehensive ${langName} mastery.`, icon: FiCheckSquare, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40" },
    { title: "Interactive Problem Arena", desc: `Execute code live in the browser IDE against hidden unit tests in ${langName}.`, icon: FiCode, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title={`${langName} Preparation Hub`}
        subtitle="Select a focused learning pathway to build technical mastery and interview readiness."
        breadcrumbs={[
          { label: 'Programming Languages', to: '/student/languages' },
          { label: langName, to: `/student/languages/${langId}` }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((item) => (
          <div
            key={item.title}
            className="card-interactive p-5 flex flex-col justify-between group"
          >
            <div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3.5 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                Launch Track →
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default LanguagePractice;
