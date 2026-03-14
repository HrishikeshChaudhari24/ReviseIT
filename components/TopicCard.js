import Link from 'next/link';

export default function TopicCard({ topic, onDelete }) {
  const strength = topic.schedule?.strength || 'new';
  const nextReview = topic.schedule?.nextReview
    ? new Date(topic.schedule.nextReview)
    : null;

  const isDue = nextReview && nextReview <= new Date();

  const formatDate = (date) => {
    if (!date) return 'Not scheduled';
    const d = new Date(date);
    const now = new Date();
    const diff = d - now;

    if (diff <= 0) return 'Due now';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `In ${days} days`;
  };

  return (
    <div className={`topic-card ${isDue ? 'due' : ''}`}>
      <div className="topic-card-header">
        <h3 className="topic-card-title">{topic.title}</h3>
        <span className={`strength-badge ${strength}`}>
          {strength}
        </span>
      </div>

      {topic.inshort?.oneLiner && (
        <p className="topic-card-oneliner">"{topic.inshort.oneLiner}"</p>
      )}

      {topic.tags?.length > 0 && (
        <div className="topic-card-tags">
          {topic.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="topic-card-footer">
        <span>📅 {formatDate(topic.schedule?.nextReview)}</span>
        <span>⚡ {topic.xpEarned || 0} XP</span>
        {onDelete && (
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onDelete(topic._id); }}
            title="Delete topic"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}
