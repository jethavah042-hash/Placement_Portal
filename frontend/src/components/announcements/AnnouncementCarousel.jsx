import React, { useState, useEffect, useRef } from 'react';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementModal from './AnnouncementModal';
import { getPublishedAnnouncementsRequest } from '../../api/announcement';
import {
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiBriefcase,
  FiInbox,
  FiRefreshCw
} from 'react-icons/fi';

const AnnouncementCarousel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const timerRef = useRef(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPublishedAnnouncementsRequest();
      if (res.data.success) {
        setAnnouncements(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Unable to load latest announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const total = announcements.length;

  // Auto slide effect
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleOpenDetails = (ann) => {
    setSelectedAnnouncement(ann);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="mb-8">
      {/* Section Header with Next/Prev Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-extrabold shadow-sm">
            <FiBriefcase />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Company Requirements & Notices
              </h2>
              {total > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {total} Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live campus recruitment drives, eligibility rules, and CTC packages from visiting companies.
            </p>
          </div>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm active:scale-95"
              title="Previous Announcement (Left)"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm active:scale-95"
              title="Next Announcement (Right)"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="hidden md:block h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchAnnouncements}
            className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold flex items-center gap-1 hover:bg-red-700"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && total === 0 && (
        <div className="py-12 px-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto text-xl">
            <FiInbox />
          </div>
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            No new announcements at the moment.
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Upcoming campus recruitment notices and requirements posted by the placement cell will appear here automatically.
          </p>
        </div>
      )}

      {/* Carousel Arena with Left -> Right / Right -> Left Sliding Window */}
      {!loading && !error && total > 0 && (
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slide Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ease-in-out">
            {/* Primary Card */}
            <div className="transition-transform duration-500">
              <AnnouncementCard
                announcement={announcements[currentIndex]}
                onViewDetails={handleOpenDetails}
              />
            </div>

            {/* Secondary Card (Shown on md+ screens) */}
            <div className="hidden md:block transition-transform duration-500">
              <AnnouncementCard
                announcement={announcements[(currentIndex + 1) % total]}
                onViewDetails={handleOpenDetails}
              />
            </div>
          </div>

          {/* Pagination Dots */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-1">
              {announcements.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-6 bg-indigo-600 dark:bg-indigo-500'
                      : 'w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Details Modal */}
      <AnnouncementModal
        announcement={selectedAnnouncement}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default AnnouncementCarousel;
