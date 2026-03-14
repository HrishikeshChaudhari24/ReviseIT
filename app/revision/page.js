'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InshortCard from '@/components/InshortCard';

export default function Revision() {
  const [dueTopics, setDueTopics] = useState([]);
  const [upcomingTopics, setUpcomingTopics] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  const [xpPopup, setXpPopup] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/topics/due').then(r => r.json()),
      fetch('/api/topics').then(r => r.json()),
    ])
      .then(([dueData, allData]) => {
        const due = Array.isArray(dueData) ? dueData : [];
        const all = Array.isArray(allData) ? allData : [];
        setDueTopics(due);

        // Upcoming = topics NOT due yet, sorted by next review date
        const now = new Date();
        const dueIds = new Set(due.map(t => t._id));
        const upcoming = all
          .filter(t => !dueIds.has(t._id) && t.schedule?.nextReview && new Date(t.schedule.nextReview) > now)
          .sort((a, b) => new Date(a.schedule.nextReview) - new Date(b.schedule.nextReview));
        setUpcomingTopics(upcoming);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRate = async (difficulty) => {
    const topic = dueTopics[currentIndex];
    if (!topic || rating) return;

    setRating(true);
    try {
      const res = await fetch(`/api/topics/${topic._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();

      // Show XP popup
      setXpPopup(`+${data.xpEarned} XP`);
      setTimeout(() => setXpPopup(null), 1500);

      // Mark as completed and move to next
      setCompleted([...completed, currentIndex]);

      setTimeout(() => {
        if (currentIndex < dueTopics.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        setRating(false);
      }, 800);
    } catch (error) {
      showToast('Failed to save rating', 'error');
      setRating(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading revision topics...</span>
      </div>
    );
  }

  const allDone = completed.length === dueTopics.length && dueTopics.length > 0;
  const currentTopic = dueTopics[currentIndex];

  return (
    <div>
      <div className="page-header">
        <h2>🧠 Revision Time</h2>
        <p>Review your inshorts and rate how well you remembered each topic.</p>
      </div>

      {/* DUE NOW SECTION */}
      {dueTopics.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px' }}>
          <div className="empty-state-icon">✅</div>
          <h3>All caught up!</h3>
          <p>No topics due for revision right now. Check your upcoming schedule below.</p>
        </div>
      ) : allDone ? (
        <div className="empty-state" style={{ padding: '40px' }}>
          <div className="empty-state-icon">🏆</div>
          <h3>Session Complete!</h3>
          <p>
            You reviewed {dueTopics.length} topic{dueTopics.length > 1 ? 's' : ''}. Great job keeping your knowledge fresh!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary">
              📊 View Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="inshort-container">
          {/* Progress dots */}
          <div className="revision-nav" style={{ marginBottom: '24px' }}>
            <span className="revision-counter">
              {currentIndex + 1} of {dueTopics.length}
            </span>
            <div className="revision-progress">
              {dueTopics.map((_, i) => (
                <div
                  key={i}
                  className={`revision-dot ${
                    completed.includes(i) ? 'completed' : i === currentIndex ? 'current' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Inshort Card */}
          {currentTopic && (
            <InshortCard
              topic={currentTopic}
              onRate={handleRate}
              showRating={!completed.includes(currentIndex)}
            />
          )}

          {/* Skip button */}
          {!completed.includes(currentIndex) && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (currentIndex < dueTopics.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                  }
                }}
                disabled={currentIndex >= dueTopics.length - 1}
              >
                Skip →
              </button>
            </div>
          )}
        </div>
      )}

      {/* UPCOMING SCHEDULE SECTION */}
      {upcomingTopics.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div className="section-title">📅 Upcoming Revision Schedule</div>
          <div className="upcoming-list">
            {upcomingTopics.map(topic => (
              <div key={topic._id} className="upcoming-item">
                <div className="upcoming-item-left">
                  <span className={`strength-badge ${topic.schedule?.strength || 'new'}`}>
                    {topic.schedule?.strength || 'new'}
                  </span>
                  <div>
                    <div className="upcoming-item-title">{topic.title}</div>
                    {topic.inshort?.oneLiner && (
                      <div className="upcoming-item-oneliner">"{topic.inshort.oneLiner}"</div>
                    )}
                  </div>
                </div>
                <div className="upcoming-item-date">
                  {formatDate(topic.schedule.nextReview)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dueTopics.length === 0 && upcomingTopics.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/add-topic" className="btn btn-primary">
            ✏️ Add Your First Topic
          </Link>
        </div>
      )}

      {/* XP Popup */}
      {xpPopup && <div className="xp-popup">{xpPopup}</div>}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'error' && '❌ '}
          {toast.message}
        </div>
      )}
    </div>
  );
}
