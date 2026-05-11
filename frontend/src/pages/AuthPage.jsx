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

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <p style={styles.error}>{error}</p>}

        {!isLogin && (
          <input style={styles.input} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
        )}
        <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />

        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={styles.link}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  card: { background: 'white', padding: 30, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: 340 },
  input: { width: '100%', padding: 10, margin: '8px 0', boxSizing: 'border-box', borderRadius: 4, border: '1px solid #cbd5e1' },
  btn: { width: '100%', padding: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 10, fontWeight: 500 },
  error: { color: '#ef4444', fontSize: 14, marginBottom: 10, textAlign: 'center' },
  toggle: { textAlign: 'center', marginTop: 15, fontSize: 14, color: '#64748b' },
  link: { color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }
};