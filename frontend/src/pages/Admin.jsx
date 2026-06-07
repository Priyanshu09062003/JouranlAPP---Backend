import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UserPlus, Shield, Mail, ToggleLeft, User as UserIcon, AlertCircle, X, CheckCircle } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Create admin state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/admin/all-users');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system users. Make sure you have the ADMIN role.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setModalError('Username and password are required');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/admin', {
        username: adminUsername,
        password: adminPassword,
        email: adminEmail
      });
      
      setModalSuccess('Admin user registered successfully!');
      setAdminUsername('');
      setAdminPassword('');
      setAdminEmail('');
      
      // Refresh the user list
      fetchUsers();
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowModal(false);
        setModalSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || 'Failed to create admin user. Username might exist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Admin Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>System management: view users and create administrators</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={18} /> Create Admin
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading user registry...</div>
      ) : (
        <div className="users-list">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Registered Users ({users.length})</h3>
          {users.length === 0 ? (
            <div className="empty-state glass">
              <UserIcon size={36} />
              <p>No registered users found in the system</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="user-row glass fade-in">
                <div className="user-details">
                  <h4>{user.username}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                    {user.email && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <Mail size={12} /> {user.email}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                      <ToggleLeft size={12} /> Sentiment Analysis: {user.sentimentAnalysis ? 'On' : 'Off'}
                    </span>
                    <span style={{ fontSize: '0.85rem' }}>
                      Entries: {user.journalentries ? user.journalentries.length : 0}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {user.roles && user.roles.map((role, idx) => (
                    <span 
                      key={idx} 
                      className={`badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal for creating admin */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass fade-in" style={{ position: 'relative' }}>
            <button 
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              onClick={() => { setShowModal(false); setModalError(''); setModalSuccess(''); }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Shield size={24} style={{ color: 'var(--secondary-color)' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Create Admin User</h2>
            </div>

            {modalError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={18} />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label htmlFor="admin-username">Admin Username</label>
                <input
                  id="admin-username"
                  type="text"
                  className="form-control"
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-email">Admin Email (Optional)</label>
                <input
                  id="admin-email"
                  type="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  className="form-control"
                  placeholder="Enter secure password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
