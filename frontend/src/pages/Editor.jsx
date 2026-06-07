import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await API.get(`/journal/id/${id}`);
      setTitle(response.data.title || '');
      setContent(response.data.content || '');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch the journal entry. It may not exist or you do not have permission.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const payload = { title, content };
      if (id) {
        // Update
        await API.put(`/journal/id/${id}`, payload);
      } else {
        // Create
        await API.post('/journal', payload);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading entry details...</div>;
  }

  return (
    <div className="editor-container glass fade-in">
      <div className="editor-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
          {id ? 'Edit Entry' : 'New Entry'}
        </h2>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="editor-form">
        <div className="form-group">
          <input
            type="text"
            className="editor-title-input"
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <textarea
            className="editor-textarea"
            placeholder="Write your thoughts here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="editor-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
