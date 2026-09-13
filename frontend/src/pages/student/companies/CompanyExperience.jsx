import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiMessageSquare,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiBriefcase,
  FiSearch,
  FiFilter,
  FiPlusCircle,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiTrendingUp,
  FiThumbsUp,
  FiShare2,
  FiCalendar
} from 'react-icons/fi';

const CompanyExperience = () => {
  const { companyId } = useParams();
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const [activeVerdictFilter, setActiveVerdictFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedJournal, setExpandedJournal] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  // New experience form state
  const [newExp, setNewExp] = useState({
    name: '',
    role: '',
    verdict: 'Selected',
    roundSummary: '',
    keyAdvice: '',
  });

  const initialExperiences = useMemo(() => [
    {
      id: 1,
      name: 'Rahul Sharma',
      role: 'Associate System Engineer',
      batch: '2025 On-Campus Drive',
      verdict: 'Selected',
      verdictClass: 'badge-success',
      avatarColor: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
      summary: `The TR round lasted 45 minutes. They dug really deep into my DBMS project and asked me to write down complex SQL joins. Overall, the interviewer was very friendly.`,
      rounds: [
        { name: 'Round 1: Cognitive & Tech Assessment', detail: '60 MCQs (Quant + Verbal + Pseudocode). Speed and accuracy were paramount. Cleared cutoff comfortably.' },
        { name: 'Round 2: Technical Interview (45 Mins)', detail: 'Asked to explain normalization up to BCNF, reverse a linked list on paper, and write SQL queries for 2nd highest salary.' },
        { name: 'Round 3: HR & Fitment Round (20 Mins)', detail: 'Discussion on relocation preferences, MCA curriculum projects, and situational teamwork questions.' },
      ],
      keyAdvice: 'Be 100% honest about what you list on your resume. If you mention a framework, be ready for architectural deep-dives.',
      helpfulCount: 42,
    },
    {
      id: 2,
      name: 'Priya Kothari',
      role: 'Graduate Software Developer',
      batch: '2025 National Hiring Drive',
      verdict: 'Selected',
      verdictClass: 'badge-success',
      avatarColor: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
      summary: `I was asked mostly about OOP concepts, string manipulation algorithms, and a standard logic puzzle. The HR round was quick and focused on my willingness to relocate and work in agile sprints.`,
      rounds: [
        { name: 'Round 1: Online Coding Test', detail: '2 DSA questions: 1 Easy String problem and 1 Medium DP problem. Cleared 100% test cases.' },
        { name: 'Round 2: Technical Panel (50 Mins)', detail: 'Diving into Polymorphism, Abstract classes vs Interfaces, and two-pointer array optimization.' },
        { name: 'Round 3: HR & Managerial (15 Mins)', detail: 'Standard behavioral questions evaluated using the STAR framework.' },
      ],
      keyAdvice: 'Practice coding out loud. The interviewers care more about your step-by-step logic than immediate flawless syntax.',
      helpfulCount: 38,
    },
    {
      id: 3,
      name: 'Aman Verma',
      role: 'Cloud Operations Trainee',
      batch: '2024 Off-Campus Drive',
      verdict: 'Selected',
      verdictClass: 'badge-success',
      avatarColor: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
      summary: `Heavy focus on Linux commands, OSI model networking layers, and basic Docker concepts. They tested my problem-solving approach through a server outage scenario.`,
      rounds: [
        { name: 'Round 1: Technical & Aptitude Exam', detail: 'Included networking fundamentals, cloud basics, and quantitative reasoning.' },
        { name: 'Round 2: Technical Discussion (40 Mins)', detail: 'Networking routing protocols, troubleshooting HTTP 502/504 errors, and simple shell script.' },
        { name: 'Round 3: HR Interview (15 Mins)', detail: 'Checked flexibility for 24/7 rotational project support shifts and location preferences.' },
      ],
      keyAdvice: 'Review computer networking basics and basic shell commands thoroughly alongside your programming language.',
      helpfulCount: 29,
    },
  ], []);

  const [experiences, setExperiences] = useState(initialExperiences);

  const filteredExperiences = experiences.filter((exp) => {
    const matchesVerdict = activeVerdictFilter === 'all' || exp.verdict === activeVerdictFilter;
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.keyAdvice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVerdict && matchesSearch;
  });

  const toggleJournal = (id) => {
    setExpandedJournal(expandedJournal === id ? null : id);
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!newExp.name || !newExp.role || !newExp.roundSummary) return;

    const created = {
      id: experiences.length + 1,
      name: newExp.name,
      role: newExp.role,
      batch: 'Recent Campus Drive',
      verdict: newExp.verdict,
      verdictClass: newExp.verdict === 'Selected' ? 'badge-success' : 'badge-warning',
      avatarColor: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300',
      summary: newExp.roundSummary,
      rounds: [
        { name: 'Interview Stages', detail: newExp.roundSummary },
      ],
      keyAdvice: newExp.keyAdvice || 'Focus on fundamentals and remain confident throughout.',
      helpfulCount: 1,
    };

    setExperiences([created, ...experiences]);
    setShowShareModal(false);
    setSubmittedMessage(true);
    setNewExp({ name: '', role: '', verdict: 'Selected', roundSummary: '', keyAdvice: '' });
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} - Interview Experiences`}
          subtitle={`Real candidate interview journals, round breakdowns, and first-hand recommendations from students placed at ${companyName}.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName, to: `/student/company-prep/${companyId}` },
            { label: 'Interview Experience' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="btn-primary text-xs"
              >
                <FiPlusCircle className="w-3.5 h-3.5" />
                <span>Share Experience</span>
              </button>
              <Link
                to={`/student/company-prep/${companyId}`}
                className="btn-secondary text-xs"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </Link>
            </div>
          }
        />

        {/* Success Alert if submitted */}
        {submittedMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your interview journal has been submitted and published for peers.</span>
            </div>
            <button onClick={() => setSubmittedMessage(false)} className="text-emerald-600 hover:text-emerald-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FiMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Journals</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{experiences.length} Verified</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FiAward className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Selection Rate</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">~85% Positive</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Avg. TR Duration</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">45 Minutes</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Key Focus</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">DBMS & Project</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="tab-list">
            {['all', 'Selected'].map((v) => (
              <button
                key={v}
                onClick={() => setActiveVerdictFilter(v)}
                className={`text-xs capitalize ${
                  activeVerdictFilter === v ? 'tab-item-active' : 'tab-item'
                }`}
              >
                {v === 'all' ? 'All Experiences' : `${v} Candidates`}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, role, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs py-2"
            />
          </div>
        </div>

        {/* Experiences List */}
        <div className="space-y-4">
          <SectionHeader
            title="Candidate Experience Archives"
            subtitle={`Showing ${filteredExperiences.length} interview records for ${companyName}`}
            badge={`${filteredExperiences.length} Records`}
          />

          {filteredExperiences.length === 0 ? (
            <div className="card p-8 text-center">
              <FiUser className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No interview experiences found</h3>
              <p className="text-xs text-gray-500 mt-1">Try clearing your search query or submit the first experience.</p>
            </div>
          ) : (
            filteredExperiences.map((item) => {
              const isExpanded = expandedJournal === item.id;

              return (
                <div
                  key={item.id}
                  className="card p-5 sm:p-6 transition-all hover:border-gray-300 dark:hover:border-gray-700 space-y-4"
                >
                  {/* Candidate Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${item.avatarColor}`}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <span className="badge-neutral text-[10px]">
                            {item.batch}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <FiBriefcase className="w-3 h-3 text-gray-400" />
                          <span>{item.role}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`badge ${item.verdictClass} text-xs font-semibold`}>
                      {item.verdict}
                    </span>
                  </div>

                  {/* Summary Transcript */}
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-lg border border-gray-100 dark:border-gray-800/80 italic">
                    &ldquo;{item.summary}&rdquo;
                  </div>

                  {/* Expandable Detailed Breakdown */}
                  <div>
                    <button
                      onClick={() => toggleJournal(item.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between w-full"
                    >
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Round Details' : 'View Round-by-Round Breakdown & Advice'}</span>
                      </span>
                      {isExpanded ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 animate-fade-in text-xs">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">Selection Stage Breakdown:</h4>
                          {item.rounds.map((r, rIdx) => (
                            <div key={rIdx} className="p-2.5 rounded bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                              <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">{r.name}</div>
                              <p className="text-gray-600 dark:text-gray-300">{r.detail}</p>
                            </div>
                          ))}
                        </div>

                        {item.keyAdvice && (
                          <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-300">
                            <span className="font-semibold block mb-0.5">Key Candidate Advice:</span>
                            <p>{item.keyAdvice}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Share Experience Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal-content max-w-lg p-5 sm:p-6 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Share Your {companyName} Experience
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Help junior peers prepare effectively for campus placement drives.</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="btn-icon"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleShareSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="input-label">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newExp.name}
                    onChange={(e) => setNewExp({ ...newExp, name: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Offered Role</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer"
                      value={newExp.role}
                      onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="input-label">Drive Outcome</label>
                    <select
                      value={newExp.verdict}
                      onChange={(e) => setNewExp({ ...newExp, verdict: e.target.value })}
                      className="input text-xs"
                    >
                      <option value="Selected">Selected</option>
                      <option value="Under Review">Under Review / Waitlist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="input-label">Interview Rounds & Transcript Summary</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Briefly describe the technical questions asked, topics covered, and panel interaction..."
                    value={newExp.roundSummary}
                    onChange={(e) => setNewExp({ ...newExp, roundSummary: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="input-label">Advice for Candidates (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on SQL indexing and stay calm."
                    value={newExp.keyAdvice}
                    onChange={(e) => setNewExp({ ...newExp, keyAdvice: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs"
                  >
                    Submit Experience
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyExperience;
