'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/add-topic', label: 'Add Topic', icon: '✏️' },
  { href: '/revision', label: 'Revision', icon: '🧠' },
  { href: '/library', label: 'Library', icon: '📚' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(() => {});
  }, [pathname]);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">🧠</div>
        <h1>ReviseIt</h1>
      </div>

      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {stats && (
        <div className="nav-stats">
          <div className="nav-stat-item">
            <span>🔥 Streak</span>
            <span className="nav-stat-value">{stats.streak} days</span>
          </div>
          <div className="nav-stat-item">
            <span>⚡ XP</span>
            <span className="nav-stat-value">{stats.totalXP}</span>
          </div>
          <div className="nav-stat-item">
            <span>📖 Topics</span>
            <span className="nav-stat-value">{stats.totalTopics}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
