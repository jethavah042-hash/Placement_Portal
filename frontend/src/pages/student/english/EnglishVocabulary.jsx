import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SearchBar from '../../../components/ui/SearchBar';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentEnglishVocabularyRequest,
  toggleStudentEnglishVocabularyLearnedRequest,
  toggleStudentEnglishBookmarkRequest
} from '../../../api/english';
import {
  FiBookmark,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const EnglishVocabulary = () => {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [partOfSpeech, setPartOfSpeech] = useState('All');
  const [learnedFilter, setLearnedFilter] = useState('all'); // all, learned, unlearned
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [totalLearned, setTotalLearned] = useState(0);

  const [togglingId, setTogglingId] = useState(null);

  const fetchVocabulary = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: 12, learnedFilter };
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (partOfSpeech !== 'All') params.partOfSpeech = partOfSpeech;
      if (search) params.search = search;

      const res = await getStudentEnglishVocabularyRequest(params);
      if (res.data.success) {
        setVocabList(res.data.data || []);
        setTotalWords(res.data.total || 0);
        setTotalLearned(res.data.totalLearned || 0);
        setTotalPages(res.data.pages || 1);
        setPage(res.data.page || currentPage);
      }
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
      setError('Unable to load vocabulary bank.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary(page);
  }, [page, difficulty, partOfSpeech, learnedFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e?.preventDefault) e.preventDefault();
    setPage(1);
    fetchVocabulary(1);
  };

  const handleToggleLearned = async (id) => {
    setTogglingId(id);
    try {
      const res = await toggleStudentEnglishVocabularyLearnedRequest(id);
      if (res.data.success) {
        setVocabList(prev =>
          prev.map(v => (v._id === id ? { ...v, isLearned: res.data.isLearned } : v))
        );
        setTotalLearned(p => (res.data.isLearned ? p + 1 : Math.max(0, p - 1)));
      }
    } catch (err) {
      console.error('Error toggling learned status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      const res = await toggleStudentEnglishBookmarkRequest({
        itemId: id,
        itemType: 'Vocabulary'
      });
      if (res.data.success) {
        setVocabList(prev =>
          prev.map(v => (v._id === id ? { ...v, isBookmarked: res.data.isBookmarked } : v))
        );
      }
    } catch (err) {
      console.error('Error bookmarking word:', err);
    }
  };

  const masteryPercent = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="GRE & Placement Vocabulary Trainer"
        subtitle="Master high-frequency placement words, contextual examples, synonyms, antonyms, and usage."
        breadcrumbs={[
          { label: 'English & Verbal', to: '/student/english' },
          { label: 'Vocabulary' }
        ]}
        actions={
          <div className="card px-4 py-2 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                Mastery Progress
              </span>
              <strong className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {totalLearned} of {totalWords} Learned
              </strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              {masteryPercent}%
            </div>
          </div>
        }
      />

      {/* Filter and Search Ribbon */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="tab-list">
            {[
              { key: 'all', label: 'All' },
              { key: 'unlearned', label: 'To Learn' },
              { key: 'learned', label: 'Learned' }
            ].map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => { setLearnedFilter(f.key); setPage(1); }}
                className={`tab-item ${
                  learnedFilter === f.key
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                    : ''
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="input w-auto text-xs py-2 h-auto"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Part of Speech Dropdown */}
          <select
            value={partOfSpeech}
            onChange={(e) => { setPartOfSpeech(e.target.value); setPage(1); }}
            className="input w-auto text-xs py-2 h-auto"
          >
            <option value="All">All Parts of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="idiom">Idiom / Phrase</option>
          </select>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full sm:w-60">
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Search words, meanings..."
              className="w-full"
            />
          </form>
        </div>

        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">
          Showing {vocabList.length} of {totalWords} words
        </span>
      </div>

      {/* Vocabulary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card p-5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchVocabulary(page)} />
      ) : vocabList.length === 0 ? (
        <EmptyState
          title="No vocabulary words found"
          description="Try adjusting your search criteria or resetting filters to view more words."
          action={
            <button
              type="button"
              onClick={() => {
                setDifficulty('All');
                setPartOfSpeech('All');
                setLearnedFilter('all');
                setSearch('');
                setPage(1);
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabList.map(v => {
            const difficultyBadge =
              v.difficulty === 'Easy'
                ? 'badge-success'
                : v.difficulty === 'Medium'
                ? 'badge-primary'
                : 'badge-danger';

            return (
              <div
                key={v._id}
                className={`card p-5 flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  v.isLearned
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                {/* Word Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="badge-neutral uppercase">
                        {v.partOfSpeech}
                      </span>
                      <span className={difficultyBadge}>
                        {v.difficulty}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(v._id)}
                      className="btn-icon text-gray-400 hover:text-amber-500"
                      title={v.isBookmarked ? 'Bookmarked' : 'Bookmark Word'}
                      aria-label="Bookmark Word"
                    >
                      <FiBookmark className={`w-4 h-4 ${v.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                      {v.word}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1 leading-relaxed">
                      {v.meaning}
                    </p>
                  </div>

                  {/* Synonyms */}
                  {v.synonyms?.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                        Synonyms
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {v.synonyms.slice(0, 3).map((s, i) => (
                          <span key={i} className="badge-primary">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example Sentence */}
                  {v.exampleSentence && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                      "{v.exampleSentence}"
                    </p>
                  )}
                </div>

                {/* Action Button: Mark Learned */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleToggleLearned(v._id)}
                    disabled={togglingId === v._id}
                    className={`w-full ${v.isLearned ? 'btn-secondary text-emerald-700 dark:text-emerald-300' : 'btn-primary'}`}
                  >
                    <FiCheckCircle className={`w-4 h-4 ${v.isLearned ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    <span>{v.isLearned ? 'Mastered Word' : 'Mark as Learned'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="card p-4 mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Page {page} of {totalPages} ({totalWords} words total)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <FiChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <span>Next</span>
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishVocabulary;
