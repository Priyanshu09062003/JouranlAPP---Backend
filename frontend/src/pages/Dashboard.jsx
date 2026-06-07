import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { Plus, Edit2, Trash2, Eye, Sun, Calendar, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [weatherGreeting, setWeatherGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch user weather and greeting
      try {
        const weatherRes = await API.get('/user/weather');
        setWeatherGreeting(weatherRes.data);
      } catch (weatherErr) {
        console.error("Failed to fetch weather information", weatherErr);
        setWeatherGreeting("Hi! Hope you are having a great day.");
      }

      // 2. Fetch journal entries
      const journalRes = await API.get('/journal');
      // Set entries if valid response is returned
      if (Array.isArray(journalRes.data)) {
        setEntries(journalRes.data);
      } else {
        setEntries([]);
      }
    } catch (err) {
      console.error(err);
      // Handled BAD_REQUEST if empty or other issues
      if (err.response?.status === 400) {
        setEntries([]); // Bad request means no entries or error
      } else {
        setError('Failed to load journal entries. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      await API.delete(`/journal/id/${id}`);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete the entry. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fade-in">
      {/* Weather Dashboard Banner */}
      {weatherGreeting && (
        <div className="weather-banner glass">
          <div className="weather-info">
            <Sun size={28} className="weather-temp" />
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{weatherGreeting}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Your Journal Space</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Reflect on your day, write your thoughts, analyze feelings</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/editor')}>
          <Plus size={20} /> Write Entry
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading entries...</div>
      ) : entries.length === 0 ? (
        <div className="empty-state glass">
          <Calendar size={48} />
          <h3>No journal entries yet</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Start your first entry to write thoughts and feelings.</p>
          <button className="btn btn-primary" onClick={() => navigate('/editor')}>
            Write Your First Entry
          </button>
        </div>
      ) : (
        <div className="journal-grid">
          {entries.map((entry) => (
            <div key={entry.id} className="journal-card glass">
              <div className="journal-card-header">
                <div className="journal-date">{formatDate(entry.date)}</div>
                <h3 className="journal-title">{entry.title}</h3>
                <p className="journal-preview">{entry.content}</p>
              </div>
              <div className="journal-actions">
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                  onClick={() => navigate(`/editor/${entry.id}`)}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
                  onClick={() => handleDelete(entry.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
