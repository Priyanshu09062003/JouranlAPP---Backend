import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import API from '../services/api';
import { BookOpen, Key, User as UserIcon, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In Request
        const loginResponse = await API.post('/public/login', { username, password });
        const token = loginResponse.data;

        // Temporarily store token in localStorage to make the next authenticated call
        localStorage.setItem('token', token);

        // Fetch user list to determine roles for the logged-in user
        const usersResponse = await API.get('/user');
        const currentUser = usersResponse.data.find(u => u.username.toLowerCase() === username.toLowerCase());

        const roles = currentUser && currentUser.roles ? currentUser.roles : ['USER'];
        localStorage.setItem('roles', JSON.stringify(roles));

        setUser({ username, roles });
        navigate('/');
      } else {
        // Sign Up Request
        await API.post('/public/signup', { 
          username, 
          password, 
          email, 
          sentimentAnalysis 
        });
        
        // Auto transition to login after signup
        setIsLogin(true);
        setError('');
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      console.error(err);
      if (isLogin) {
        setError(err.response?.data || 'Incorrect username or password. Please try again.');
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
      } else {
        setError(err.response?.data?.message || 'Error occurred during registration. Make sure the username is unique.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass fade-in">
        <div className="auth-header">
          <div className="nav-logo" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <BookOpen size={36} />
            <span style={{ fontSize: '2rem' }}>Journal Space</span>
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access your journal entries' : 'Register to start writing your journal'}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                id="username"
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
              <input
                id="password"
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                id="sentiment"
                type="checkbox"
                checked={sentimentAnalysis}
                onChange={(e) => setSentimentAnalysis(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="sentiment" style={{ margin: 0, cursor: 'pointer' }}>Enable Sentiment Analysis</label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>
              Don't have an account? <span onClick={() => { setIsLogin(false); setError(''); }}>Sign Up</span>
            </>
          ) : (
            <>
              Already have an account? <span onClick={() => { setIsLogin(true); setError(''); }}>Sign In</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
