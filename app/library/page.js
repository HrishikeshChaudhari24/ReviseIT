'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TopicCard from '@/components/TopicCard';
import InshortCard from '@/components/InshortCard';

export default function Library() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load topics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setTopics(topics.filter(t => t._id !== id));
      setDeleteModal(null);
      setSelectedTopic(null);
      showToast('Topic deleted', 'success');
    } catch (error) {
      showToast('Failed to delete topic', 'error');
    }
  };

  // Filter and search
  const filtered = topics.filter(topic => {
    const matchesSearch = search === '' ||
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      topic.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filter === 'all' || topic.schedule?.strength === filter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading your library...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>📚 Topic Library</h2>
        <p>{topics.length} topics in your knowledge base</p>
      </div>

      {topics.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>Your library is empty</h3>
          <p>Start by adding your first topic. Paste any content and let AI create a revision inshort for you.</p>
          <Link href="/add-topic" className="btn btn-primary">
            ✏️ Add Your First Topic
          </Link>
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="library-toolbar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search topics or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {['all', 'strong', 'medium', 'weak', 'new'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && '📋 All'}
                {f === 'strong' && '🟢 Strong'}
                {f === 'medium' && '🟡 Medium'}
                {f === 'weak' && '🔴 Weak'}
                {f === 'new' && '🟣 New'}
              </button>
            ))}
          </div>

          {/* Topics Grid */}
          {filtered.length > 0 ? (
            <div className="topics-grid">
              {filtered.map(topic => (
                <div key={topic._id} onClick={() => setSelectedTopic(topic)}>
                  <TopicCard
                    topic={topic}
                    onDelete={(id) => { setDeleteModal(id); }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <h3>No matching topics</h3>
              <p>Try a different search or filter.</p>
            </div>
          )}
        </>
      )}

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="topic-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="topic-detail-header">
              <h3>{selectedTopic.title}</h3>
              <button className="btn-icon" onClick={() => setSelectedTopic(null)}>✕</button>
            </div>

            {selectedTopic.tags?.length > 0 && (
              <div className="topic-card-tags" style={{ marginBottom: '16px' }}>
                {selectedTopic.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            )}

            {selectedTopic.inshort ? (
              <InshortCard topic={selectedTopic} showRating={false} />
            ) : (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No inshort generated for this topic yet.</p>
              </div>
            )}

            <div className="topic-detail-info">
              <div className="topic-detail-info-item">
                <span>📅 Next Review</span>
                <span>{selectedTopic.schedule?.nextReview
                  ? new Date(selectedTopic.schedule.nextReview).toLocaleDateString()
                  : 'Not scheduled'
                }</span>
              </div>
              <div className="topic-detail-info-item">
                <span>💪 Strength</span>
                <span className={`strength-badge ${selectedTopic.schedule?.strength || 'new'}`}>
                  {selectedTopic.schedule?.strength || 'new'}
                </span>
              </div>
              <div className="topic-detail-info-item">
                <span>🔄 Reviews</span>
                <span>{selectedTopic.schedule?.reviewCount || 0}</span>
              </div>
              <div className="topic-detail-info-item">
                <span>⚡ XP Earned</span>
                <span>{selectedTopic.xpEarned || 0}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn btn-danger" onClick={() => setDeleteModal(selectedTopic._id)}>
                🗑️ Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedTopic(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Delete Topic?</h3>
            <p>This will permanently remove this topic and its revision history. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' && '✅ '}
          {toast.type === 'error' && '❌ '}
          {toast.message}
        </div>
      )}
    </div>
  );
}
