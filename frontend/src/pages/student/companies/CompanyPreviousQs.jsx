import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiSearch,
  FiFilter,
  FiRotateCcw,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiClock
} from 'react-icons/fi';

const CompanyPreviousQs = () => {
  const { companyId } = useParams();
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const questions = useMemo(() => [
    {
      id: 1,
      category: 'quantitative',
      categoryLabel: 'Quantitative Aptitude',
      year: 'Drive 2025',
      difficulty: 'Medium',
      question: `A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the total length of the train in meters?`,
      options: ['120 meters', '150 meters', '180 meters', '324 meters'],
      correctAnswer: 1, // 150 meters
      explanation: `Speed = 60 km/hr = 60 * (5/18) m/sec = 50/3 m/sec. Distance (length of train) = Speed * Time = (50/3) * 9 = 150 meters.`,
      tag: 'Speed, Time & Distance',
    },
    {
      id: 2,
      category: 'logical',
      categoryLabel: 'Logical Reasoning',
      year: 'Drive 2025',
      difficulty: 'Easy',
      question: `Find the missing number in the sequence: 4, 9, 25, 49, 121, ___ ?`,
      options: ['144', '169', '196', '225'],
      correctAnswer: 1, // 169
      explanation: `The numbers are squares of consecutive prime numbers: 2^2=4, 3^2=9, 5^2=25, 7^2=49, 11^2=121, 13^2=169.`,
      tag: 'Number Series',
    },
    {
      id: 3,
      category: 'technical',
      categoryLabel: 'Technical Fundamentals',
      year: 'Drive 2024',
      difficulty: 'Medium',
      question: `In C/C++, what is the output of printf("%d", sizeof(void*)) on a standard 64-bit operating system architecture?`,
      options: ['2 bytes', '4 bytes', '8 bytes', '16 bytes'],
      correctAnswer: 2, // 8 bytes
      explanation: `On any standard 64-bit architecture, pointers of all types (including void pointers) require 64 bits (8 bytes) of address space.`,
      tag: 'Pointers & Memory',
    },
    {
      id: 4,
      category: 'quantitative',
      categoryLabel: 'Quantitative Aptitude',
      year: 'Drive 2024',
      difficulty: 'Hard',
      question: `A and B can complete a work in 12 days, B and C in 15 days, and C and A in 20 days. How many days will A alone take to finish the complete work?`,
      options: ['20 days', '30 days', '40 days', '60 days'],
      correctAnswer: 1, // 30 days
      explanation: `2(A + B + C)'s 1 day work = 1/12 + 1/15 + 1/20 = (5 + 4 + 3)/60 = 12/60 = 1/5. (A + B + C) = 1/10. A's 1 day work = (A + B + C) - (B + C) = 1/10 - 1/15 = (3 - 2)/30 = 1/30. So A alone takes 30 days.`,
      tag: 'Time & Work',
    },
    {
      id: 5,
      category: 'verbal',
      categoryLabel: 'Verbal Ability',
      year: 'Drive 2024',
      difficulty: 'Easy',
      question: `Choose the exact antonym for the word 'CANDID':`,
      options: ['Blunt', 'Deceitful', 'Frank', 'Outspoken'],
      correctAnswer: 1, // Deceitful
      explanation: `'Candid' means truthful, frank, and straightforward. Its direct antonym is 'Deceitful' or secretive.`,
      tag: 'Vocabulary & Antonyms',
    },
    {
      id: 6,
      category: 'technical',
      categoryLabel: 'Technical Fundamentals',
      year: 'Drive 2023',
      difficulty: 'Medium',
      question: `Which normal form is strictly based on the concept of 'Transitive Functional Dependency' in relational database design?`,
      options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
      correctAnswer: 2, // 3NF
      explanation: `A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key.`,
      tag: 'DBMS Normalization',
    },
  ], []);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'quantitative', label: 'Quantitative' },
    { id: 'logical', label: 'Logical Reasoning' },
    { id: 'technical', label: 'Technical MCQs' },
    { id: 'verbal', label: 'Verbal Ability' },
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = activeCategory === 'all' || q.category === activeCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const toggleExplanation = (qId) => {
    setShowExplanation((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowExplanation({});
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(
    ([qId, ansIdx]) => {
      const q = questions.find((item) => item.id === parseInt(qId, 10));
      return q && q.correctAnswer === ansIdx;
    }
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} - Previous Questions`}
          subtitle={`Authentic question archives compiled from past ${companyName} on-campus and national recruitment drives.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName, to: `/student/company-prep/${companyId}` },
            { label: 'Previous Questions' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              {answeredCount > 0 && (
                <button
                  onClick={handleReset}
                  className="btn-secondary text-xs"
                  title="Reset practice responses"
                >
                  <FiRotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ({answeredCount})</span>
                </button>
              )}
              <Link
                to={`/student/company-prep/${companyId}`}
                className="btn-secondary"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </Link>
            </div>
          }
        />

        {/* Progress & Stats Bar */}
        <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Practice Progress</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {answeredCount} of {questions.length} Attempted
                {answeredCount > 0 && (
                  <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ({correctCount} Correct)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Completion</span>
              <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill bg-indigo-600"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
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
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs py-2"
            />
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          <SectionHeader
            title="Archived Questions"
            subtitle={`Showing ${filteredQuestions.length} questions matching your criteria`}
            badge={`${filteredQuestions.length} Questions`}
          />

          {filteredQuestions.length === 0 ? (
            <div className="card p-8 text-center">
              <FiHelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No questions found</h3>
              <p className="text-xs text-gray-500 mt-1">Try selecting a different category or clearing your search.</p>
            </div>
          ) : (
            filteredQuestions.map((q, index) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const selectedIdx = selectedAnswers[q.id];
              const isCorrect = isAnswered && selectedIdx === q.correctAnswer;
              const isExplanationOpen = showExplanation[q.id] || isAnswered;

              return (
                <div
                  key={q.id}
                  className="card p-5 sm:p-6 transition-all hover:border-gray-300 dark:hover:border-gray-700"
                >
                  {/* Card Header & Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge-primary text-[11px]">
                        {q.categoryLabel}
                      </span>
                      <span className="badge-neutral text-[11px]">
                        {q.year}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400">
                        • {q.tag}
                      </span>
                    </div>

                    <span
                      className={`badge text-[11px] ${
                        q.difficulty === 'Easy'
                          ? 'badge-success'
                          : q.difficulty === 'Medium'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug mb-4">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2 font-bold">
                      Q{index + 1}.
                    </span>
                    {q.question}
                  </h3>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = selectedIdx === optIdx;
                      const isThisCorrect = optIdx === q.correctAnswer;

                      let optionStyle =
                        'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30';

                      if (isAnswered) {
                        if (isOptionSelected) {
                          optionStyle = isThisCorrect
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                            : 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 ring-1 ring-rose-500';
                        } else if (isThisCorrect) {
                          optionStyle =
                            'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-lg border text-left text-xs sm:text-sm font-medium transition-colors flex items-start justify-between gap-2 cursor-pointer ${optionStyle}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs flex items-center justify-center shrink-0 font-semibold">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="mt-0.5">{option}</span>
                          </div>

                          {isAnswered && isOptionSelected && (
                            <span className="shrink-0 mt-0.5">
                              {isThisCorrect ? (
                                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <FiXCircle className="w-4 h-4 text-rose-600" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Solution Footer */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleExplanation(q.id)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <FiHelpCircle className="w-3.5 h-3.5" />
                        <span>{isExplanationOpen ? 'Hide Explanation' : 'View Explanation'}</span>
                        {isExplanationOpen ? (
                          <FiChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <FiChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isAnswered && (
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCorrect ? 'Correct Answer!' : 'Incorrect Choice'}
                        </span>
                      )}
                    </div>

                    {isExplanationOpen && (
                      <div className="mt-2 p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in">
                        <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Detailed Solution & Logic:</span>
                        </div>
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyPreviousQs;
