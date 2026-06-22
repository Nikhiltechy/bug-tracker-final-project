import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthPage() {
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'signup' ? 'signup' : 'login';

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>

          <p style={styles.subtitle}>
            {isLogin
              ? 'Login to continue managing projects and bugs.'
              : 'Start tracking bugs with your team today.'}
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {!isLogin && (
          <input
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          style={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          style={{
            ...styles.btn,
            opacity: loading ? 0.8 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Processing...'
            : isLogin
            ? 'Login'
            : 'Create Account'}
        </button>

        <p style={styles.toggle}>
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <span
            onClick={() => setIsLogin(!isLogin)}
            style={styles.link}
          >
            {isLogin ? ' Sign Up' : ' Login'}
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background:
      'linear-gradient(to bottom right, #0f172a, #111827, #020617)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '28px',
    padding: '42px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
    zIndex: 2,
  },

  header: {
    marginBottom: '28px',
    textAlign: 'center',
  },

  title: {
    color: '#fff',
    fontSize: '34px',
    fontWeight: '700',
    marginBottom: '10px',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: 0,
  },

  input: {
    width: '100%',
    padding: '16px',
    marginBottom: '14px',
    boxSizing: 'border-box',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    outline: 'none',
    fontSize: '15px',
  },

  btn: {
    width: '100%',
    padding: '16px',
    background:
      'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    marginTop: '8px',
    fontWeight: '600',
    fontSize: '16px',
    boxShadow:
      '0 10px 30px rgba(59,130,246,0.35)',
    transition: '0.3s ease',
  },

  errorBox: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#fca5a5',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '18px',
    fontSize: '14px',
    textAlign: 'center',
  },

  toggle: {
    textAlign: 'center',
    marginTop: '22px',
    color: '#94a3b8',
    fontSize: '14px',
  },

  link: {
    color: '#60a5fa',
    cursor: 'pointer',
    fontWeight: '600',
  },

  glow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: '#2563eb',
    borderRadius: '50%',
    filter: 'blur(150px)',
    opacity: 0.18,
    top: '-100px',
    left: '-100px',
  },

  glow2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    background: '#7c3aed',
    borderRadius: '50%',
    filter: 'blur(150px)',
    opacity: 0.12,
    bottom: '-100px',
    right: '-100px',
  },
};