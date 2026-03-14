import ProgressRing from './ProgressRing';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  return (
    <div className="stats-bar">
      <div className="stat-card xp">
        <div className="stat-label">Total XP</div>
        <div className="stat-value">{stats.totalXP}</div>
        <div className="stat-sub">Level {stats.level} • {stats.xpInCurrentLevel}/100 to next</div>
      </div>

      <div className="stat-card streak">
        <div className="stat-label">🔥 Streak</div>
        <div className="stat-value">{stats.streak}</div>
        <div className="stat-sub">consecutive days</div>
      </div>

      <div className="stat-card level">
        <div className="stat-label">Topics Mastered</div>
        <div className="stat-value">{stats.strengthCounts?.strong || 0}</div>
        <div className="stat-sub">of {stats.totalTopics} total</div>
      </div>

      <div className="stat-card due">
        <div className="stat-label">Due Today</div>
        <div className="stat-value">{stats.dueCount}</div>
        <div className="stat-sub">topics waiting</div>
      </div>
    </div>
  );
}
