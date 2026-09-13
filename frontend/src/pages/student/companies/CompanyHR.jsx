import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiAward,
  FiBookOpen,
  FiTarget,
  FiSmile,
  FiCompass
} from 'react-icons/fi';

const CompanyHR = () => {
  const { companyId } = useParams();
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hrQuestions = useMemo(() => [
    {
      id: 1,
      category: 'cultural',
      categoryLabel: 'Motivation & Fit',
      question: `Why do you specifically want to join ${companyName}?`,
      hint: `Focus on their recent technology initiatives, digital transformation projects, open learning culture, and how their core values resonate with your personal career journey.`,
      framework: 'Research + Alignment',
      modelAnswer: `Mention 2 specific things: First, their active contributions or client work in emerging domains (e.g. Cloud/AI/Enterprise Software). Second, their structured training and mentorship programs for fresh graduates. Conclude by articulating how your background in problem solving enables you to contribute from day one.`,
      avoid: `Don't give generic answers like "It's a big MNC with good salary." Show genuine company-specific research.`,
      tag: 'Company Motivation',
    },
    {
      id: 2,
      category: 'behavioral',
      categoryLabel: 'Behavioral (STAR)',
      question: `Tell me about a time you handled an extremely tight deadline or high-pressure academic project.`,
      hint: `Structure your story using the STAR framework: Situation, Task, Action, and Result. Highlight proactive planning, communication, and composure.`,
      framework: 'STAR Method',
      modelAnswer: `(S) During our 5th-semester project submission, our team had 48 hours to fix a major database integration bug. (T) As the backend lead, I was responsible for stabilizing the API. (A) I prioritized critical user flows, set up modular unit tests, and redistributed tasks among teammates. (R) We deployed 6 hours ahead of the deadline with 100% test coverage and earned an 'A' grade.`,
      avoid: `Don't blame teammates or panic. Focus on ownership, calm decision making, and measurable outcomes.`,
      tag: 'Stress Management',
    },
    {
      id: 3,
      category: 'career',
      categoryLabel: 'Career Vision',
      question: `Where do you see yourself in the next 3 to 5 years at ${companyName}?`,
      hint: `Align your personal learning curve with the organization's growth paths — transitioning from junior developer to full-stack specialist or team module lead.`,
      framework: 'Growth Trajectory',
      modelAnswer: `In the initial 1-2 years, my priority is to master the tech stack, understand business domain requirements, and write production-grade code with zero defect leakage. Over 3-5 years, I aspire to take ownership of end-to-end modules, mentor newer associates, and contribute to system architecture discussions.`,
      avoid: `Don't express immediate plans for higher studies or switching companies. Emphasize continuous internal contribution.`,
      tag: 'Long-Term Goals',
    },
    {
      id: 4,
      category: 'behavioral',
      categoryLabel: 'Teamwork & Conflict',
      question: `Describe a situation where you had a disagreement with a team member. How was it resolved?`,
      hint: `Demonstrate empathy, active listening, objective data-driven evaluation, and putting team objectives ahead of personal egos.`,
      framework: 'STAR Method',
      modelAnswer: `In a hackathon, my teammate and I disagreed on whether to use SQL or NoSQL. Instead of arguing, we listed our data models and query frequencies. The evaluation proved relational queries suited our transaction model better. We mutually agreed, implemented the schema, and won the runner-up prize.`,
      avoid: `Never portray yourself as always right or the other person as unreasonable. Highlight mutual compromise and collaboration.`,
      tag: 'Collaboration',
    },
    {
      id: 5,
      category: 'situational',
      categoryLabel: 'Situational',
      question: `What are your biggest strengths and what is one genuine area of improvement?`,
      hint: `State technical & logical strengths backed by examples; for weakness, mention a real area you are actively working to improve.`,
      framework: 'Self-Awareness',
      modelAnswer: `Strength: Rapid adaptability to new technologies and strong debugging discipline. Improvement Area: Early on, I hesitated to delegate tasks during group assignments. I have since started using Trello and sprint boards, which improved my delegation and trust in teammates.`,
      avoid: `Avoid fake weaknesses like "I am too perfectionist" or critical red flags like "I miss deadlines."`,
      tag: 'Self Evaluation',
    },
    {
      id: 6,
      category: 'situational',
      categoryLabel: 'Flexibility & Shifts',
      question: `Are you comfortable with relocation, working in rotational shifts, or adopting new programming languages?`,
      hint: `Confirm full flexibility and express excitement about exploring new cities and emerging tech stacks.`,
      framework: 'Adaptability',
      modelAnswer: `Yes, absolutely. As a technology graduate beginning my professional journey, I welcome the opportunity to relocate, experience diverse project environments, and quickly pick up whichever programming language or framework best suits our client deliverables.`,
      avoid: `Avoid showing resistance to standard campus deployment policies.`,
      tag: 'Job Flexibility',
    },
  ], [companyName]);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'motivation', label: 'Motivation & Fit', key: 'cultural' },
    { id: 'behavioral', label: 'Behavioral & STAR', key: 'behavioral' },
    { id: 'career', label: 'Career Vision', key: 'career' },
    { id: 'situational', label: 'Situational', key: 'situational' },
  ];

  const filteredQuestions = hrQuestions.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      (activeCategory === 'motivation' && item.category === 'cultural');
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} - HR & Behavioral Questions`}
          subtitle={`Curated cultural fit questions, behavioral scenarios, and STAR response frameworks tailored for ${companyName}.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName, to: `/student/company-prep/${companyId}` },
            { label: 'HR Questions' },
          ]}
          actions={
            <Link
              to={`/student/company-prep/${companyId}`}
              className="btn-secondary"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Hub</span>
            </Link>
          }
        />

        {/* STAR Framework Cheat Sheet Banner */}
        <div className="card p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-transparent">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  Interview Technique
                </span>
                <span className="text-xs text-purple-200">Behavioral Standard</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Mastering the STAR Response Method
              </h3>
              <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
                Interviewers at {companyName} look for structured evidence of your past performance to predict future job success.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg text-center">
                <div className="text-xs font-bold text-purple-300">S — Situation</div>
                <div className="text-[10px] text-gray-300 mt-0.5">Set the context</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg text-center">
                <div className="text-xs font-bold text-purple-300">T — Task</div>
                <div className="text-[10px] text-gray-300 mt-0.5">Define your role</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg text-center">
                <div className="text-xs font-bold text-purple-300">A — Action</div>
                <div className="text-[10px] text-gray-300 mt-0.5">Steps you took</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-lg text-center">
                <div className="text-xs font-bold text-purple-300">R — Result</div>
                <div className="text-[10px] text-gray-300 mt-0.5">Quantified output</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="tab-list overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs whitespace-nowrap ${
                  activeCategory === cat.id ? 'tab-item-active' : 'tab-item'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search HR questions or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs py-2"
            />
          </div>
        </div>

        {/* HR Questions Section */}
        <div className="space-y-4">
          <SectionHeader
            title="Core Behavioral & Cultural Fit Questions"
            subtitle={`Review suggested response strategies and model answers for ${companyName}`}
            badge={`${filteredQuestions.length} Questions`}
          />

          {filteredQuestions.map((item, index) => {
            const isExpanded = expandedIndex === item.id;

            return (
              <div
                key={item.id}
                className="card p-5 sm:p-6 transition-all hover:border-gray-300 dark:hover:border-gray-700"
              >
                {/* Badges & Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="badge-primary text-[11px]">
                      {item.categoryLabel}
                    </span>
                    <span className="badge-neutral text-[11px]">
                      {item.framework}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">
                      • {item.tag}
                    </span>
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug mb-3">
                  <span className="text-purple-600 dark:text-purple-400 font-bold mr-2">
                    Q{index + 1}:
                  </span>
                  {item.question}
                </h3>

                {/* Hint Callout */}
                <div className="text-xs text-purple-800 dark:text-purple-300 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-lg border border-purple-100 dark:border-purple-900/40 flex items-start gap-2 mb-4">
                  <FiCompass className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <span className="font-semibold">Strategy Hint: </span>
                    {item.hint}
                  </div>
                </div>

                {/* Model Answer Expandable Section */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between w-full"
                  >
                    <span className="flex items-center gap-1.5">
                      <FiBookOpen className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Model Response' : 'View Model Response & Breakdown'}</span>
                    </span>
                    {isExpanded ? (
                      <FiChevronUp className="w-4 h-4" />
                    ) : (
                      <FiChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 pt-2 animate-fade-in text-xs leading-relaxed">
                      {/* Model Answer */}
                      <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Recommended Response Outline:</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{item.modelAnswer}</p>
                      </div>

                      {/* What to avoid */}
                      <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300">
                        <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                          <FiAlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Common Pitfall to Avoid:</span>
                        </div>
                        <p>{item.avoid}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyHR;
