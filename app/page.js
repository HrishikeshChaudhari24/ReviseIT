'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsBar from '@/components/StatsBar';
import TopicCard from '@/components/TopicCard';
import ProgressRing from '@/components/ProgressRing';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [dueTopics, setDueTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/topics/due').then(r => r.json()),
    ])
      .then(([statsData, dueData]) => {
        setStats(statsData);
        setDueTopics(Array.isArray(dueData) ? dueData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  const masteryPercent = stats?.totalTopics > 0
    ? Math.round((stats.strengthCounts.strong / stats.totalTopics) * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h2>
          {stats?.streak > 0 ? '🔥' : '👋'}{' '}
          {stats?.streak > 0
            ? `${stats.streak}-day streak! Keep going!`
            : 'Welcome to ReviseIt'}
        </h2>
        <p>Your AI-powered revision companion. Never forget what you learn.</p>
      </div>

      <StatsBar stats={stats} />

      {/* Mastery Progress */}
      {stats?.totalTopics > 0 && (
        <div className="card" style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <ProgressRing progress={masteryPercent} size={90} strokeWidth={8} color="#00d26a" />
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{masteryPercent}% Mastery</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {stats.strengthCounts.strong} strong • {stats.strengthCounts.medium} medium • {stats.strengthCounts.weak} weak • {stats.strengthCounts.new} new
            </p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Level {stats.level} • {stats.xpInCurrentLevel}/100 XP
            </p>
            <div style={{
              height: '6px',
              width: '120px',
              background: 'var(--border-subtle)',
              borderRadius: '3px',
              marginTop: '6px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${stats.xpInCurrentLevel}%`,
                background: 'var(--gradient-purple)',
                borderRadius: '3px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Due Today */}
      <div className="section-title">
        📋 Due for Revision ({dueTopics.length})
      </div>

      {dueTopics.length > 0 ? (
        <>
          <div className="due-grid">
            {dueTopics.slice(0, 6).map(topic => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
          <Link href="/revision" className="btn btn-primary" style={{ marginBottom: '36px' }}>
            🧠 Start Revision ({dueTopics.length} topics)
          </Link>
        </>
      ) : (
        <div className="empty-state" style={{ padding: '40px' }}>
          <div className="empty-state-icon">✅</div>
          <h3>All caught up!</h3>
          <p>No topics due for revision right now. Add new topics or come back later.</p>
          <Link href="/add-topic" className="btn btn-primary">
            ✏️ Add a Topic
          </Link>
        </div>
      )}
    </div>
  );
}
