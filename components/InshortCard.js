export default function InshortCard({ topic, onRate, showRating = true }) {
  if (!topic?.inshort) return null;

  const { inshort, title } = topic;

  return (
    <div className="inshort-card">
      <h2 className="inshort-card-title">{title}</h2>

      {inshort.oneLiner && (
        <p className="inshort-card-oneliner">💡 {inshort.oneLiner}</p>
      )}

      <ul className="inshort-bullets">
        {inshort.bullets?.map((bullet, i) => (
          <li key={i}>{bullet}</li>
        ))}
      </ul>

      {inshort.keyTakeaway && (
        <div className="inshort-takeaway">
          <div className="inshort-takeaway-label">🔑 Key Takeaway</div>
          <p className="inshort-takeaway-text">{inshort.keyTakeaway}</p>
        </div>
      )}

      {showRating && onRate && (
        <div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'center' }}>
            How well did you remember this?
          </p>
          <div className="difficulty-buttons">
            <button className="diff-btn easy" onClick={() => onRate('easy')}>
              <span className="diff-btn-emoji">😊</span>
              Easy
              <span className="diff-btn-label">Got it!</span>
            </button>
            <button className="diff-btn medium" onClick={() => onRate('medium')}>
              <span className="diff-btn-emoji">🤔</span>
              Medium
              <span className="diff-btn-label">Took effort</span>
            </button>
            <button className="diff-btn hard" onClick={() => onRate('hard')}>
              <span className="diff-btn-emoji">😵</span>
              Hard
              <span className="diff-btn-label">Barely recalled</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
