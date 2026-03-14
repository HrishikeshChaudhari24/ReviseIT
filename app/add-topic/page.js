'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddTopic() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [inshort, setInshort] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both title and content', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate');
      }

      const data = await res.json();
      setInshort(data);
      showToast('Inshort generated! Review it below.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please provide both title and content', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          tags,
          inshort: inshort || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      showToast('Topic saved! First revision tomorrow.', 'success');
      setTimeout(() => router.push('/library'), 1000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>✏️ Add New Topic</h2>
        <p>Paste what you learned and let AI create your revision inshort.</p>
      </div>

      <div className="add-topic-form">
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Topic Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Binary Search Trees, Photosynthesis, React Hooks..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label className="form-label">Topic Content</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Paste your notes, textbook content, or anything you want to remember. The AI will create a concise inshort from this..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">Tags (press Enter to add)</label>
          <div className="tags-input-container">
            {tags.map((tag, i) => (
              <span key={i} className="tag-item">
                {tag}
                <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
            <input
              type="text"
              className="tags-input"
              placeholder={tags.length === 0 ? 'e.g. math, science, coding...' : ''}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating || !title.trim() || !content.trim()}
          >
            {generating ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                Generating...
              </>
            ) : (
              <>🤖 Generate Inshort</>
            )}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Topic'}
          </button>
        </div>

        {/* Inshort Preview */}
        {inshort && (
          <div className="inshort-preview">
            <h4>✨ Generated Inshort Preview</h4>

            {inshort.oneLiner && (
              <p style={{ color: 'var(--accent-cyan)', fontStyle: 'italic', marginBottom: '16px', fontSize: '15px' }}>
                💡 {inshort.oneLiner}
              </p>
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

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
              ✅ Looks good? Click "Save Topic" to add it to your revision schedule.
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' && '✅'}
          {toast.type === 'error' && '❌'}
          {toast.type === 'info' && 'ℹ️'}
          {' '}{toast.message}
        </div>
      )}
    </div>
  );
}
